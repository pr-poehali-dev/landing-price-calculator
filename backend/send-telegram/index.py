import json
import os
import base64
import secrets
import urllib.request
import urllib.error
import psycopg2
import boto3

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p60076574_landing_price_calcul")


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def s3_client():
    return boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )


def handler(event: dict, context) -> dict:
    """Отправляет заявку клиента в Telegram, сохраняет в БД и файлы в S3."""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    bot_token = os.environ['TELEGRAM_BOT_TOKEN']
    chat_id = os.environ['TELEGRAM_CHAT_ID']

    body = json.loads(event.get('body', '{}'))
    name = body.get('name', '').strip()
    phone = body.get('phone', '').strip()
    email = body.get('email', '').strip()
    inn = body.get('inn', '').strip()
    inn_info = body.get('innInfo') or {}
    inn_company = inn_info.get('name', '') if inn_info else ''
    message = body.get('message', '').strip()
    files = body.get('files', [])
    ref_code = (body.get('ref_code') or '').strip().upper() or None

    # Ищем партнёра по ref_code
    partner_id = None
    if ref_code:
        try:
            conn_ref = get_conn()
            cur_ref = conn_ref.cursor()
            cur_ref.execute(
                f"SELECT id FROM {SCHEMA}.partners WHERE ref_code = %s",
                (ref_code,),
            )
            row_ref = cur_ref.fetchone()
            if row_ref:
                partner_id = row_ref[0]
            conn_ref.close()
        except Exception as e:
            print("Ref lookup error:", e)

    # Сохраняем заявку в БД и получаем id
    submission_id = None
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"""INSERT INTO {SCHEMA}.form_submissions
                (name, phone, email, inn, inn_company, message, files_count, ref_code, partner_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id""",
            (name, phone, email, inn or None, inn_company or None, message or None, len(files), ref_code, partner_id),
        )
        submission_id = cur.fetchone()[0]
        conn.commit()
    except Exception as e:
        print("DB insert error:", e)

    # Сохраняем файлы в S3 и записываем ссылки в БД
    if files and submission_id:
        try:
            s3 = s3_client()
            access_key = os.environ["AWS_ACCESS_KEY_ID"]
            for f in files:
                file_data = base64.b64decode(f['data'])
                filename = f.get('name', 'document')
                mime = f.get('type', 'application/octet-stream')
                key = f"submissions/{submission_id}/{secrets.token_hex(6)}_{filename}"
                s3.put_object(Bucket="files", Key=key, Body=file_data, ContentType=mime)
                file_url = f"https://cdn.poehali.dev/projects/{access_key}/bucket/{key}"
                cur.execute(
                    f"""INSERT INTO {SCHEMA}.form_submission_files
                        (submission_id, file_name, file_url, file_size, mime_type)
                        VALUES (%s, %s, %s, %s, %s)""",
                    (submission_id, filename, file_url, len(file_data), mime),
                )
            conn.commit()
        except Exception as e:
            print("S3/files error:", e)
        finally:
            conn.close()
    elif conn:
        try:
            conn.close()
        except Exception:
            pass

    inn_line = ""
    if inn:
        inn_line = f"🏢 ИНН: {inn}"
        if inn_company:
            inn_line += f" ({inn_company})"
        inn_line += "\n"

    text = (
        f"📄 *Новая заявка с сайта*\n\n"
        f"👤 Имя: {name}\n"
        f"📞 Телефон: {phone}\n"
        f"✉️ Email: {email}\n"
        + inn_line
        + (f"💬 Сообщение: {message}\n" if message else "")
        + f"📎 Файлов: {len(files)}"
    )

    api_base = f"https://api.telegram.org/bot{bot_token}"

    try:
        req = urllib.request.Request(
            f"{api_base}/sendMessage",
            data=json.dumps({
                'chat_id': chat_id,
                'text': text,
                'parse_mode': 'Markdown'
            }).encode(),
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        resp = urllib.request.urlopen(req)
        print("sendMessage response:", resp.read().decode())
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        print("sendMessage error:", err)
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'ok': False, 'error': err})
        }

    for f in files:
        file_data = base64.b64decode(f['data'])
        filename = f.get('name', 'document')
        mime = f.get('type', 'application/octet-stream')

        boundary = 'boundary123456'
        body_parts = (
            f'--{boundary}\r\n'
            f'Content-Disposition: form-data; name="chat_id"\r\n\r\n'
            f'{chat_id}\r\n'
            f'--{boundary}\r\n'
            f'Content-Disposition: form-data; name="document"; filename="{filename}"\r\n'
            f'Content-Type: {mime}\r\n\r\n'
        ).encode() + file_data + f'\r\n--{boundary}--\r\n'.encode()

        try:
            doc_req = urllib.request.Request(
                f"{api_base}/sendDocument",
                data=body_parts,
                headers={'Content-Type': f'multipart/form-data; boundary={boundary}'},
                method='POST'
            )
            dresp = urllib.request.urlopen(doc_req)
            print("sendDocument response:", dresp.read().decode())
        except urllib.error.HTTPError as e:
            err = e.read().decode()
            print("sendDocument error:", err)

    # Отправляем email через Resend
    resend_key = os.environ.get('RESEND_API_KEY', '')
    if resend_key:
        try:
            inn_html = ""
            if inn:
                inn_html = f"<tr><td><b>ИНН:</b></td><td>{inn}" + (f" ({inn_company})" if inn_company else "") + "</td></tr>"
            email_html = f"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
              <h2 style="color:#0d1826;border-bottom:2px solid #d4af37;padding-bottom:8px">Новая заявка с сайта Legis24</h2>
              <table style="width:100%;border-collapse:collapse;margin-top:16px">
                <tr><td style="padding:8px 0;color:#666;width:120px"><b>Имя:</b></td><td style="padding:8px 0">{name}</td></tr>
                <tr><td style="padding:8px 0;color:#666"><b>Телефон:</b></td><td style="padding:8px 0">{phone}</td></tr>
                <tr><td style="padding:8px 0;color:#666"><b>Email:</b></td><td style="padding:8px 0">{email}</td></tr>
                {inn_html}
                {"<tr><td style='padding:8px 0;color:#666'><b>Сообщение:</b></td><td style='padding:8px 0'>" + message + "</td></tr>" if message else ""}
                <tr><td style="padding:8px 0;color:#666"><b>Файлов:</b></td><td style="padding:8px 0">{len(files)}</td></tr>
              </table>
            </div>
            """
            email_req = urllib.request.Request(
                'https://api.resend.com/emails',
                data=json.dumps({
                    'from': 'Legis24 <noreply@poehali.dev>',
                    'to': ['order@advokat-vsem.ru'],
                    'subject': f'Новая заявка от {name}',
                    'html': email_html,
                }).encode(),
                headers={
                    'Authorization': f'Bearer {resend_key}',
                    'Content-Type': 'application/json',
                },
                method='POST'
            )
            eresp = urllib.request.urlopen(email_req)
            print("Resend response:", eresp.read().decode())
        except Exception as e:
            print("Resend error:", e)

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ok': True})
    }