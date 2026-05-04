"""
Партнёрский API: профиль, клиенты, документы, комментарии, статистика.
action: get_profile | save_profile | get_clients | add_client | get_client | update_client |
        add_comment | upload_doc | get_stats | set_client_status
Доступен только авторизованным пользователям.
"""
import json
import os
import secrets
import base64
import mimetypes
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


def cors():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
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


def get_or_create_partner(conn, user_id: int) -> dict | None:
    cur = conn.cursor()
    cur.execute(
        f"SELECT id, status, partner_type, inn, kpp, ogrn, full_name, short_name, legal_address, "
        f"director_name, bank_name, bank_bik, bank_account, bank_corr, "
        f"contact_name, contact_phone, contact_email, ref_code, dadata_raw "
        f"FROM {SCHEMA}.partners WHERE user_id = %s",
        (user_id,),
    )
    row = cur.fetchone()
    if not row:
        return None
    cols = ["id", "status", "partner_type", "inn", "kpp", "ogrn", "full_name", "short_name",
            "legal_address", "director_name", "bank_name", "bank_bik", "bank_account", "bank_corr",
            "contact_name", "contact_phone", "contact_email", "ref_code", "dadata_raw"]
    return dict(zip(cols, row))


def generate_ref_code(login: str) -> str:
    return (login[:4].upper() + secrets.token_hex(3).upper())[:10]


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors(), "body": ""}

    sid = (event.get("headers") or {}).get("X-Session-Id", "")
    user = get_user(sid)
    if not user:
        return err("Не авторизован", 401)

    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    action = body.get("action") or (event.get("queryStringParameters") or {}).get("action", "")
    is_admin = user["role"] == "admin"

    # ── GET PROFILE ───────────────────────────────────────────────────────────
    if action == "get_profile":
        conn = get_conn()
        partner = get_or_create_partner(conn, user["id"])
        conn.close()
        return ok({"partner": partner, "user": user})

    # ── SAVE PROFILE ──────────────────────────────────────────────────────────
    if action == "save_profile":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT id, ref_code FROM {SCHEMA}.partners WHERE user_id = %s", (user["id"],))
        existing = cur.fetchone()

        fields = ["partner_type", "inn", "kpp", "ogrn", "full_name", "short_name",
                  "legal_address", "director_name", "bank_name", "bank_bik",
                  "bank_account", "bank_corr", "contact_name", "contact_phone",
                  "contact_email"]
        values = [body.get(f) for f in fields]

        dadata_raw = body.get("dadata_raw")
        dadata_json = json.dumps(dadata_raw, ensure_ascii=False) if dadata_raw else None

        if existing:
            set_clause = ", ".join(f"{f} = %s" for f in fields)
            cur.execute(
                f"UPDATE {SCHEMA}.partners SET {set_clause}, dadata_raw = %s::jsonb, updated_at = NOW() WHERE id = %s",
                values + [dadata_json, existing[0]],
            )
        else:
            ref_code = generate_ref_code(user["login"])
            cols = ", ".join(fields)
            placeholders = ", ".join(["%s"] * len(fields))
            cur.execute(
                f"INSERT INTO {SCHEMA}.partners (user_id, {cols}, dadata_raw, ref_code) "
                f"VALUES (%s, {placeholders}, %s::jsonb, %s) RETURNING id",
                [user["id"]] + values + [dadata_json, ref_code],
            )

        conn.commit()
        partner = get_or_create_partner(conn, user["id"])
        conn.close()
        return ok({"partner": partner, "ok": True})

    # ── GET CLIENTS ───────────────────────────────────────────────────────────
    if action == "get_clients":
        conn = get_conn()
        cur = conn.cursor()

        if is_admin:
            partner_id = body.get("partner_id")
        else:
            cur.execute(f"SELECT id FROM {SCHEMA}.partners WHERE user_id = %s", (user["id"],))
            prow = cur.fetchone()
            if not prow:
                conn.close()
                return ok({"clients": [], "total": 0})
            partner_id = prow[0]

        page = max(1, int(body.get("page", 1)))
        limit = 20
        offset = (page - 1) * limit
        q_filter = body.get("q", "").strip()
        status_filter = body.get("status", "")

        where = "WHERE pc.partner_id = %s" if not is_admin or partner_id else "WHERE 1=1"
        params = [partner_id] if partner_id else []

        if status_filter:
            where += " AND pc.current_status = %s"
            params.append(status_filter)
        if q_filter:
            where += " AND (pc.full_name ILIKE %s OR pc.inn ILIKE %s OR pc.phone ILIKE %s OR pc.email ILIKE %s)"
            like = f"%{q_filter}%"
            params.extend([like, like, like, like])

        cur.execute(
            f"SELECT COUNT(*) FROM {SCHEMA}.partner_clients pc {where}", params
        )
        total = cur.fetchone()[0]

        cur.execute(
            f"""SELECT pc.id, pc.full_name, pc.inn, pc.phone, pc.email,
                       pc.current_status, pc.deal_amount, pc.partner_reward,
                       pc.reward_paid, pc.created_at, pc.updated_at,
                       p.short_name as partner_name
                FROM {SCHEMA}.partner_clients pc
                JOIN {SCHEMA}.partners p ON p.id = pc.partner_id
                {where}
                ORDER BY pc.created_at DESC
                LIMIT %s OFFSET %s""",
            params + [limit, offset],
        )
        cols = ["id", "full_name", "inn", "phone", "email", "current_status",
                "deal_amount", "partner_reward", "reward_paid", "created_at",
                "updated_at", "partner_name"]
        clients = [dict(zip(cols, row)) for row in cur.fetchall()]
        conn.close()
        return ok({"clients": clients, "total": total, "page": page})

    # ── ADD CLIENT ────────────────────────────────────────────────────────────
    if action == "add_client":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT id FROM {SCHEMA}.partners WHERE user_id = %s", (user["id"],))
        prow = cur.fetchone()
        if not prow:
            conn.close()
            return err("Сначала заполните профиль партнёра")
        partner_id = prow[0]

        full_name = (body.get("full_name") or "").strip()
        if not full_name:
            conn.close()
            return err("Укажите ФИО / наименование клиента")

        dadata_raw = body.get("dadata_raw")
        dadata_json = json.dumps(dadata_raw, ensure_ascii=False) if dadata_raw else None

        cur.execute(
            f"""INSERT INTO {SCHEMA}.partner_clients
                (partner_id, full_name, inn, phone, email, contact_person,
                 deal_amount, partner_reward, notes, dadata_raw)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb)
                RETURNING id""",
            (
                partner_id,
                full_name,
                body.get("inn"),
                body.get("phone"),
                body.get("email"),
                body.get("contact_person"),
                body.get("deal_amount") or None,
                body.get("partner_reward") or None,
                body.get("notes"),
                dadata_json,
            ),
        )
        client_id = cur.fetchone()[0]
        cur.execute(
            f"INSERT INTO {SCHEMA}.partner_client_statuses (client_id, status, changed_by, changed_by_role) "
            f"VALUES (%s, 'new', %s, %s)",
            (client_id, user["id"], user["role"]),
        )
        conn.commit()
        conn.close()
        return ok({"ok": True, "client_id": client_id})

    # ── GET CLIENT ────────────────────────────────────────────────────────────
    if action == "get_client":
        client_id = body.get("client_id")
        if not client_id:
            return err("Не указан client_id")
        conn = get_conn()
        cur = conn.cursor()

        # Проверка доступа
        if not is_admin:
            cur.execute(
                f"""SELECT pc.id FROM {SCHEMA}.partner_clients pc
                    JOIN {SCHEMA}.partners p ON p.id = pc.partner_id
                    WHERE pc.id = %s AND p.user_id = %s""",
                (client_id, user["id"]),
            )
            if not cur.fetchone():
                conn.close()
                return err("Доступ запрещён", 403)

        cur.execute(
            f"""SELECT pc.id, pc.full_name, pc.inn, pc.phone, pc.email,
                       pc.contact_person, pc.current_status, pc.deal_amount,
                       pc.partner_reward, pc.reward_paid, pc.notes, pc.source,
                       pc.created_at, pc.updated_at, pc.dadata_raw,
                       p.short_name as partner_name, p.contact_name as p_contact
                FROM {SCHEMA}.partner_clients pc
                JOIN {SCHEMA}.partners p ON p.id = pc.partner_id
                WHERE pc.id = %s""",
            (client_id,),
        )
        row = cur.fetchone()
        if not row:
            conn.close()
            return err("Клиент не найден", 404)
        cols = ["id", "full_name", "inn", "phone", "email", "contact_person",
                "current_status", "deal_amount", "partner_reward", "reward_paid",
                "notes", "source", "created_at", "updated_at", "dadata_raw",
                "partner_name", "partner_contact"]
        client = dict(zip(cols, row))

        # История статусов
        cur.execute(
            f"""SELECT pcs.status, pcs.comment, pcs.created_at, u.login
                FROM {SCHEMA}.partner_client_statuses pcs
                LEFT JOIN {SCHEMA}.users u ON u.id = pcs.changed_by
                WHERE pcs.client_id = %s
                ORDER BY pcs.created_at ASC""",
            (client_id,),
        )
        statuses = [{"status": r[0], "comment": r[1], "created_at": str(r[2]), "changed_by": r[3]}
                    for r in cur.fetchall()]

        # Документы
        cur.execute(
            f"""SELECT id, file_name, file_url, file_size, category, created_at
                FROM {SCHEMA}.partner_client_docs
                WHERE client_id = %s ORDER BY created_at DESC""",
            (client_id,),
        )
        docs = [{"id": r[0], "file_name": r[1], "file_url": r[2], "file_size": r[3],
                 "category": r[4], "created_at": str(r[5])} for r in cur.fetchall()]

        # Комментарии
        cur.execute(
            f"""SELECT pcc.id, pcc.message, pcc.author_role, pcc.created_at, u.login
                FROM {SCHEMA}.partner_client_comments pcc
                LEFT JOIN {SCHEMA}.users u ON u.id = pcc.author_id
                WHERE pcc.client_id = %s ORDER BY pcc.created_at ASC""",
            (client_id,),
        )
        comments = [{"id": r[0], "message": r[1], "author_role": r[2],
                     "created_at": str(r[3]), "author": r[4]} for r in cur.fetchall()]

        conn.close()
        return ok({"client": client, "statuses": statuses, "docs": docs, "comments": comments})

    # ── UPDATE CLIENT ─────────────────────────────────────────────────────────
    if action == "update_client":
        client_id = body.get("client_id")
        if not client_id:
            return err("Не указан client_id")
        conn = get_conn()
        cur = conn.cursor()

        if not is_admin:
            cur.execute(
                f"""SELECT pc.id FROM {SCHEMA}.partner_clients pc
                    JOIN {SCHEMA}.partners p ON p.id = pc.partner_id
                    WHERE pc.id = %s AND p.user_id = %s""",
                (client_id, user["id"]),
            )
            if not cur.fetchone():
                conn.close()
                return err("Доступ запрещён", 403)

        fields = ["full_name", "inn", "phone", "email", "contact_person", "notes",
                  "deal_amount", "partner_reward"]
        set_parts = []
        params = []
        for f in fields:
            if f in body:
                set_parts.append(f"{f} = %s")
                params.append(body[f] or None)
        if set_parts:
            cur.execute(
                f"UPDATE {SCHEMA}.partner_clients SET {', '.join(set_parts)}, updated_at = NOW() WHERE id = %s",
                params + [client_id],
            )
            conn.commit()
        conn.close()
        return ok({"ok": True})

    # ── SET CLIENT STATUS (admin only) ────────────────────────────────────────
    if action == "set_client_status":
        if not is_admin:
            return err("Только администратор может менять статус", 403)
        client_id = body.get("client_id")
        new_status = body.get("status")
        comment = body.get("comment", "")
        valid = ["new", "negotiation", "contract", "paid", "done"]
        if not new_status or new_status not in valid:
            return err(f"Статус должен быть одним из: {', '.join(valid)}")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"UPDATE {SCHEMA}.partner_clients SET current_status = %s, updated_at = NOW() WHERE id = %s",
            (new_status, client_id),
        )
        cur.execute(
            f"INSERT INTO {SCHEMA}.partner_client_statuses (client_id, status, comment, changed_by, changed_by_role) "
            f"VALUES (%s, %s, %s, %s, %s)",
            (client_id, new_status, comment, user["id"], user["role"]),
        )
        conn.commit()
        conn.close()
        return ok({"ok": True})

    # ── ADD COMMENT ───────────────────────────────────────────────────────────
    if action == "add_comment":
        client_id = body.get("client_id")
        message = (body.get("message") or "").strip()
        if not client_id or not message:
            return err("Не указан client_id или сообщение")
        conn = get_conn()
        cur = conn.cursor()
        if not is_admin:
            cur.execute(
                f"""SELECT pc.id FROM {SCHEMA}.partner_clients pc
                    JOIN {SCHEMA}.partners p ON p.id = pc.partner_id
                    WHERE pc.id = %s AND p.user_id = %s""",
                (client_id, user["id"]),
            )
            if not cur.fetchone():
                conn.close()
                return err("Доступ запрещён", 403)
        cur.execute(
            f"INSERT INTO {SCHEMA}.partner_client_comments (client_id, author_id, author_role, message) "
            f"VALUES (%s, %s, %s, %s) RETURNING id, created_at",
            (client_id, user["id"], user["role"], message),
        )
        row = cur.fetchone()
        conn.commit()
        conn.close()
        return ok({"ok": True, "comment": {"id": row[0], "message": message,
                                            "author": user["login"], "author_role": user["role"],
                                            "created_at": str(row[1])}})

    # ── UPLOAD DOC ────────────────────────────────────────────────────────────
    if action == "upload_doc":
        client_id = body.get("client_id")
        file_name = body.get("file_name", "file")
        file_b64 = body.get("file_b64")
        category = body.get("category", "other")
        if not client_id or not file_b64:
            return err("Не указан client_id или файл")

        conn = get_conn()
        cur = conn.cursor()
        if not is_admin:
            cur.execute(
                f"""SELECT pc.id FROM {SCHEMA}.partner_clients pc
                    JOIN {SCHEMA}.partners p ON p.id = pc.partner_id
                    WHERE pc.id = %s AND p.user_id = %s""",
                (client_id, user["id"]),
            )
            if not cur.fetchone():
                conn.close()
                return err("Доступ запрещён", 403)

        file_data = base64.b64decode(file_b64)
        file_size = len(file_data)
        ext = file_name.rsplit(".", 1)[-1].lower() if "." in file_name else "bin"
        content_type = mimetypes.guess_type(file_name)[0] or "application/octet-stream"
        key = f"partner-docs/{client_id}/{secrets.token_hex(8)}_{file_name}"

        s3 = s3_client()
        s3.put_object(Bucket="files", Key=key, Body=file_data, ContentType=content_type)
        file_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"

        cur.execute(
            f"INSERT INTO {SCHEMA}.partner_client_docs (client_id, file_name, file_url, file_size, category, uploaded_by) "
            f"VALUES (%s, %s, %s, %s, %s, %s) RETURNING id, created_at",
            (client_id, file_name, file_url, file_size, category, user["id"]),
        )
        row = cur.fetchone()
        conn.commit()
        conn.close()
        return ok({"ok": True, "doc": {"id": row[0], "file_name": file_name, "file_url": file_url,
                                        "file_size": file_size, "category": category, "created_at": str(row[1])}})

    # ── GET STATS ─────────────────────────────────────────────────────────────
    if action == "get_stats":
        conn = get_conn()
        cur = conn.cursor()

        if is_admin:
            partner_id = body.get("partner_id")
        else:
            cur.execute(f"SELECT id FROM {SCHEMA}.partners WHERE user_id = %s", (user["id"],))
            prow = cur.fetchone()
            if not prow:
                conn.close()
                return ok({"stats": {"total": 0, "by_status": {}, "total_reward": 0, "paid_reward": 0}})
            partner_id = prow[0]

        where = "WHERE partner_id = %s" if partner_id else "WHERE 1=1"
        params = [partner_id] if partner_id else []

        cur.execute(f"SELECT COUNT(*), current_status FROM {SCHEMA}.partner_clients {where} GROUP BY current_status", params)
        by_status = {row[1]: row[0] for row in cur.fetchall()}
        total = sum(by_status.values())

        cur.execute(
            f"SELECT COALESCE(SUM(partner_reward),0) FROM {SCHEMA}.partner_clients {where}", params
        )
        total_reward = float(cur.fetchone()[0])

        # paid_reward — из реальных выплат
        pay_where = "WHERE partner_id = %s" if partner_id else "WHERE 1=1"
        pay_params = [partner_id] if partner_id else []
        cur.execute(
            f"SELECT COALESCE(SUM(amount),0) FROM {SCHEMA}.partner_payments {pay_where}", pay_params
        )
        paid_reward = float(cur.fetchone()[0])

        conn.close()
        return ok({
            "stats": {
                "total": total,
                "by_status": by_status,
                "total_reward": total_reward,
                "paid_reward": paid_reward,
            }
        })

    # ── SET PARTNER STATUS (admin only) ──────────────────────────────────────
    if action == "set_partner_status":
        if not is_admin:
            return err("Только администратор", 403)
        partner_id = body.get("partner_id")
        new_status = body.get("status")
        if not partner_id or new_status not in ("active", "pending", "blocked"):
            return err("Укажите partner_id и статус (active/pending/blocked)")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"UPDATE {SCHEMA}.partners SET status = %s, updated_at = NOW() WHERE id = %s",
            (new_status, partner_id),
        )
        conn.commit()
        conn.close()
        return ok({"ok": True})

    # ── GET PARTNERS (admin only) ─────────────────────────────────────────────
    if action == "get_partners":
        if not is_admin:
            return err("Только администратор", 403)
        conn = get_conn()
        cur = conn.cursor()
        page = max(1, int(body.get("page", 1)))
        limit = 20
        offset = (page - 1) * limit
        q_filter = body.get("q", "").strip()

        where = "WHERE 1=1"
        params = []
        if q_filter:
            where += " AND (u.login ILIKE %s OR p.full_name ILIKE %s OR p.inn ILIKE %s OR p.contact_phone ILIKE %s)"
            like = f"%{q_filter}%"
            params.extend([like, like, like, like])

        cur.execute(
            f"""SELECT COUNT(*) FROM {SCHEMA}.users u
                LEFT JOIN {SCHEMA}.partners p ON p.user_id = u.id
                {where} AND u.role = 'partner'""",
            params,
        )
        total = cur.fetchone()[0]

        cur.execute(
            f"""SELECT u.id as user_id, u.login, u.role,
                       p.id as partner_id, p.status, p.partner_type,
                       p.full_name, p.short_name, p.inn, p.ref_code,
                       p.contact_name, p.contact_phone, p.contact_email,
                       (SELECT COUNT(*) FROM {SCHEMA}.partner_clients pc WHERE pc.partner_id = p.id) as clients_count,
                       (SELECT COALESCE(SUM(partner_reward),0) FROM {SCHEMA}.partner_clients pc WHERE pc.partner_id = p.id) as total_reward
                FROM {SCHEMA}.users u
                LEFT JOIN {SCHEMA}.partners p ON p.user_id = u.id
                {where} AND u.role = 'partner'
                ORDER BY u.id DESC
                LIMIT %s OFFSET %s""",
            params + [limit, offset],
        )
        cols = ["user_id", "login", "role", "partner_id", "status", "partner_type",
                "full_name", "short_name", "inn", "ref_code",
                "contact_name", "contact_phone", "contact_email",
                "clients_count", "total_reward"]
        partners = [dict(zip(cols, row)) for row in cur.fetchall()]
        conn.close()
        return ok({"partners": partners, "total": total, "page": page})

    # ── GET SERVICES + MY RATES ───────────────────────────────────────────────
    if action == "get_services":
        conn = get_conn()
        cur = conn.cursor()
        # partner_id — свой или переданный (для админа)
        if is_admin:
            partner_id = body.get("partner_id")
        else:
            cur.execute(f"SELECT id FROM {SCHEMA}.partners WHERE user_id = %s", (user["id"],))
            prow = cur.fetchone()
            partner_id = prow[0] if prow else None

        cur.execute(
            f"SELECT id, category, name, description, base_price, price_note, sort_order FROM {SCHEMA}.services WHERE active = true ORDER BY sort_order",
        )
        svc_cols = ["id", "category", "name", "description", "base_price", "price_note", "sort_order"]
        services = [dict(zip(svc_cols, row)) for row in cur.fetchall()]

        rates = {}
        if partner_id:
            cur.execute(
                f"SELECT service_id, rate_pct FROM {SCHEMA}.partner_service_rates WHERE partner_id = %s",
                (partner_id,),
            )
            rates = {row[0]: float(row[1]) for row in cur.fetchall()}

        for s in services:
            s["rate_pct"] = rates.get(s["id"], 0.0)
            if s["base_price"] is not None:
                s["base_price"] = float(s["base_price"])

        conn.close()
        return ok({"services": services, "partner_id": partner_id})

    # ── SET PARTNER SERVICE RATE (admin only) ─────────────────────────────────
    if action == "set_partner_rate":
        if not is_admin:
            return err("Только администратор", 403)
        partner_id = body.get("partner_id")
        service_id = body.get("service_id")
        rate_pct   = body.get("rate_pct", 0)
        if not partner_id or not service_id:
            return err("Укажите partner_id и service_id")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"""INSERT INTO {SCHEMA}.partner_service_rates (partner_id, service_id, rate_pct)
                VALUES (%s, %s, %s)
                ON CONFLICT (partner_id, service_id) DO UPDATE SET rate_pct = %s, updated_at = NOW()""",
            (partner_id, service_id, rate_pct, rate_pct),
        )
        conn.commit()
        conn.close()
        return ok({"ok": True})

    # ── GET CLIENT SERVICES ───────────────────────────────────────────────────
    if action == "get_client_services":
        client_id = body.get("client_id")
        if not client_id:
            return err("Не указан client_id")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"""SELECT pcs.id, pcs.service_id, s.name, s.category, s.base_price, s.price_note,
                       pcs.deal_amount, pcs.reward_amount, pcs.rate_pct, pcs.note
                FROM {SCHEMA}.partner_client_services pcs
                JOIN {SCHEMA}.services s ON s.id = pcs.service_id
                WHERE pcs.client_id = %s ORDER BY pcs.id""",
            (client_id,),
        )
        cols = ["id", "service_id", "name", "category", "base_price", "price_note",
                "deal_amount", "reward_amount", "rate_pct", "note"]
        items = [dict(zip(cols, row)) for row in cur.fetchall()]
        for i in items:
            for k in ["base_price", "deal_amount", "reward_amount", "rate_pct"]:
                if i[k] is not None:
                    i[k] = float(i[k])
        conn.close()
        return ok({"client_services": items})

    # ── ADD CLIENT SERVICE ────────────────────────────────────────────────────
    if action == "add_client_service":
        client_id  = body.get("client_id")
        service_id = body.get("service_id")
        if not client_id or not service_id:
            return err("Не указаны client_id или service_id")
        deal_amount   = body.get("deal_amount")
        reward_amount = body.get("reward_amount")
        rate_pct      = body.get("rate_pct")
        note          = body.get("note")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"""INSERT INTO {SCHEMA}.partner_client_services
                (client_id, service_id, deal_amount, reward_amount, rate_pct, note)
                VALUES (%s, %s, %s, %s, %s, %s) RETURNING id""",
            (client_id, service_id, deal_amount or None, reward_amount or None, rate_pct or None, note or None),
        )
        new_id = cur.fetchone()[0]
        # обновляем суммарное вознаграждение на клиенте
        cur.execute(
            f"""UPDATE {SCHEMA}.partner_clients SET
                partner_reward = (SELECT COALESCE(SUM(reward_amount),0) FROM {SCHEMA}.partner_client_services WHERE client_id = %s),
                deal_amount    = (SELECT COALESCE(SUM(deal_amount),0)   FROM {SCHEMA}.partner_client_services WHERE client_id = %s),
                updated_at = NOW() WHERE id = %s""",
            (client_id, client_id, client_id),
        )
        conn.commit()
        conn.close()
        return ok({"ok": True, "id": new_id})

    # ── REMOVE CLIENT SERVICE ─────────────────────────────────────────────────
    if action == "remove_client_service":
        item_id   = body.get("id")
        client_id = body.get("client_id")
        if not item_id or not client_id:
            return err("Не указан id или client_id")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {SCHEMA}.partner_client_services WHERE id = %s", (item_id,))
        cur.execute(
            f"""UPDATE {SCHEMA}.partner_clients SET
                partner_reward = (SELECT COALESCE(SUM(reward_amount),0) FROM {SCHEMA}.partner_client_services WHERE client_id = %s),
                deal_amount    = (SELECT COALESCE(SUM(deal_amount),0)   FROM {SCHEMA}.partner_client_services WHERE client_id = %s),
                updated_at = NOW() WHERE id = %s""",
            (client_id, client_id, client_id),
        )
        conn.commit()
        conn.close()
        return ok({"ok": True})

    # ── DELETE CLIENT ─────────────────────────────────────────────────────────
    if action == "delete_client":
        client_id = body.get("client_id")
        if not client_id:
            return err("Не указан client_id")
        conn = get_conn()
        cur = conn.cursor()
        if not is_admin:
            cur.execute(
                f"""SELECT pc.id FROM {SCHEMA}.partner_clients pc
                    JOIN {SCHEMA}.partners p ON p.id = pc.partner_id
                    WHERE pc.id = %s AND p.user_id = %s""",
                (client_id, user["id"]),
            )
            if not cur.fetchone():
                conn.close()
                return err("Доступ запрещён", 403)
        cur.execute(f"DELETE FROM {SCHEMA}.partner_client_comments WHERE client_id = %s", (client_id,))
        cur.execute(f"DELETE FROM {SCHEMA}.partner_client_statuses WHERE client_id = %s", (client_id,))
        cur.execute(f"DELETE FROM {SCHEMA}.partner_client_docs WHERE client_id = %s", (client_id,))
        cur.execute(f"DELETE FROM {SCHEMA}.partner_clients WHERE id = %s", (client_id,))
        conn.commit()
        conn.close()
        return ok({"ok": True})

    # ── GET FINANCES ──────────────────────────────────────────────────────────
    if action == "get_finances":
        conn = get_conn()
        cur = conn.cursor()

        if is_admin:
            partner_id = body.get("partner_id")
        else:
            cur.execute(f"SELECT id FROM {SCHEMA}.partners WHERE user_id = %s", (user["id"],))
            prow = cur.fetchone()
            if not prow:
                conn.close()
                return ok({"clients": [], "payments": [], "summary": {}})
            partner_id = prow[0]

        if not partner_id:
            conn.close()
            return err("Не указан partner_id")

        # Клиенты с вознаграждением
        cur.execute(
            f"""SELECT pc.id, pc.full_name, pc.deal_amount, pc.partner_reward,
                       pc.reward_paid, pc.current_status, pc.updated_at
                FROM {SCHEMA}.partner_clients pc
                WHERE pc.partner_id = %s
                ORDER BY pc.updated_at DESC""",
            (partner_id,),
        )
        client_cols = ["id", "full_name", "deal_amount", "partner_reward", "reward_paid", "current_status", "updated_at"]
        clients = [dict(zip(client_cols, row)) for row in cur.fetchall()]
        for c in clients:
            for k in ["deal_amount", "partner_reward"]:
                if c[k] is not None:
                    c[k] = float(c[k])

        # История выплат
        cur.execute(
            f"""SELECT pp.id, pp.amount, pp.note, pp.paid_at,
                       pc.full_name as client_name, u.login as paid_by
                FROM {SCHEMA}.partner_payments pp
                LEFT JOIN {SCHEMA}.partner_clients pc ON pc.id = pp.client_id
                LEFT JOIN {SCHEMA}.users u ON u.id = pp.created_by
                WHERE pp.partner_id = %s
                ORDER BY pp.paid_at DESC""",
            (partner_id,),
        )
        pay_cols = ["id", "amount", "note", "paid_at", "client_name", "paid_by"]
        payments = [dict(zip(pay_cols, row)) for row in cur.fetchall()]
        for p in payments:
            p["amount"] = float(p["amount"])

        # Сводка — paid_reward считаем через реальные выплаты
        total_reward   = sum(c["partner_reward"] or 0 for c in clients)
        total_payments = sum(p["amount"] for p in payments)
        pending_reward = max(0, total_reward - total_payments)

        conn.close()
        return ok({
            "clients": clients,
            "payments": payments,
            "summary": {
                "total_reward": total_reward,
                "paid_reward": total_payments,
                "pending_reward": pending_reward,
                "total_payments": total_payments,
            },
        })

    # ── ADD PAYMENT (admin only) ───────────────────────────────────────────────
    if action == "add_payment":
        if not is_admin:
            return err("Только администратор", 403)
        partner_id = body.get("partner_id")
        amount     = body.get("amount")
        client_id  = body.get("client_id")
        note       = body.get("note", "")
        if not partner_id or not amount:
            return err("Укажите partner_id и amount")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"""INSERT INTO {SCHEMA}.partner_payments (partner_id, client_id, amount, note, created_by)
                VALUES (%s, %s, %s, %s, %s) RETURNING id, paid_at""",
            (partner_id, client_id or None, float(amount), note or None, user["id"]),
        )
        row = cur.fetchone()
        # Если указан клиент — помечаем reward_paid
        if client_id:
            cur.execute(
                f"UPDATE {SCHEMA}.partner_clients SET reward_paid = true, updated_at = NOW() WHERE id = %s",
                (client_id,),
            )
        conn.commit()
        conn.close()
        return ok({"ok": True, "id": row[0], "paid_at": str(row[1])})

    # ── SET REWARD PAID (admin only) ───────────────────────────────────────────
    if action == "set_reward_paid":
        if not is_admin:
            return err("Только администратор", 403)
        client_id = body.get("client_id")
        paid      = bool(body.get("paid", True))
        if not client_id:
            return err("Не указан client_id")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"UPDATE {SCHEMA}.partner_clients SET reward_paid = %s, updated_at = NOW() WHERE id = %s",
            (paid, client_id),
        )
        conn.commit()
        conn.close()
        return ok({"ok": True})

    # ── DELETE PAYMENT (admin only) ────────────────────────────────────────────
    if action == "delete_payment":
        if not is_admin:
            return err("Только администратор", 403)
        payment_id = body.get("id")
        if not payment_id:
            return err("Не указан id")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {SCHEMA}.partner_payments WHERE id = %s", (payment_id,))
        conn.commit()
        conn.close()
        return ok({"ok": True})

    return err("Неизвестное действие", 400)