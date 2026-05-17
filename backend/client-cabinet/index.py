"""
Кабинет клиента: мои дела, документы, оплаты.
action: get_dashboard | get_payments | add_payment (admin) | delete_payment (admin)
Доступен авторизованным пользователям с ролью client, admin.
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p60076574_landing_price_calcul")


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def cors():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Session-Id",
    }


def ok(data: dict) -> dict:
    return {
        "statusCode": 200,
        "headers": {**cors(), "Content-Type": "application/json"},
        "body": json.dumps(data, ensure_ascii=False, default=str),
    }


def err(msg: str, status: int = 400) -> dict:
    return {
        "statusCode": status,
        "headers": {**cors(), "Content-Type": "application/json"},
        "body": json.dumps({"error": msg}, ensure_ascii=False),
    }


def get_user(session_id: str):
    if not session_id:
        return None
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"""SELECT u.id, u.login, u.role, u.name, u.email
            FROM {SCHEMA}.sessions s
            JOIN {SCHEMA}.users u ON u.id = s.user_id
            WHERE s.id = %s AND s.expires_at > NOW()""",
        (session_id,),
    )
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    return {"id": row[0], "login": row[1], "role": row[2], "name": row[3], "email": row[4]}


def handler(event: dict, context) -> dict:
    """Кабинет клиента: дела, документы, оплаты."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors(), "body": ""}

    session_id = event.get("headers", {}).get("X-Session-Id", "")
    user = get_user(session_id)
    if not user:
        return err("Не авторизован", 401)

    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    action = body.get("action") or event.get("queryStringParameters", {}).get("action", "")

    conn = get_conn()
    cur = conn.cursor()

    try:
        if action == "get_dashboard":
            # Найти дела, привязанные к user_id
            if user["role"] == "admin":
                # admin передаёт client_id явно
                client_id = body.get("client_id")
                if not client_id:
                    return err("client_id обязателен для admin")
                cur.execute(
                    f"SELECT id FROM {SCHEMA}.partner_clients WHERE id = %s",
                    (client_id,),
                )
            else:
                cur.execute(
                    f"SELECT id FROM {SCHEMA}.partner_clients WHERE user_id = %s ORDER BY created_at DESC LIMIT 1",
                    (user["id"],),
                )
            row = cur.fetchone()
            if not row:
                return ok({"client": None, "statuses": [], "docs": [], "services": [], "payments": []})

            client_id = row[0]

            # Данные клиента
            cur.execute(
                f"""SELECT id, full_name, inn, phone, email, current_status, deal_amount, created_at, updated_at
                    FROM {SCHEMA}.partner_clients WHERE id = %s""",
                (client_id,),
            )
            c = cur.fetchone()
            client = {
                "id": c[0], "full_name": c[1], "inn": c[2], "phone": c[3],
                "email": c[4], "current_status": c[5], "deal_amount": float(c[6]) if c[6] else None,
                "created_at": c[7], "updated_at": c[8],
            }

            # История статусов
            cur.execute(
                f"""SELECT status, comment, created_at
                    FROM {SCHEMA}.partner_client_statuses
                    WHERE client_id = %s ORDER BY created_at ASC""",
                (client_id,),
            )
            statuses = [{"status": r[0], "comment": r[1], "created_at": r[2]} for r in cur.fetchall()]

            # Документы
            cur.execute(
                f"""SELECT id, file_name, file_url, file_size, category, created_at
                    FROM {SCHEMA}.partner_client_docs
                    WHERE client_id = %s ORDER BY created_at DESC""",
                (client_id,),
            )
            docs = [
                {"id": r[0], "file_name": r[1], "file_url": r[2],
                 "file_size": r[3], "category": r[4], "created_at": r[5]}
                for r in cur.fetchall()
            ]

            # Услуги
            cur.execute(
                f"""SELECT pcs.id, s.name, s.description, pcs.deal_amount, pcs.created_at
                    FROM {SCHEMA}.partner_client_services pcs
                    JOIN {SCHEMA}.services s ON s.id = pcs.service_id
                    WHERE pcs.client_id = %s ORDER BY pcs.created_at DESC""",
                (client_id,),
            )
            services = [
                {"id": r[0], "name": r[1], "description": r[2],
                 "deal_amount": float(r[3]) if r[3] else None, "created_at": r[4]}
                for r in cur.fetchall()
            ]

            # Оплаты
            cur.execute(
                f"""SELECT id, amount, description, status, paid_at, created_at
                    FROM {SCHEMA}.client_payments
                    WHERE client_id = %s ORDER BY created_at DESC""",
                (client_id,),
            )
            payments = [
                {"id": r[0], "amount": float(r[1]), "description": r[2],
                 "status": r[3], "paid_at": r[4], "created_at": r[5]}
                for r in cur.fetchall()
            ]

            conn.close()
            return ok({
                "client": client,
                "statuses": statuses,
                "docs": docs,
                "services": services,
                "payments": payments,
            })

        elif action == "add_payment":
            if user["role"] != "admin":
                return err("Недостаточно прав", 403)
            client_id = body.get("client_id")
            amount = body.get("amount")
            description = body.get("description", "")
            status = body.get("status", "pending")
            paid_at = body.get("paid_at")
            if not client_id or amount is None:
                return err("client_id и amount обязательны")
            cur.execute(
                f"""INSERT INTO {SCHEMA}.client_payments (client_id, amount, description, status, paid_at)
                    VALUES (%s, %s, %s, %s, %s) RETURNING id""",
                (client_id, amount, description, status, paid_at),
            )
            payment_id = cur.fetchone()[0]
            conn.commit()
            conn.close()
            return ok({"ok": True, "payment_id": payment_id})

        elif action == "update_payment":
            if user["role"] != "admin":
                return err("Недостаточно прав", 403)
            payment_id = body.get("payment_id")
            status = body.get("status")
            paid_at = body.get("paid_at")
            if not payment_id or not status:
                return err("payment_id и status обязательны")
            cur.execute(
                f"""UPDATE {SCHEMA}.client_payments SET status = %s, paid_at = %s WHERE id = %s""",
                (status, paid_at, payment_id),
            )
            conn.commit()
            conn.close()
            return ok({"ok": True})

        else:
            conn.close()
            return err(f"Неизвестный action: {action}")

    except Exception as e:
        conn.close()
        return err(str(e), 500)
