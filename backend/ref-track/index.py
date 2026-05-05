"""
Трекинг переходов по реферальным ссылкам.
POST / — записать клик по ref_code
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p60076574_landing_price_calcul")

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    ref_code = (body.get("ref_code") or "").strip().upper()
    if not ref_code:
        return {
            "statusCode": 400,
            "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
            "body": json.dumps({"error": "ref_code required"}),
        }

    ip = (event.get("requestContext") or {}).get("identity", {}).get("sourceIp") or ""
    ua = (event.get("headers") or {}).get("User-Agent", "")

    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        f"SELECT id FROM {SCHEMA}.partners WHERE ref_code = %s",
        (ref_code,),
    )
    row = cur.fetchone()
    partner_id = row[0] if row else None

    cur.execute(
        f"INSERT INTO {SCHEMA}.ref_clicks (ref_code, partner_id, ip, user_agent) VALUES (%s, %s, %s, %s)",
        (ref_code, partner_id, ip or None, ua or None),
    )
    conn.commit()
    conn.close()

    return {
        "statusCode": 200,
        "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
        "body": json.dumps({"ok": True}),
    }
