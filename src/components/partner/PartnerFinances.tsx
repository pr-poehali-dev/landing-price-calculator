import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";
import { apiPartner, DEAL_STATUS_META, fmtMoney, type DealStatus } from "./types";

interface FinanceClient {
  id: number;
  full_name: string;
  deal_amount: number | null;
  partner_reward: number | null;
  reward_paid: boolean;
  current_status: DealStatus;
  updated_at: string;
}

interface Payment {
  id: number;
  amount: number;
  note: string | null;
  paid_at: string;
  client_name: string | null;
  paid_by: string | null;
}

interface Summary {
  total_reward: number;
  paid_reward: number;
  pending_reward: number;
  total_payments: number;
}

interface Props {
  sessionId: string;
  partnerId: number;
  isAdmin: boolean;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function PartnerFinances({ sessionId, partnerId, isAdmin }: Props) {
  const [clients, setClients] = useState<FinanceClient[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  // Форма новой выплаты (только для админа)
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payClientId, setPayClientId] = useState<number | "">("");
  const [payNote, setPayNote] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);

  // Смена статуса выплаты по клиенту
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await apiPartner(sessionId, { action: "get_finances", partner_id: partnerId });
    setClients(data.clients || []);
    setPayments(data.payments || []);
    setSummary(data.summary || null);
    setLoading(false);
  }, [sessionId, partnerId]);

  useEffect(() => { load(); }, [load]);

  const handleTogglePaid = async (clientId: number, current: boolean) => {
    setTogglingId(clientId);
    await apiPartner(sessionId, { action: "set_reward_paid", client_id: clientId, paid: !current });
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, reward_paid: !current } : c));
    setSummary(prev => {
      if (!prev) return prev;
      const client = clients.find(c => c.id === clientId);
      const reward = client?.partner_reward || 0;
      return {
        ...prev,
        paid_reward: current ? prev.paid_reward - reward : prev.paid_reward + reward,
        pending_reward: current ? prev.pending_reward + reward : prev.pending_reward - reward,
      };
    });
    setTogglingId(null);
  };

  const handleAddPayment = async () => {
    if (!payAmount || parseFloat(payAmount) <= 0) { toast.error("Укажите сумму"); return; }
    setSavingPayment(true);
    const data = await apiPartner(sessionId, {
      action: "add_payment",
      partner_id: partnerId,
      amount: parseFloat(payAmount),
      client_id: payClientId || null,
      note: payNote || null,
    });
    setSavingPayment(false);
    if (data.ok) {
      toast.success("Выплата записана");
      setShowAddPayment(false);
      setPayAmount(""); setPayClientId(""); setPayNote("");
      load();
    } else {
      toast.error(data.error || "Ошибка");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Icon name="LoaderCircle" size={24} className="animate-spin" style={{ color: "var(--blue)" }} />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Сводка */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Начислено всего", value: fmtMoney(summary.total_reward), color: "var(--navy)", icon: "Wallet" },
            { label: "Выплачено", value: fmtMoney(summary.paid_reward), color: "var(--success)", icon: "BadgeCheck" },
            { label: "К выплате", value: fmtMoney(summary.pending_reward), color: summary.pending_reward > 0 ? "#d97706" : "var(--text-muted)", icon: "Clock" },
          ].map(card => (
            <div key={card.label} className="rounded-2xl p-4" style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon name={card.icon as "Wallet"} size={14} style={{ color: card.color }} />
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{card.label}</p>
              </div>
              <p className="text-lg font-bold" style={{ color: card.color }}>{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Клиенты и статус выплат */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon name="Users" size={14} style={{ color: "var(--blue)" }} />
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Вознаграждения по клиентам</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowAddPayment(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: "var(--blue)", color: "#fff" }}>
              <Icon name="Plus" size={13} />
              Записать выплату
            </button>
          )}
        </div>

        {clients.length === 0 ? (
          <div className="rounded-2xl py-10 text-center" style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)" }}>
            <Icon name="Users" size={32} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Клиентов пока нет</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border-c)" }}>
            {clients.map((c, i) => {
              const statusMeta = DEAL_STATUS_META[c.current_status];
              return (
                <div key={c.id}
                  className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3"
                  style={{ borderBottom: i < clients.length - 1 ? "1px solid var(--border-c)" : "none", background: "#fff" }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--navy)" }}>{c.full_name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: statusMeta?.bg, color: statusMeta?.color }}>
                        {statusMeta?.label}
                      </span>
                      {c.deal_amount != null && c.deal_amount > 0 && (
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>Сделка: {fmtMoney(c.deal_amount)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: c.partner_reward ? "var(--navy)" : "var(--text-muted)" }}>
                        {fmtMoney(c.partner_reward)}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>вознаграждение</p>
                    </div>

                    {isAdmin ? (
                      <button
                        onClick={() => handleTogglePaid(c.id, c.reward_paid)}
                        disabled={togglingId === c.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{
                          background: c.reward_paid ? "rgba(22,163,74,0.1)" : "var(--bg)",
                          color: c.reward_paid ? "var(--success)" : "var(--text-muted)",
                          border: `1px solid ${c.reward_paid ? "rgba(22,163,74,0.3)" : "var(--border-c)"}`,
                        }}>
                        {togglingId === c.id
                          ? <Icon name="LoaderCircle" size={12} className="animate-spin" />
                          : <Icon name={c.reward_paid ? "CheckCircle2" : "Circle"} size={12} />}
                        {c.reward_paid ? "Выплачено" : "Не выплачено"}
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg"
                        style={{
                          background: c.reward_paid ? "rgba(22,163,74,0.1)" : "rgba(217,119,6,0.08)",
                          color: c.reward_paid ? "var(--success)" : "#d97706",
                        }}>
                        <Icon name={c.reward_paid ? "CheckCircle2" : "Clock"} size={12} />
                        {c.reward_paid ? "Выплачено" : "Ожидается"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* История выплат */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Receipt" size={14} style={{ color: "var(--blue)" }} />
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>История выплат</p>
        </div>

        {payments.length === 0 ? (
          <div className="rounded-2xl py-8 text-center" style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)" }}>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Выплат пока не было</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border-c)" }}>
            {payments.map((p, i) => (
              <div key={p.id}
                className="px-4 py-3 flex items-center gap-4"
                style={{ borderBottom: i < payments.length - 1 ? "1px solid var(--border-c)" : "none", background: "#fff" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(22,163,74,0.1)" }}>
                  <Icon name="ArrowDownLeft" size={14} style={{ color: "var(--success)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold" style={{ color: "var(--success)" }}>{fmtMoney(p.amount)}</p>
                    {p.client_name && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--bg)", color: "var(--text-muted)", border: "1px solid var(--border-c)" }}>
                        {p.client_name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{fmtDate(p.paid_at)}</p>
                    {p.paid_by && <p className="text-xs" style={{ color: "var(--text-muted)" }}>Внёс: {p.paid_by}</p>}
                    {p.note && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.note}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модалка добавления выплаты */}
      {showAddPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: "#fff", border: "1px solid var(--border-c)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg" style={{ color: "var(--navy)" }}>Записать выплату</h3>
              <button onClick={() => setShowAddPayment(false)} style={{ color: "var(--text-muted)" }}>
                <Icon name="X" size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Сумма выплаты *</label>
                <input type="number" min="0" step="100"
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                  style={{ background: "var(--bg)", border: "1px solid var(--border-c)", color: "var(--text)" }}
                  placeholder="0"
                  value={payAmount} onChange={e => setPayAmount(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Клиент (необязательно)</label>
                <select className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                  style={{ background: "var(--bg)", border: "1px solid var(--border-c)", color: "var(--text)" }}
                  value={payClientId} onChange={e => setPayClientId(e.target.value ? Number(e.target.value) : "")}>
                  <option value="">— без привязки к клиенту —</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} {c.partner_reward ? `(бонус: ${fmtMoney(c.partner_reward)})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Примечание</label>
                <input className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                  style={{ background: "var(--bg)", border: "1px solid var(--border-c)", color: "var(--text)" }}
                  placeholder="Назначение платежа..."
                  value={payNote} onChange={e => setPayNote(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddPayment(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold"
                style={{ background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border-c)" }}>
                Отмена
              </button>
              <button onClick={handleAddPayment} disabled={savingPayment || !payAmount}
                className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                style={{ background: "var(--blue)", color: "#fff", opacity: !payAmount ? 0.6 : 1 }}>
                {savingPayment ? <Icon name="LoaderCircle" size={15} className="animate-spin" /> : <Icon name="Check" size={15} />}
                Записать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
