import json
import os
import base64
import urllib.request
import urllib.error

def handler(event: dict, context) -> dict:
    """Отправляет заявку клиента (контакты + файлы) в Telegram."""
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
    files = body.get('files', [])

    text = (
        f"📄 *Новая заявка с сайта*\n\n"
        f"👤 Имя: {name}\n"
        f"📞 Телефон: {phone}\n"
        f"✉️ Email: {email}\n"
        f"📎 Файлов: {len(files)}"
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
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'ok': False, 'error': err})
            }

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ok': True})
    }