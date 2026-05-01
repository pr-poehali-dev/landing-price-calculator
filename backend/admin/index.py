"""
Административный API: список заявок, детали заявки.
Доступен только пользователям с role='admin'.
action: submissions | submission_detail
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p60076574_landing_price_calcul")
AUTH_URL = os.environ.get("AUTH_FUNCTION_URL", "")


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def cors():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Session-Id",
    }


def ok(data: dict) -> dict:
    return {"statusCode": 200, "headers": {**cors(), "Content-Type": "application/json"},
            "body": json.dumps(data, ensure_ascii=False, default=str)}


def err(msg: str, status: int = 403) -> dict:
    return {"statusCode": status, "headers": {**cors(), "Content-Type": "application/json"},
            "body": json.dumps({"error": msg}, ensure_ascii=False)}


def get_user(session_id: str):
    """Проверяет сессию и возвращает пользователя из БД."""
    if not session_id:
        return None
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"""SELECT u.id, u.login, u.role
            FROM {SCHEMA}.sessions s
            JOIN {SCHEMA}.users u ON u.id = s.user_id
            WHERE s.id = %s AND s.expires_at > NOW()""",
        (session_id,),
    )
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    return {"id": row[0], "login": row[1], "role": row[2]}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors(), "body": ""}

    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    session_id = (event.get("headers") or {}).get("X-Session-Id") or body.get("session_id")
    user = get_user(session_id)

    if not user:
        return err("Необходима авторизация", 401)
    if user["role"] != "admin":
        return err("Доступ запрещён — только для администраторов", 403)

    action = body.get("action") or (event.get("queryStringParameters") or {}).get("action", "")

    # ── СПИСОК ЗАЯВОК ─────────────────────────────────────────────────────────
    if action == "submissions":
        page = int(body.get("page", 1))
        limit = 20
        offset = (page - 1) * limit

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.form_submissions")
        total = cur.fetchone()[0]

        cur.execute(
            f"""SELECT id, name, phone, email, inn, inn_company, message, files_count, created_at
                FROM {SCHEMA}.form_submissions
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s""",
            (limit, offset),
        )
        rows = cur.fetchall()
        conn.close()

        submissions = [
            {
                "id": r[0], "name": r[1], "phone": r[2], "email": r[3],
                "inn": r[4], "inn_company": r[5], "message": r[6],
                "files_count": r[7], "created_at": r[8],
            }
            for r in rows
        ]
        return ok({"submissions": submissions, "total": total, "page": page, "limit": limit})

    return err("Неизвестное действие", 400)
