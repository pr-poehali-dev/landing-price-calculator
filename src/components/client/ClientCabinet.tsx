import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import ContractorCheck from "@/components/ContractorCheck";

const CABINET_URL = "https://functions.poehali.dev/0d8f02e0-4a86-4325-8c43-a981aa1a2aa3";

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  new:        { label: "Новая заявка",   color: "#2563eb", bg: "rgba(37,99,235,0.1)" },
  in_work:    { label: "В работе",       color: "#d97706", bg: "rgba(217,119,6,0.1)" },
  docs:       { label: "Сбор документов",color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
  review:     { label: "На проверке",    color: "#0891b2", bg: "rgba(8,145,178,0.1)" },
  appeal:     { label: "Апелляция",      color: "#be185d", bg: "rgba(190,24,93,0.1)" },
  court:      { label: "Суд",            color: "#b45309", bg: "rgba(180,83,9,0.1)" },
  won:        { label: "Выиграно",       color: "#16a34a", bg: "rgba(22,163,74,0.1)" },
  closed:     { label: "Закрыто",        color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
  rejected:   { label: "Отказ",          color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
};

const DOC_CATEGORIES: Record<string, string> = {
  contract:   "Договор",
  act:        "Акт",
  invoice:    "Счёт",
  resolution: "Решение ФНС",
  court_doc:  "Судебный документ",
  other:      "Прочее",
};

function fmtMoney(v?: number | null) {
  if (v == null) return "—";
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(v);
}

function fmtDate(v?: string | null) {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

function fmtFileSize(bytes?: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

interface ClientData {
  id: number;
  full_name: string;
  inn?: string;
  phone?: string;
  email?: string;
  current_status: string;
  deal_amount?: number;
  created_at: string;
  updated_at: string;
}

interface StatusEntry {
  status: string;
  comment?: string;
  created_at: string;
}

interface Doc {
  id: number;
  file_name: string;
  file_url: string;
  file_size?: number;
  category?: string;
  created_at: string;
}

interface Service {
  id: number;
  name: string;
  description?: string;
  deal_amount?: number;
  created_at: string;
}

interface Payment {
  id: number;
  amount: number;
  description?: string;
  status: string;
  paid_at?: string;
  created_at: string;
}

interface DashboardData {
  client: ClientData | null;
  statuses: StatusEntry[];
  docs: Doc[];
  services: Service[];
  payments: Payment[];
}

interface Props {
  user: { id: number; login: string; role: string };
}

export default function ClientCabinet({ user }: Props) {
  const [tab, setTab] = useState<"cases" | "docs" | "payments">("cases");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const sessionId = localStorage.getItem("session_id") || "";

  useEffect(() => {
    setLoading(true);
    fetch(CABINET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
      body: JSON.stringify({ action: "get_dashboard" }),
    })
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [sessionId]);

  const client = data?.client;
  const statuses = data?.statuses || [];
  const docs = data?.docs || [];
  const services = data?.services || [];
  const payments = data?.payments || [];

  const statusMeta = client ? (STATUS_META[client.current_status] || { label: client.current_status, color: "#6b7280", bg: "rgba(107,114,128,0.1)" }) : null;

  const tabs = [
    { id: "cases",    icon: "Briefcase",  label: "Моё дело" },
    { id: "docs",     icon: "Paperclip",  label: "Документы" },
    { id: "payments", icon: "CreditCard", label: "Оплаты" },
  ] as const;

  return (
    <div>
      {/* Шапка */}
      <div className="mb-8">
        <p className="text-xs tracking-widest uppercase font-semibold mb-2" style={{ color: "var(--blue)" }}>Личный кабинет</p>
        <h1 className="text-2xl md:text-3xl font-bold leading-tight" style={{ fontFamily: "Playfair Display, serif", color: "var(--navy)" }}>
          Добро пожаловать{user.login ? `, ${user.login}` : ""}
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Icon name="LoaderCircle" size={32} className="animate-spin" style={{ color: "var(--blue)" }} />
        </div>
      ) : !client ? (
        /* Нет привязанного дела */
        <div className="rounded-2xl p-10 text-center mb-8" style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "var(--blue-dim)" }}>
            <Icon name="Inbox" size={26} style={{ color: "var(--blue)" }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "Playfair Display, serif", color: "var(--navy)" }}>Дел пока нет</h2>
          <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--text-muted)" }}>
            Как только мы зарегистрируем ваше дело, оно появится здесь. Если вы уже обращались — свяжитесь с нашим менеджером.
          </p>
        </div>
      ) : (
        <>
          {/* Карточка дела */}
          <div className="rounded-2xl p-6 mb-6" style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)" }}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Ваше дело</p>
                <h2 className="text-lg font-bold" style={{ fontFamily: "Playfair Display, serif", color: "var(--navy)" }}>{client.full_name}</h2>
                {client.inn && <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>ИНН: {client.inn}</p>}
              </div>
              {statusMeta && (
                <span className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: statusMeta.bg, color: statusMeta.color }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusMeta.color }} />
                  {statusMeta.label}
                </span>
              )}
            </div>
            {client.deal_amount && (
              <div className="mt-4 pt-4 flex items-center gap-2" style={{ borderTop: "1px solid var(--border-c)" }}>
                <Icon name="DollarSign" size={14} style={{ color: "var(--text-muted)" }} />
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>Сумма дела:</span>
                <span className="text-sm font-semibold" style={{ color: "var(--navy)" }}>{fmtMoney(client.deal_amount)}</span>
              </div>
            )}
          </div>

          {/* Табы */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)" }}>
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={tab === t.id
                  ? { background: "var(--blue)", color: "#fff" }
                  : { color: "var(--text-muted)" }}>
                <Icon name={t.icon as "Briefcase"} size={15} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Контент */}
          {tab === "cases" && (
            <div className="space-y-4">
              {/* Услуги */}
              {services.length > 0 && (
                <div className="rounded-2xl p-6" style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Icon name="List" size={16} style={{ color: "var(--blue)" }} />
                    <p className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--navy)" }}>Услуги по делу</p>
                  </div>
                  <div className="space-y-3">
                    {services.map((s) => (
                      <div key={s.id} className="flex items-start justify-between gap-4 py-3"
                        style={{ borderBottom: "1px solid var(--border-c)" }}>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "var(--navy)" }}>{s.name}</p>
                          {s.description && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{s.description}</p>}
                        </div>
                        {s.deal_amount && (
                          <span className="text-sm font-bold flex-shrink-0" style={{ color: "var(--navy)" }}>{fmtMoney(s.deal_amount)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* История статусов */}
              <div className="rounded-2xl p-6" style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="Clock" size={16} style={{ color: "var(--blue)" }} />
                  <p className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--navy)" }}>История статусов</p>
                </div>
                {statuses.length === 0 ? (
                  <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>Изменений статуса пока нет</p>
                ) : (
                  <div className="relative">
                    <div className="absolute left-3 top-0 bottom-0 w-px" style={{ background: "var(--border-c)" }} />
                    <div className="space-y-4">
                      {statuses.map((s, i) => {
                        const m = STATUS_META[s.status] || { label: s.status, color: "#6b7280", bg: "rgba(107,114,128,0.1)" };
                        return (
                          <div key={i} className="flex gap-4 pl-8 relative">
                            <div className="absolute left-0 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: m.bg, border: `2px solid ${m.color}` }}>
                              <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                  style={{ background: m.bg, color: m.color }}>{m.label}</span>
                                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{fmtDate(s.created_at)}</span>
                              </div>
                              {s.comment && (
                                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{s.comment}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "docs" && (
            <div className="rounded-2xl p-6" style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)" }}>
              <div className="flex items-center gap-2 mb-5">
                <Icon name="Paperclip" size={16} style={{ color: "var(--blue)" }} />
                <p className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--navy)" }}>Документы по делу</p>
              </div>
              {docs.length === 0 ? (
                <div className="text-center py-10">
                  <Icon name="FolderOpen" size={32} className="mx-auto mb-3" style={{ color: "var(--border-c)" }} />
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Документов пока нет</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {docs.map((doc) => (
                    <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all group"
                      style={{ background: "var(--bg)", border: "1px solid var(--border-c)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(37,99,235,0.3)")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-c)")}>
                      <Icon name="FileText" size={20} style={{ color: "var(--blue)" }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--navy)" }}>{doc.file_name}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {DOC_CATEGORIES[doc.category || "other"] || doc.category} · {fmtDate(doc.created_at)}
                          {doc.file_size ? ` · ${fmtFileSize(doc.file_size)}` : ""}
                        </p>
                      </div>
                      <Icon name="Download" size={16} className="flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: "var(--blue)" }} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "payments" && (
            <div className="rounded-2xl p-6" style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)" }}>
              <div className="flex items-center gap-2 mb-5">
                <Icon name="CreditCard" size={16} style={{ color: "var(--blue)" }} />
                <p className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--navy)" }}>История оплат</p>
              </div>

              {payments.length === 0 ? (
                <div className="text-center py-10">
                  <Icon name="Receipt" size={32} className="mx-auto mb-3" style={{ color: "var(--border-c)" }} />
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Оплат пока нет</p>
                </div>
              ) : (
                <>
                  {/* Итого */}
                  <div className="grid sm:grid-cols-2 gap-3 mb-5">
                    {[
                      {
                        label: "Оплачено",
                        value: fmtMoney(payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0)),
                        color: "var(--success)",
                        bg: "rgba(22,163,74,0.07)",
                        icon: "BadgeCheck",
                      },
                      {
                        label: "К оплате",
                        value: fmtMoney(payments.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0)),
                        color: "#d97706",
                        bg: "rgba(217,119,6,0.07)",
                        icon: "Clock",
                      },
                    ].map((card) => (
                      <div key={card.label} className="rounded-xl p-4" style={{ background: card.bg }}>
                        <div className="flex items-center gap-2 mb-1">
                          <Icon name={card.icon as "BadgeCheck"} size={14} style={{ color: card.color }} />
                          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: card.color }}>{card.label}</p>
                        </div>
                        <p className="text-xl font-bold" style={{ color: "var(--navy)" }}>{card.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Список */}
                  <div className="space-y-2">
                    {payments.map((p) => {
                      const isPaid = p.status === "paid";
                      return (
                        <div key={p.id} className="flex items-center justify-between gap-4 rounded-xl px-4 py-3"
                          style={{ background: "var(--bg)", border: "1px solid var(--border-c)" }}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: isPaid ? "rgba(22,163,74,0.1)" : "rgba(217,119,6,0.1)" }}>
                              <Icon name={isPaid ? "CheckCircle" : "Clock"} size={16}
                                style={{ color: isPaid ? "var(--success)" : "#d97706" }} />
                            </div>
                            <div>
                              <p className="text-sm font-medium" style={{ color: "var(--navy)" }}>
                                {p.description || "Оплата по договору"}
                              </p>
                              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                {isPaid && p.paid_at ? `Оплачено ${fmtDate(p.paid_at)}` : `Выставлено ${fmtDate(p.created_at)}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold" style={{ color: "var(--navy)" }}>{fmtMoney(p.amount)}</p>
                            <p className="text-xs font-semibold" style={{ color: isPaid ? "var(--success)" : "#d97706" }}>
                              {isPaid ? "Оплачено" : "Ожидает оплаты"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Проверка контрагентов */}
      <div className="mt-8">
        <ContractorCheck />
      </div>
    </div>
  );
}
