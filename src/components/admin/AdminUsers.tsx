import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

const ADMIN_URL = "https://functions.poehali.dev/2fb10b23-2471-4f73-a39f-315ed4c51e8c";

interface UserRow {
  id: number;
  login: string;
  email: string | null;
  name: string | null;
  role: string;
  vk_id: string | null;
  created_at: string;
  last_login_at: string | null;
}

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    admin:   { label: "Админ",   color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
    partner: { label: "Партнёр", color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
    client:  { label: "Клиент",  color: "var(--blue)", bg: "var(--blue-dim)" },
  };
  const s = map[role] || { label: role, color: "var(--text-muted)", bg: "var(--bg)" };
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
      style={{ color: s.color, background: s.bg }}>
      {s.label}
    </span>
  );
}

export default function AdminUsers({ sessionId }: { sessionId: string }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const res = await fetch(ADMIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
        body: JSON.stringify({ action: "get_users", page: p, q }),
      });
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => { load(page, search); }, [load, page, search]);

  const totalPages = Math.ceil(total / 30);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(inputVal);
  };

  return (
    <div>
      {/* Header + search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold" style={{ color: "var(--navy)" }}>Пользователи</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Всего: {total}</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 sm:ml-auto">
          <input
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder="Поиск по логину, email, имени..."
            className="px-3 py-2 rounded-lg text-sm outline-none"
            style={{ border: "1px solid var(--border-c)", background: "var(--bg)", color: "var(--text)", width: 240 }}
          />
          <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: "var(--navy)", color: "#fff" }}>
            Найти
          </button>
          {search && (
            <button type="button" onClick={() => { setInputVal(""); setSearch(""); setPage(1); }}
              className="px-3 py-2 rounded-lg text-sm"
              style={{ border: "1px solid var(--border-c)", color: "var(--text-muted)" }}>
              Сбросить
            </button>
          )}
        </form>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)" }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Icon name="LoaderCircle" size={28} className="animate-spin" style={{ color: "var(--blue)" }} />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
            <Icon name="Users" size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Пользователей не найдено</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-c)" }}>
                    {["#", "Логин / Email", "Имя", "Роль", "VK", "Регистрация", "Последний вход"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: "1px solid var(--border-c)" }}>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{u.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-sm" style={{ color: "var(--navy)" }}>{u.login}</p>
                        {u.email && u.email !== u.login && (
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{u.email}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "var(--text)" }}>{u.name || "—"}</td>
                      <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                        {u.vk_id ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ background: "rgba(0,119,255,0.1)", color: "#0077ff" }}>
                            VK
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{fmt(u.created_at)}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{fmt(u.last_login_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y" style={{ borderColor: "var(--border-c)" }}>
              {users.map(u => (
                <div key={u.id} className="px-4 py-3.5">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-semibold text-sm" style={{ color: "var(--navy)" }}>{u.name || u.login}</p>
                    <RoleBadge role={u.role} />
                  </div>
                  <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>{u.login}</p>
                  {u.email && <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>{u.email}</p>}
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{fmt(u.created_at)}</p>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 px-6 py-4" style={{ borderTop: "1px solid var(--border-c)" }}>
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 rounded-lg text-xs font-medium disabled:opacity-40"
                  style={{ background: "var(--bg)", color: "var(--navy)", border: "1px solid var(--border-c)" }}>
                  ← Назад
                </button>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{page} / {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 rounded-lg text-xs font-medium disabled:opacity-40"
                  style={{ background: "var(--bg)", color: "var(--navy)", border: "1px solid var(--border-c)" }}>
                  Вперёд →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
