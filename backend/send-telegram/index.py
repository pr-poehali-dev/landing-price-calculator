import json
import os
import base64
import urllib.request
import urllib.error
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p60076574_landing_price_calcul")


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    """Отправляет заявку клиента в Telegram и сохраняет в базу данных."""
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

    # Сохраняем заявку в БД
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"""INSERT INTO {SCHEMA}.form_submissions
                (name, phone, email, inn, inn_company, message, files_count)
                VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            (name, phone, email, inn or None, inn_company or None, message or None, len(files)),
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print("DB error:", e)

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

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ok': True})
    }
