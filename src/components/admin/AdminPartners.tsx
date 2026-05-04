import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import PartnerCabinet from "@/components/partner/PartnerCabinet";

const PARTNER_API = "https://functions.poehali.dev/d3a180ca-4111-4be5-ae8c-3ab5f6f4a6a9";

interface Partner {
  user_id: number;
  login: string;
  partner_id: number | null;
  status: string | null;
  partner_type: string | null;
  full_name: string | null;
  short_name: string | null;
  inn: string | null;
  ref_code: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  clients_count: number;
  total_reward: number;
}

const STATUS_LABELS: Record<string, { text: string; color: string; bg: string }> = {
  active:   { text: "Активен",    color: "#16a34a", bg: "rgba(22,163,74,0.08)" },
  pending:  { text: "На проверке", color: "#d97706", bg: "rgba(217,119,6,0.08)" },
  blocked:  { text: "Заблокирован", color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
};

function fmtMoney(v?: number | null) {
  if (!v) return "0 ₽";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} млн ₽`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)} тыс. ₽`;
  return `${v.toLocaleString("ru-RU")} ₽`;
}

interface Props {
  sessionId: string;
}

export default function AdminPartners({ sessionId }: Props) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [qInput, setQInput] = useState("");
  const [selectedLogin, setSelectedLogin] = useState<string | null>(null);
  const [statusChanging, setStatusChanging] = useState<number | null>(null);

  const load = useCallback(async (p: number, search: string) => {
    setLoading(true);
    const res = await fetch(PARTNER_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
      body: JSON.stringify({ action: "get_partners", page: p, q: search }),
    });
    const data = await res.json();
    setPartners(data.partners || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [sessionId]);

  useEffect(() => { load(page, q); }, [load, page, q]);

  const totalPages = Math.ceil(total / 20);

  const changeStatus = async (partnerId: number, newStatus: string) => {
    setStatusChanging(partnerId);
    await fetch(PARTNER_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
      body: JSON.stringify({ action: "set_partner_status", partner_id: partnerId, status: newStatus }),
    });
    setPartners(prev => prev.map(p => p.partner_id === partnerId ? { ...p, status: newStatus } : p));
    setStatusChanging(null);
  };

  if (selectedLogin) {
    return (
      <div>
        <button
          onClick={() => setSelectedLogin(null)}
          className="flex items-center gap-2 text-sm mb-6 transition-opacity hover:opacity-70"
          style={{ color: "var(--blue)" }}>
          <Icon name="ArrowLeft" size={15} />
          Назад к списку партнёров
        </button>
        <PartnerCabinet sessionId={sessionId} userLogin={selectedLogin} isAdmin={true} />
      </div>
    );
  }

  return (
    <div>
      {/* Stats row */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: "Users", label: "Всего партнёров", value: total },
          { icon: "UserCheck", label: "Страница", value: `${page} / ${totalPages || 1}` },
          { icon: "Handshake", label: "Роль", value: "Администратор" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl p-6" style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--blue-dim)" }}>
                <Icon name={card.icon as "Users"} size={18} style={{ color: "var(--blue)" }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: "var(--navy)" }}>{card.label}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--navy)" }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)" }}>
        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3" style={{ borderBottom: "1px solid var(--border-c)" }}>
          <h2 className="font-bold text-base" style={{ color: "var(--navy)" }}>Партнёры</h2>
          <div className="flex gap-2">
            <div className="relative">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
              <input
                className="pl-8 pr-4 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--bg)", border: "1px solid var(--border-c)", color: "var(--text)", width: 220 }}
                placeholder="Поиск по логину, ИНН..."
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { setQ(qInput); setPage(1); } }}
              />
            </div>
            <button
              onClick={() => { setQ(qInput); setPage(1); }}
              className="px-4 py-2 rounded-lg text-xs font-semibold"
              style={{ background: "var(--blue)", color: "#fff" }}>
              Найти
            </button>
            <button
              onClick={() => load(page, q)}
              className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
              style={{ color: "var(--blue)" }}>
              <Icon name="RefreshCw" size={13} />
              Обновить
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Icon name="LoaderCircle" size={28} className="animate-spin" style={{ color: "var(--blue)" }} />
          </div>
        ) : partners.length === 0 ? (
          <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
            <Icon name="Users" size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Партнёров пока нет</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-c)" }}>
                    {["Логин", "Организация", "ИНН", "Контакт", "Клиентов", "Вознаграждение", "Статус", ""].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {partners.map((p) => {
                    const st = STATUS_LABELS[p.status || ""] || { text: "Не заполнен", color: "var(--text-muted)", bg: "var(--bg)" };
                    return (
                      <tr key={p.user_id}
                        className="transition-colors"
                        style={{ borderBottom: "1px solid var(--border-c)" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
                        <td className="px-5 py-3">
                          <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: "var(--bg)", color: "var(--navy)" }}>{p.login}</span>
                        </td>
                        <td className="px-5 py-3 font-medium" style={{ color: "var(--navy)" }}>
                          {p.short_name || p.full_name || <span style={{ color: "var(--text-muted)" }}>—</span>}
                        </td>
                        <td className="px-5 py-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{p.inn || "—"}</td>
                        <td className="px-5 py-3">
                          <div className="text-xs" style={{ color: "var(--text)" }}>
                            {p.contact_phone && <div>{p.contact_phone}</div>}
                            {p.contact_email && <div style={{ color: "var(--text-muted)" }}>{p.contact_email}</div>}
                            {!p.contact_phone && !p.contact_email && <span style={{ color: "var(--text-muted)" }}>—</span>}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className="text-sm font-bold" style={{ color: "var(--navy)" }}>{p.clients_count}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-sm font-semibold" style={{ color: "var(--blue)" }}>{fmtMoney(p.total_reward)}</span>
                        </td>
                        <td className="px-5 py-3">
                          {p.partner_id ? (
                            <div className="relative inline-block">
                              {statusChanging === p.partner_id ? (
                                <Icon name="LoaderCircle" size={14} className="animate-spin" style={{ color: "var(--blue)" }} />
                              ) : (
                                <select
                                  value={p.status || "pending"}
                                  onChange={(e) => changeStatus(p.partner_id!, e.target.value)}
                                  className="text-xs font-semibold px-2 py-1 rounded-full cursor-pointer outline-none appearance-none pr-5"
                                  style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}30` }}>
                                  <option value="active">Активен</option>
                                  <option value="pending">На проверке</option>
                                  <option value="blocked">Заблокирован</option>
                                </select>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Профиль не заполнен</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => setSelectedLogin(p.login)}
                            className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
                            style={{ color: "var(--blue)" }}>
                            Открыть
                            <Icon name="ChevronRight" size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y" style={{ borderColor: "var(--border-c)" }}>
              {partners.map((p) => {
                const st = STATUS_LABELS[p.status || ""] || { text: "Не заполнен", color: "var(--text-muted)", bg: "var(--bg)" };
                return (
                  <div key={p.user_id} className="px-5 py-4" onClick={() => setSelectedLogin(p.login)}>
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="font-semibold text-sm" style={{ color: "var(--navy)" }}>{p.short_name || p.full_name || p.login}</p>
                        <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{p.login}{p.inn ? ` · ИНН ${p.inn}` : ""}</p>
                      </div>
                      {p.partner_id && (
                        statusChanging === p.partner_id ? (
                          <Icon name="LoaderCircle" size={14} className="animate-spin ml-2 flex-shrink-0" style={{ color: "var(--blue)" }} />
                        ) : (
                          <select
                            value={p.status || "pending"}
                            onChange={(e) => { e.stopPropagation(); changeStatus(p.partner_id!, e.target.value); }}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-semibold px-2 py-1 rounded-full cursor-pointer outline-none appearance-none ml-2 flex-shrink-0"
                            style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}30` }}>
                            <option value="active">Активен</option>
                            <option value="pending">На проверке</option>
                            <option value="blocked">Заблокирован</option>
                          </select>
                        )
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>Клиентов: {p.clients_count} · {fmtMoney(p.total_reward)}</span>
                      <Icon name="ChevronRight" size={15} style={{ color: "var(--blue)" }} />
                    </div>
                  </div>
                );
              })}
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
    </div>
  );
}