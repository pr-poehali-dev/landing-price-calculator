import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";
import ContractorCheck from "@/components/ContractorCheck";
import PartnerCabinet from "@/components/partner/PartnerCabinet";
import AdminPartners from "@/components/admin/AdminPartners";
import ClientList from "@/components/partner/ClientList";
import ClientCard from "@/components/partner/ClientCard";

const AUTH_URL = "https://functions.poehali.dev/cf442b6d-1511-4826-a129-d63da8e9dfa0";
const ADMIN_URL = "https://functions.poehali.dev/2fb10b23-2471-4f73-a39f-315ed4c51e8c";

interface User {
  id: number;
  login: string;
  role: string;
}

interface Submission {
  id: number;
  name: string;
  phone: string;
  email: string;
  inn: string | null;
  inn_company: string | null;
  message: string | null;
  files_count: number;
  created_at: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ── ADMIN PANEL ───────────────────────────────────────────────────────────────
function AdminPanel({ sessionId }: { sessionId: string }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Submission | null>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    const res = await fetch(ADMIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
      body: JSON.stringify({ action: "submissions", page: p, session_id: sessionId }),
    });
    const data = await res.json();
    setSubmissions(data.submissions || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [sessionId]);

  useEffect(() => { load(page); }, [load, page]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: "Inbox", label: "Всего заявок", value: total },
          { icon: "Clock", label: "Страница", value: `${page} / ${totalPages || 1}` },
          { icon: "Users", label: "Роль", value: "Администратор" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl p-6" style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--blue-dim)" }}>
                <Icon name={card.icon as "Inbox"} size={18} style={{ color: "var(--blue)" }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: "var(--navy)" }}>{card.label}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--navy)" }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)" }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-c)" }}>
          <h2 className="font-bold text-base" style={{ color: "var(--navy)" }}>Заявки клиентов</h2>
          <button onClick={() => load(page)} className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70" style={{ color: "var(--blue)" }}>
            <Icon name="RefreshCw" size={13} />
            Обновить
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Icon name="LoaderCircle" size={28} className="animate-spin" style={{ color: "var(--blue)" }} />
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
            <Icon name="Inbox" size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Заявок пока нет</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-c)" }}>
                    {["#", "Имя", "Телефон", "Email", "ИНН", "Файлы", "Дата"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => (
                    <tr
                      key={s.id}
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: "1px solid var(--border-c)" }}
                      onClick={() => setSelected(s)}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                    >
                      <td className="px-5 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{s.id}</td>
                      <td className="px-5 py-3 font-medium" style={{ color: "var(--navy)" }}>{s.name || "—"}</td>
                      <td className="px-5 py-3" style={{ color: "var(--text)" }}>{s.phone || "—"}</td>
                      <td className="px-5 py-3" style={{ color: "var(--text)" }}>{s.email || "—"}</td>
                      <td className="px-5 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{s.inn || "—"}</td>
                      <td className="px-5 py-3 text-center">
                        {s.files_count > 0
                          ? <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--blue-dim)", color: "var(--blue)" }}>
                              <Icon name="Paperclip" size={11} />{s.files_count}
                            </span>
                          : <span style={{ color: "var(--text-muted)" }}>—</span>}
                      </td>
                      <td className="px-5 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{formatDate(s.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y" style={{ borderColor: "var(--border-c)" }}>
              {submissions.map((s) => (
                <div key={s.id} className="px-5 py-4 cursor-pointer" onClick={() => setSelected(s)} style={{ background: "transparent" }}>
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-semibold text-sm" style={{ color: "var(--navy)" }}>{s.name || "—"}</p>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{formatDate(s.created_at)}</span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.phone} · {s.email}</p>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 px-6 py-4" style={{ borderTop: "1px solid var(--border-c)" }}>
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 rounded-lg text-xs font-medium disabled:opacity-40 transition-opacity"
                  style={{ background: "var(--bg)", color: "var(--navy)", border: "1px solid var(--border-c)" }}>
                  ← Назад
                </button>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{page} / {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 rounded-lg text-xs font-medium disabled:opacity-40 transition-opacity"
                  style={{ background: "var(--bg)", color: "var(--navy)", border: "1px solid var(--border-c)" }}>
                  Вперёд →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.4)" }} onClick={() => setSelected(null)}>
          <div className="w-full max-w-md rounded-2xl p-7 relative" style={{ background: "#fff", border: "1px solid var(--border-c)" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 transition-opacity hover:opacity-60" style={{ color: "var(--text-muted)" }}>
              <Icon name="X" size={18} />
            </button>
            <p className="text-xs font-semibold mb-4 uppercase tracking-widest" style={{ color: "var(--blue)" }}>Заявка #{selected.id}</p>
            <div className="space-y-3">
              {[
                { label: "Имя", value: selected.name },
                { label: "Телефон", value: selected.phone },
                { label: "Email", value: selected.email },
                { label: "ИНН", value: selected.inn ? `${selected.inn}${selected.inn_company ? ` (${selected.inn_company})` : ""}` : null },
                { label: "Дата", value: formatDate(selected.created_at) },
                { label: "Файлов", value: selected.files_count > 0 ? `${selected.files_count} шт.` : "нет" },
              ].map(({ label, value }) => value ? (
                <div key={label} className="flex gap-3">
                  <span className="text-xs w-20 flex-shrink-0 pt-0.5" style={{ color: "var(--text-muted)" }}>{label}</span>
                  <span className="text-sm font-medium" style={{ color: "var(--navy)" }}>{value}</span>
                </div>
              ) : null)}
              {selected.message && (
                <div>
                  <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Сообщение</p>
                  <p className="text-sm rounded-lg px-4 py-3" style={{ background: "var(--bg)", color: "var(--text)" }}>{selected.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CLIENT CABINET ────────────────────────────────────────────────────────────
function ClientCabinet({ user }: { user: User }) {
  return (
    <div>
      <div className="mb-10">
        <p className="text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: "var(--blue)" }}>Личный кабинет</p>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3" style={{ fontFamily: "Playfair Display, serif", color: "var(--navy)" }}>
          Добро пожаловать, {user.login}
        </h1>
        <p style={{ color: "var(--text-muted)" }}>Здесь вы сможете отслеживать статус заявок, получать документы и общаться с юристом.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {[
          { icon: "FileText", label: "Заявки", value: "—", desc: "Активных дел нет" },
          { icon: "Clock", label: "В работе", value: "—", desc: "Ожидающих ответа нет" },
          { icon: "CheckCircle", label: "Завершено", value: "—", desc: "Закрытых дел нет" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl p-6" style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--blue-dim)" }}>
                <Icon name={card.icon as "FileText"} size={18} style={{ color: "var(--blue)" }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: "var(--navy)" }}>{card.label}</span>
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: "var(--navy)" }}>{card.value}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{card.desc}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-10 md:p-14 text-center" style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)" }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "var(--blue-dim)" }}>
          <Icon name="LayoutDashboard" size={28} style={{ color: "var(--blue)" }} />
        </div>
        <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "Playfair Display, serif", color: "var(--navy)" }}>Кабинет в разработке</h2>
        <p className="text-sm max-w-md mx-auto mb-8" style={{ color: "var(--text-muted)" }}>
          Мы разрабатываем личный кабинет, где вы сможете отслеживать ход дел, загружать документы и получать уведомления.
        </p>
        <div className="grid sm:grid-cols-3 gap-4 max-w-xl mx-auto mb-8">
          {[
            { icon: "Bell", text: "Уведомления о статусе дела" },
            { icon: "Upload", text: "Загрузка и хранение документов" },
            { icon: "MessageSquare", text: "Чат с вашим юристом" },
          ].map((item) => (
            <div key={item.text} className="rounded-xl px-4 py-4 text-center" style={{ background: "var(--bg)", border: "1px solid var(--border-c)" }}>
              <Icon name={item.icon as "Bell"} size={20} className="mx-auto mb-2" style={{ color: "var(--blue)" }} />
              <p className="text-xs leading-snug" style={{ color: "var(--text-muted)" }}>{item.text}</p>
            </div>
          ))}
        </div>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
          style={{ background: "var(--blue)", color: "#fff" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--blue-hover)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--blue)")}>
          Отправить заявку сейчас
          <Icon name="ArrowRight" size={16} />
        </Link>
      </div>

      <div className="mt-8">
        <ContractorCheck />
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function Cabinet() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [adminTab, setAdminTab] = useState<"submissions" | "partners" | "clients">("submissions");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const sessionId = localStorage.getItem("session_id") || "";

  useEffect(() => {
    if (!sessionId) { navigate("/login", { replace: true }); return; }
    fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "me", session_id: sessionId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) { setUser(data.user); }
        else { localStorage.removeItem("session_id"); navigate("/login", { replace: true }); }
      })
      .catch(() => navigate("/login", { replace: true }))
      .finally(() => setChecking(false));
  }, [navigate, sessionId]);

  const handleLogout = async () => {
    if (sessionId) {
      await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout", session_id: sessionId }),
      }).catch(() => {});
    }
    localStorage.removeItem("session_id");
    localStorage.removeItem("user");
    toast.success("Вы вышли из кабинета");
    navigate("/login");
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <Icon name="LoaderCircle" size={32} className="animate-spin" style={{ color: "var(--blue)" }} />
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-10 py-3 md:py-4"
        style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border-c)" }}>
        <Link to="/">
          <img src="https://cdn.poehali.dev/projects/ec09f91e-5c19-456f-a8f1-620fce7cd143/bucket/269a5714-3147-42ee-9d3a-43b1f31ad3e8.jpeg"
            alt="Legis24" style={{ height: 36, width: "auto", mixBlendMode: "multiply" }} />
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          {user && (
            <div className="flex items-center gap-1.5 md:gap-2">
              {user.role === "admin" && (
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "var(--blue-dim)", color: "var(--blue)" }}>
                  Admin
                </span>
              )}
              {user.role === "partner" && (
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(124,58,237,0.12)", color: "#7c3aed" }}>
                  Партнёр
                </span>
              )}
              <span className="hidden sm:inline text-xs" style={{ color: "var(--text-muted)" }}>{user.login}</span>
            </div>
          )}
          <button onClick={handleLogout} className="flex items-center gap-1 text-sm font-medium transition-colors" style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}>
            <Icon name="LogOut" size={15} />
            <span className="hidden sm:inline">Выйти</span>
          </button>
        </div>
      </nav>

      <div className="pt-20 md:pt-28 pb-16 md:pb-20 px-4 md:px-10 max-w-5xl mx-auto">
        {user?.role === "admin"
          ? (
            <>
              <div className="mb-6 md:mb-8">
                <p className="text-xs tracking-widest uppercase font-semibold mb-1.5" style={{ color: "var(--blue)" }}>Администратор</p>
                <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6" style={{ fontFamily: "Playfair Display, serif", color: "var(--navy)" }}>
                  Панель управления
                </h1>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {([
                    { key: "submissions", label: "Заявки с сайта", icon: "Inbox" },
                    { key: "clients",     label: "Клиенты партнёров", icon: "Users" },
                    { key: "partners",    label: "Партнёры",        icon: "Handshake" },
                  ] as const).map((t) => (
                    <button key={t.key} onClick={() => { setAdminTab(t.key); setSelectedClientId(null); }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-shrink-0"
                      style={{
                        background: adminTab === t.key ? "var(--navy)" : "var(--bg-white)",
                        color: adminTab === t.key ? "#fff" : "var(--text-muted)",
                        border: `1px solid ${adminTab === t.key ? "var(--navy)" : "var(--border-c)"}`,
                      }}>
                      <Icon name={t.icon as "Inbox"} size={15} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              {adminTab === "submissions" && <AdminPanel sessionId={sessionId} />}
              {adminTab === "clients" && (
                <div className="rounded-2xl p-4 md:p-6" style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)" }}>
                  {selectedClientId ? (
                    <ClientCard
                      sessionId={sessionId}
                      clientId={selectedClientId}
                      isAdmin={true}
                      onBack={() => setSelectedClientId(null)}
                    />
                  ) : (
                    <ClientList
                      sessionId={sessionId}
                      onSelectClient={setSelectedClientId}
                    />
                  )}
                </div>
              )}
              {adminTab === "partners" && <AdminPartners sessionId={sessionId} />}
            </>
          )
          : user?.role === "partner"
          ? <PartnerCabinet sessionId={sessionId} userLogin={user.login} isAdmin={false} />
          : user
          ? <ClientCabinet user={user} />
          : null
        }
      </div>
    </div>
  );
}