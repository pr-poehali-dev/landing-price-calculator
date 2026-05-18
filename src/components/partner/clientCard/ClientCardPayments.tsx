import { useState } from "react";
import Icon from "@/components/ui/icon";
import { fmtDate, fmtMoney, type ClientDetail } from "../types";
import { Section, Row } from "./clientCardShared";
import type { ClientPayment } from "./ClientCardInfo";

interface Props {
  isAdmin: boolean;
  client: ClientDetail;
  clientPayments: ClientPayment[];
  onAddClientPayment: (amount: number, description: string, status: string) => Promise<void>;
  onUpdateClientPayment: (id: number, status: string, paid_at?: string) => Promise<void>;
  onDeleteClientPayment: (id: number) => Promise<void>;
}

export default function ClientCardPayments({
  isAdmin, client, clientPayments,
  onAddClientPayment, onUpdateClientPayment, onDeleteClientPayment,
}: Props) {
  const [addingPayment, setAddingPayment] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payDesc, setPayDesc] = useState("");
  const [payStatus, setPayStatus] = useState("pending");
  const [savingPayment, setSavingPayment] = useState(false);
  const [deletingPaymentId, setDeletingPaymentId] = useState<number | null>(null);

  if (!isAdmin) return null;

  return (
    <>
      {/* Финансы сделки */}
      <Section title="Финансовая информация" icon="DollarSign">
        <Row label="Сумма сделки" value={fmtMoney(client.deal_amount)} />
        <Row label="Вознаграждение" value={fmtMoney(client.partner_reward)} />
        <div className="py-2">
          <span className="block text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Выплата</span>
          <span className="text-sm font-semibold"
            style={{ color: client.reward_paid ? "var(--success)" : "#d97706" }}>
            {client.reward_paid ? "Выплачено" : "Ожидается"}
          </span>
        </div>
      </Section>

      {/* Оплаты клиента */}
      <Section title="Оплаты клиента" icon="CreditCard">
        {clientPayments.length > 0 && (
          <div className="space-y-2 mb-4">
            {clientPayments.map(p => {
              const isPaid = p.status === "paid";
              return (
                <div key={p.id} className="rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                  style={{ background: "var(--bg)", border: "1px solid var(--border-c)" }}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: isPaid ? "rgba(22,163,74,0.1)" : "rgba(217,119,6,0.1)" }}>
                      <Icon name={isPaid ? "CheckCircle" : "Clock"} size={15}
                        style={{ color: isPaid ? "var(--success)" : "#d97706" }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--navy)" }}>
                        {fmtMoney(p.amount)}
                        <span className="ml-2 text-xs font-normal" style={{ color: isPaid ? "var(--success)" : "#d97706" }}>
                          {isPaid ? "Оплачено" : "Ожидает"}
                        </span>
                      </p>
                      {p.description && <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{p.description}</p>}
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {isPaid && p.paid_at ? `${fmtDate(p.paid_at)}` : fmtDate(p.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!isPaid && (
                      <button
                        onClick={async () => {
                          await onUpdateClientPayment(p.id, "paid", new Date().toISOString());
                        }}
                        title="Отметить оплаченным"
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                        style={{ background: "rgba(22,163,74,0.1)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(22,163,74,0.2)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "rgba(22,163,74,0.1)")}>
                        <Icon name="Check" size={13} style={{ color: "var(--success)" }} />
                      </button>
                    )}
                    {isPaid && (
                      <button
                        onClick={async () => { await onUpdateClientPayment(p.id, "pending", undefined); }}
                        title="Снять отметку"
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                        style={{ background: "rgba(107,114,128,0.1)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(107,114,128,0.2)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "rgba(107,114,128,0.1)")}>
                        <Icon name="RotateCcw" size={12} style={{ color: "var(--text-muted)" }} />
                      </button>
                    )}
                    <button
                      disabled={deletingPaymentId === p.id}
                      onClick={async () => {
                        setDeletingPaymentId(p.id);
                        await onDeleteClientPayment(p.id);
                        setDeletingPaymentId(null);
                      }}
                      title="Удалить"
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                      style={{ background: "rgba(239,68,68,0.08)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.18)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}>
                      {deletingPaymentId === p.id
                        ? <Icon name="LoaderCircle" size={12} className="animate-spin" style={{ color: "#ef4444" }} />
                        : <Icon name="Trash2" size={12} style={{ color: "#ef4444" }} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {addingPayment ? (
          <div className="rounded-xl p-4 space-y-3" style={{ background: "var(--bg)", border: "1px solid var(--border-c)" }}>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>Сумма, ₽</label>
                <input
                  type="number" placeholder="0" value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)", color: "var(--text)" }} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>Статус</label>
                <select value={payStatus} onChange={e => setPayStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)", color: "var(--text)" }}>
                  <option value="pending">Ожидает оплаты</option>
                  <option value="paid">Оплачено</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>Описание (необязательно)</label>
              <input
                type="text" placeholder="Например: Аванс по договору"
                value={payDesc} onChange={e => setPayDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)", color: "var(--text)" }} />
            </div>
            <div className="flex gap-2">
              <button
                disabled={savingPayment || !payAmount}
                onClick={async () => {
                  if (!payAmount) return;
                  setSavingPayment(true);
                  await onAddClientPayment(parseFloat(payAmount), payDesc, payStatus);
                  setPayAmount(""); setPayDesc(""); setPayStatus("pending");
                  setAddingPayment(false); setSavingPayment(false);
                }}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                style={{ background: "var(--blue)", color: "#fff", opacity: savingPayment || !payAmount ? 0.6 : 1 }}>
                {savingPayment ? <Icon name="LoaderCircle" size={13} className="animate-spin" /> : <Icon name="Plus" size={13} />}
                Добавить
              </button>
              <button onClick={() => { setAddingPayment(false); setPayAmount(""); setPayDesc(""); setPayStatus("pending"); }}
                className="px-4 py-2 rounded-lg text-xs font-semibold"
                style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)", color: "var(--text-muted)" }}>
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAddingPayment(true)}
            className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            style={{ background: "var(--bg)", border: "1px dashed var(--border-c)", color: "var(--text-muted)" }}>
            <Icon name="Plus" size={14} />
            Добавить оплату
          </button>
        )}
      </Section>
    </>
  );
}
