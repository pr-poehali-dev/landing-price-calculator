"""
Авторизация пользователей: вход, регистрация, проверка сессии, выход.
action: login | register | me | logout
"""
import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta
import psycopg2
import urllib.request

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p60076574_landing_price_calcul")


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def make_session_id() -> str:
    return secrets.token_hex(32)


def send_tg(text: str):
    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID")
    if not token or not chat_id:
        return
    payload = json.dumps({"chat_id": chat_id, "text": text, "parse_mode": "HTML"}).encode()
    req = urllib.request.Request(
        f"https://api.telegram.org/bot{token}/sendMessage",
        data=payload,
        headers={"Content-Type": "application/json"},
    )
    try:
        urllib.request.urlopen(req, timeout=5)
    except Exception:
        pass


def cors():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Session-Id",
    }


def ok(data: dict, status: int = 200) -> dict:
    return {"statusCode": status, "headers": {**cors(), "Content-Type": "application/json"},
            "body": json.dumps(data, ensure_ascii=False)}


def err(msg: str, status: int = 400) -> dict:
    return {"statusCode": status, "headers": {**cors(), "Content-Type": "application/json"},
            "body": json.dumps({"error": msg}, ensure_ascii=False)}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors(), "body": ""}

    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    action = body.get("action") or (event.get("queryStringParameters") or {}).get("action", "")

    # ── LOGIN ─────────────────────────────────────────────────────────────────
    if action == "login":
        login = (body.get("login") or "").strip().lower()
        password = body.get("password") or ""
        if not login or not password:
            return err("Укажите логин и пароль")

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, login, role FROM {SCHEMA}.users WHERE login = %s AND password_hash = %s",
            (login, hash_password(password)),
        )
        user = cur.fetchone()
        if not user:
            conn.close()
            return err("Неверный логин или пароль", 401)

        sid = make_session_id()
        expires = datetime.utcnow() + timedelta(days=30)
        cur.execute(
            f"INSERT INTO {SCHEMA}.sessions (id, user_id, expires_at) VALUES (%s, %s, %s)",
            (sid, user[0], expires),
        )
        conn.commit()
        conn.close()
        return ok({"session_id": sid, "user": {"id": user[0], "login": user[1], "role": user[2]}})

    # ── REGISTER ──────────────────────────────────────────────────────────────
    if action == "register":
        login = (body.get("login") or "").strip().lower()
        password = body.get("password") or ""
        role = body.get("role") or "client"
        if role not in ("client", "partner"):
            role = "client"
        if not login or not password:
            return err("Укажите логин и пароль")
        if len(password) < 6:
            return err("Пароль должен быть не менее 6 символов")

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE login = %s", (login,))
        if cur.fetchone():
            conn.close()
            return err("Пользователь с таким логином уже существует", 409)

        cur.execute(
            f"INSERT INTO {SCHEMA}.users (login, password_hash, role) VALUES (%s, %s, %s) RETURNING id",
            (login, hash_password(password), role),
        )
        user_id = cur.fetchone()[0]

        # Если партнёр указал, что является юристом или адвокатом — создаём запись и фиксируем запрос
        if role == "partner":
            lawyer_type_requested = body.get("lawyer_type_requested")
            if lawyer_type_requested not in ("lawyer", "advocate"):
                lawyer_type_requested = None
            ref_code = (login[:4].upper() + secrets.token_hex(3).upper())[:10]
            cur.execute(
                f"INSERT INTO {SCHEMA}.partners (user_id, ref_code, lawyer_type_requested) VALUES (%s, %s, %s)",
                (user_id, ref_code, lawyer_type_requested),
            )

        sid = make_session_id()
        expires = datetime.utcnow() + timedelta(days=30)
        cur.execute(
            f"INSERT INTO {SCHEMA}.sessions (id, user_id, expires_at) VALUES (%s, %s, %s)",
            (sid, user_id, expires),
        )
        conn.commit()
        conn.close()
        role_label = "Партнёр" if role == "partner" else "Клиент"
        send_tg(f"🆕 Новая регистрация\n<b>Роль:</b> {role_label}\n<b>Логин:</b> {login}")
        return ok({"session_id": sid, "user": {"id": user_id, "login": login, "role": role}}, 201)

    # ── ME ────────────────────────────────────────────────────────────────────
    if action == "me":
        sid = (event.get("headers") or {}).get("X-Session-Id") or body.get("session_id")
        if not sid:
            return err("Нет сессии", 401)

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"""SELECT u.id, u.login, u.role
                FROM {SCHEMA}.sessions s
                JOIN {SCHEMA}.users u ON u.id = s.user_id
                WHERE s.id = %s AND s.expires_at > NOW()""",
            (sid,),
        )
        user = cur.fetchone()
        conn.close()
        if not user:
            return err("Сессия не найдена или истекла", 401)
        return ok({"user": {"id": user[0], "login": user[1], "role": user[2]}})

    # ── LOGOUT ────────────────────────────────────────────────────────────────
    if action == "logout":
        sid = (event.get("headers") or {}).get("X-Session-Id") or body.get("session_id")
        if sid:
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"UPDATE {SCHEMA}.sessions SET expires_at = NOW() WHERE id = %s", (sid,))
            conn.commit()
            conn.close()
        return ok({"ok": True})

    return err("Неизвестное действие", 400)