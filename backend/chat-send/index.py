import json
import os
import urllib.request
import urllib.error
import psycopg2


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def tg_post(bot_token: str, method: str, payload: dict) -> dict:
    req = urllib.request.Request(
        f"https://api.telegram.org/bot{bot_token}/{method}",
        data=json.dumps(payload).encode(),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read().decode())


SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p60076574_landing_price_calcul')

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}


def handler(event: dict, context) -> dict:
    """Принимает сообщение из чата на сайте, пересылает в Telegram и сохраняет в БД."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**CORS, 'Access-Control-Max-Age': '86400'}, 'body': ''}

    body = json.loads(event.get('body', '{}'))
    session_id = body.get('session_id', '').strip()
    text = body.get('text', '').strip()

    if not session_id or not text:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'ok': False, 'error': 'missing fields'})}

    bot_token = os.environ['TELEGRAM_BOT_TOKEN']
    support_chat_id = os.environ['TELEGRAM_CHAT_ID']

    db = get_db()
    cur = db.cursor()

    cur.execute(f"SELECT telegram_chat_id FROM {SCHEMA}.chat_sessions WHERE session_id = %s", (session_id,))
    row = cur.fetchone()

    if not row:
        cur.execute(f"INSERT INTO {SCHEMA}.chat_sessions (session_id) VALUES (%s)", (session_id,))
        db.commit()
        tg_chat_id = support_chat_id
        intro = f"💬 *Новый диалог с сайта*\n🔑 Сессия: `{session_id}`\n\n"
        tg_text = intro + text
    else:
        tg_chat_id = support_chat_id
        tg_text = f"[{session_id[:8]}] {text}"

    result = tg_post(bot_token, 'sendMessage', {
        'chat_id': tg_chat_id,
        'text': tg_text,
        'parse_mode': 'Markdown'
    })

    tg_msg_id = result.get('result', {}).get('message_id')

    cur.execute(
        f"INSERT INTO {SCHEMA}.chat_messages (session_id, role, text, telegram_message_id) VALUES (%s, 'user', %s, %s)",
        (session_id, text, tg_msg_id)
    )
    db.commit()
    cur.close()
    db.close()

    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}
