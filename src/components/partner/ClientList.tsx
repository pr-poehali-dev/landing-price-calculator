import { useState, useEffect, useCallback, useRef } from "react";
import Icon from "@/components/ui/icon";
import PhoneInput from "@/components/ui/PhoneInput";
import EmailInput from "@/components/ui/EmailInput";
import {
  apiPartner, DEAL_STATUS_META, fmtDate, fmtMoney,
  DADATA_TOKEN,
  type Client, type DealStatus,
} from "./types";

const SUGGEST_PARTY = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party";
const FIND_PARTY    = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party";
const SUGGEST_FIO   = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fio";

interface Props {
  sessionId: string;
  onSelectClient: (id: number) => void;
}

interface AddForm {
  full_name: string; inn: string; phone: string; email: string;
  contact_person: string; deal_amount: string; partner_reward: string; notes: string;
}

const EMPTY_FORM: AddForm = {
  full_name: "", inn: "", phone: "", email: "",
  contact_person: "", deal_amount: "", partner_reward: "", notes: "",
};

const INPUT = "w-full px-4 py-3 rounded-lg text-sm outline-none transition-all font-body";
const inputStyle = { background: "var(--bg)", border: "1px solid var(--border-c)", color: "var(--text)" };

interface DDSugg { value: string; data: Record<string, unknown> }

async function ddFetch(url: string, body: object): Promise<DDSugg[]> {
  if (!DADATA_TOKEN) return [];
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Token ${DADATA_TOKEN}` },
    body: JSON.stringify(body),
  }).catch(() => null);
  if (!res) return [];
  const d = await res.json();
  return d.suggestions || [];
}

function DaDropdown({ suggestions, onSelect, loading }: {
  suggestions: DDSugg[];
  onSelect: (s: DDSugg) => void;
  loading?: boolean;
}) {
  if (loading) return (
    <div className="absolute right-3 top-1/2 -translate-y-1/2">
      <Icon name="LoaderCircle" size={14} className="animate-spin" style={{ color: "var(--text-muted)" }} />
    </div>
  );
  if (!suggestions.length) return null;
  return (
    <ul className="absolute left-0 right-0 z-[100] rounded-xl overflow-hidden text-sm mt-1"
      style={{ background: "#fff", border: "1px solid var(--border-c)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", top: "100%" }}>
      {suggestions.map((s, i) => (
        <li key={i} onMouseDown={() => onSelect(s)}
          className="px-4 py-2.5 cursor-pointer"
          style={{ borderBottom: i < suggestions.length - 1 ? "1px solid var(--border-c)" : "none" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#fff")}>
          <p className="font-medium truncate text-sm" style={{ color: "var(--navy)" }}>{s.value}</p>
          {s.data.inn && <p className="text-xs" style={{ color: "var(--text-muted)" }}>ИНН: {String(s.data.inn)}</p>}
        </li>
      ))}
    </ul>
  );
}

export default function ClientList({ sessionId, onSelectClient }: Props) {
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<AddForm>(EMPTY_FORM);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  // DaData: party по ИНН
  const [partySugg, setPartySugg] = useState<DDSugg[]>([]);
  const [partyOpen, setPartyOpen] = useState(false);
  const [partyLoading, setPartyLoading] = useState(false);
  const partyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // DaData: ФИО контактного лица
  const [fioSugg, setFioSugg] = useState<DDSugg[]>([]);
  const [fioOpen, setFioOpen] = useState(false);
  const [fioLoading, setFioLoading] = useState(false);
  const fioTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    const data = await apiPartner(sessionId, { action: "get_clients", page: p, q, status: statusFilter });
    setClients(data.clients || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [sessionId, q, statusFilter]);

  useEffect(() => { setPage(1); }, [q, statusFilter]);
  useEffect(() => { load(page); }, [load, page]);

  // DaData: ИНН → party
  useEffect(() => {
    if (!showAdd) return;
    if (partyTimer.current) clearTimeout(partyTimer.current);
    const v = form.inn.trim();
    if (!v || v.length < 3) { setPartySugg([]); return; }
    setPartyLoading(true);
    partyTimer.current = setTimeout(async () => {
      const url = v.length >= 10 ? FIND_PARTY : SUGGEST_PARTY;
      const s = await ddFetch(url, { query: v, count: 7 });
      setPartySugg(s); setPartyOpen(true); setPartyLoading(false);
    }, 250);
  }, [form.inn, showAdd]);

  // DaData: ФИО контактного лица
  useEffect(() => {
    if (!showAdd) return;
    if (fioTimer.current) clearTimeout(fioTimer.current);
    const v = form.contact_person.trim();
    if (!v || v.length < 2) { setFioSugg([]); return; }
    setFioLoading(true);
    fioTimer.current = setTimeout(async () => {
      const s = await ddFetch(SUGGEST_FIO, { query: v, count: 5 });
      setFioSugg(s); setFioOpen(true); setFioLoading(false);
    }, 300);
  }, [form.contact_person, showAdd]);

  const applyParty = (s: DDSugg) => {
    const d = s.data;
    const mgmt = d.management as Record<string, string> | null;
    setForm(prev => ({
      ...prev,
      inn: String(d.inn || prev.inn),
      full_name: String((d.name as Record<string, string>)?.full_with_opf || s.value),
      contact_person: mgmt?.name || prev.contact_person,
    }));
    setPartyOpen(false); setPartySugg([]);
  };

  const applyFio = (s: DDSugg) => {
    setForm(prev => ({ ...prev, contact_person: s.value }));
    setFioOpen(false); setFioSugg([]);
  };

  const setF = (k: keyof AddForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleAdd = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setAddError("");
    if (!form.full_name.trim()) { setAddError("Укажите ФИО / наименование"); return; }
    setAdding(true);
    const data = await apiPartner(sessionId, { action: "add_client", ...form });
    setAdding(false);
    if (data.error) { setAddError(data.error); return; }
    setShowAdd(false);
    setForm(EMPTY_FORM);
    setPartySugg([]); setFioSugg([]);
    load(1);
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
          <input className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none"
            style={inputStyle} placeholder="Поиск по ФИО, ИНН, телефону..."
            value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg text-sm outline-none"
          style={inputStyle}>
          <option value="">Все статусы</option>
          {(Object.entries(DEAL_STATUS_META) as [DealStatus, typeof DEAL_STATUS_META[DealStatus]][]).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <button onClick={() => setShowAdd(true)}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2"
          style={{ background: "var(--blue)", color: "#fff" }}>
          <Icon name="UserPlus" size={15} />
          Добавить клиента
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Icon name="LoaderCircle" size={24} className="animate-spin" style={{ color: "var(--blue)" }} />
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
          <Icon name="Users" size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">Клиентов не найдено</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border-c)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border-c)" }}>
                  {["Клиент", "ИНН", "Телефон", "Статус", "Сумма сделки", "Дата"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map((c, i) => {
                  const meta = DEAL_STATUS_META[c.current_status];
                  return (
                    <tr key={c.id} className="cursor-pointer transition-colors"
                      style={{ borderBottom: i < clients.length - 1 ? "1px solid var(--border-c)" : "none", background: "#fff" }}
                      onClick={() => onSelectClient(c.id)}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#fff")}>
                      <td className="px-4 py-3 font-semibold" style={{ color: "var(--navy)" }}>{c.full_name}</td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{c.inn || "—"}</td>
                      <td className="px-4 py-3" style={{ color: "var(--text)" }}>{c.phone || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: meta?.bg, color: meta?.color }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta?.color }} />
                          {meta?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--text)" }}>{fmtMoney(c.deal_amount)}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{fmtDate(c.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {clients.map(c => {
              const meta = DEAL_STATUS_META[c.current_status];
              return (
                <div key={c.id} className="rounded-2xl p-4 cursor-pointer transition-all"
                  style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)" }}
                  onClick={() => onSelectClient(c.id)}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-semibold text-sm" style={{ color: "var(--navy)" }}>{c.full_name}</p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: meta?.bg, color: meta?.color }}>{meta?.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    {c.inn && <span>ИНН: {c.inn}</span>}
                    {c.phone && <span>{c.phone}</span>}
                    <span>{fmtDate(c.created_at)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ background: "var(--bg)", border: "1px solid var(--border-c)", color: "var(--text)", opacity: page === 1 ? 0.4 : 1 }}>
                ← Назад
              </button>
              <span className="px-4 py-2 text-sm" style={{ color: "var(--text-muted)" }}>{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ background: "var(--bg)", border: "1px solid var(--border-c)", color: "var(--text)", opacity: page === totalPages ? 0.4 : 1 }}>
                Далее →
              </button>
            </div>
          )}
        </>
      )}

      {/* Add client modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="rounded-2xl w-full max-w-lg my-8" style={{ background: "#fff", border: "1px solid var(--border-c)" }}>
            <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-c)" }}>
              <h3 className="font-bold text-lg" style={{ color: "var(--navy)" }}>Добавить клиента</h3>
              <button onClick={() => setShowAdd(false)} style={{ color: "var(--text-muted)" }}>
                <Icon name="X" size={18} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              {/* ИНН с DaData — вне grid чтобы дропдаун не обрезался */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>
                  ИНН <span className="font-normal">(название и контакт подтянутся автоматически)</span>
                </label>
                <div className="relative">
                  <input className={INPUT} style={inputStyle}
                    placeholder="Введите ИНН или название организации"
                    value={form.inn} onChange={setF("inn")}
                    onFocus={() => partySugg.length > 0 && setPartyOpen(true)}
                    onBlur={() => setTimeout(() => setPartyOpen(false), 150)} />
                  <DaDropdown suggestions={partyOpen ? partySugg : []} onSelect={applyParty} loading={partyLoading} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>ФИО / Наименование <span style={{ color: "#ef4444" }}>*</span></label>
                <input className={INPUT} style={inputStyle} placeholder="Иванов Иван Иванович" value={form.full_name} onChange={setF("full_name")} />
              </div>
              {/* Контактное лицо с DaData ФИО — вне grid */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Контактное лицо</label>
                <div className="relative">
                  <input className={INPUT} style={inputStyle}
                    placeholder="Иванов Иван — ФИО подскажем"
                    value={form.contact_person} onChange={setF("contact_person")}
                    onFocus={() => fioSugg.length > 0 && setFioOpen(true)}
                    onBlur={() => setTimeout(() => setFioOpen(false), 150)} />
                  <DaDropdown suggestions={fioOpen ? fioSugg : []} onSelect={applyFio} loading={fioLoading} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Телефон</label>
                <PhoneInput className={INPUT} style={inputStyle}
                  value={form.phone} onChange={v => setForm(prev => ({ ...prev, phone: v }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Email</label>
                <EmailInput className={INPUT} style={inputStyle}
                  value={form.email} onChange={v => setForm(prev => ({ ...prev, email: v }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Сумма сделки</label>
                  <input className={INPUT} style={inputStyle} placeholder="0" type="number" value={form.deal_amount} onChange={setF("deal_amount")} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Вознаграждение</label>
                  <input className={INPUT} style={inputStyle} placeholder="0" type="number" value={form.partner_reward} onChange={setF("partner_reward")} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Примечание</label>
                <textarea className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={{ ...inputStyle, resize: "none" }}
                  rows={2} placeholder="Любая дополнительная информация" value={form.notes} onChange={setF("notes")} />
              </div>
              {addError && <p className="text-sm px-4 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}>{addError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border-c)" }}>
                  Отмена
                </button>
                <button type="submit" disabled={adding}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                  style={{ background: "var(--blue)", color: "#fff" }}>
                  {adding ? <Icon name="LoaderCircle" size={16} className="animate-spin" /> : <Icon name="UserPlus" size={16} />}
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}