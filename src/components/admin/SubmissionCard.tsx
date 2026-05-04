import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";
import PhoneInput from "@/components/ui/PhoneInput";
import EmailInput from "@/components/ui/EmailInput";
import { DADATA_TOKEN } from "@/components/modal/types";

const ADMIN_URL = "https://functions.poehali.dev/2fb10b23-2471-4f73-a39f-315ed4c51e8c";
const SUGGEST_PARTY = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party";
const FIND_PARTY = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party";

const STATUS_OPTIONS = [
  { value: "new",        label: "Новая",           color: "#6b7280" },
  { value: "in_work",    label: "В работе",         color: "#2563eb" },
  { value: "waiting",    label: "Ожидает ответа",   color: "#d97706" },
  { value: "done",       label: "Завершена",        color: "#16a34a" },
  { value: "cancelled",  label: "Отменена",         color: "#ef4444" },
];

const INPUT = "w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all font-body";
const inputStyle = { background: "var(--bg)", border: "1px solid var(--border-c)", color: "var(--text)" };

interface FullSubmission {
  id: number; name: string; phone: string; email: string;
  inn: string | null; inn_company: string | null; message: string | null;
  files_count: number; created_at: string; status: string | null;
  files?: { id: number; file_name: string; file_url: string; file_size: number | null; mime_type: string | null }[];
  contact_position: string | null; contact_note: string | null;
  company_full_name: string | null; company_kpp: string | null;
  company_ogrn: string | null; company_address: string | null;
  company_director: string | null;
  bank_name: string | null; bank_bik: string | null;
  bank_account: string | null; bank_corr: string | null;
}

interface DDSugg { value: string; data: Record<string, unknown> }

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function fmtSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

function fileIcon(mime: string | null): string {
  if (!mime) return "File";
  if (mime.startsWith("image/")) return "Image";
  if (mime.includes("pdf")) return "FileText";
  if (mime.includes("word") || mime.includes("doc")) return "FileType";
  if (mime.includes("excel") || mime.includes("sheet") || mime.includes("xls")) return "Sheet";
  return "Paperclip";
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon name={icon as "Info"} size={14} style={{ color: "var(--blue)" }} />
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{title}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>{label}</label>
      {children}
    </div>
  );
}

interface Props {
  submissionId: number;
  sessionId: string;
  onClose: () => void;
  onUpdated: () => void;
}

export default function SubmissionCard({ submissionId, sessionId, onClose, onUpdated }: Props) {
  const [sub, setSub] = useState<FullSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<FullSubmission>>({});

  // DaData
  const [partySugg, setPartySugg] = useState<DDSugg[]>([]);
  const [partyOpen, setPartyOpen] = useState(false);

  useEffect(() => {
    fetch(ADMIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
      body: JSON.stringify({ action: "get_submission", id: submissionId }),
    }).then(r => r.json()).then(d => {
      if (d.submission) { setSub(d.submission); setForm(d.submission); }
      setLoading(false);
    });
  }, [submissionId, sessionId]);

  // DaData по ИНН компании
  useEffect(() => {
    const v = (form.inn || "").trim();
    if (!v || v.length < 3 || !DADATA_TOKEN) { setPartySugg([]); return; }
    const timer = setTimeout(async () => {
      const url = v.length >= 10 ? FIND_PARTY : SUGGEST_PARTY;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Token ${DADATA_TOKEN}` },
        body: JSON.stringify({ query: v, count: 7 }),
      }).catch(() => null);
      if (!res) return;
      const d = await res.json();
      setPartySugg(d.suggestions || []);
      setPartyOpen(true);
    }, 250);
    return () => clearTimeout(timer);
  }, [form.inn]);

  const applyParty = (s: DDSugg) => {
    const d = s.data;
    const addr = (d.address as Record<string, string> | null)?.value || "";
    const mgmt = d.management as Record<string, string> | null;
    setForm(prev => ({
      ...prev,
      inn: String(d.inn || prev.inn || ""),
      inn_company: String((d.name as Record<string, string>)?.full_with_opf || s.value),
      company_full_name: String((d.name as Record<string, string>)?.full_with_opf || s.value),
      company_kpp: String(d.kpp || ""),
      company_ogrn: String(d.ogrn || ""),
      company_address: addr,
      company_director: mgmt?.name || prev.company_director || "",
    }));
    setPartyOpen(false); setPartySugg([]);
  };

  // DaData по БИК банка
  useEffect(() => {
    const v = (form.bank_bik || "").trim();
    if (!v || v.length < 3 || !DADATA_TOKEN) return;
    const timer = setTimeout(async () => {
      const res = await fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/bank", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Token ${DADATA_TOKEN}` },
        body: JSON.stringify({ query: v, count: 1 }),
      }).catch(() => null);
      if (!res) return;
      const d = await res.json();
      const s = d.suggestions?.[0];
      if (s) setForm(prev => ({ ...prev, bank_name: s.value, bank_corr: String(s.data?.correspondent_account || prev.bank_corr || "") }));
    }, 300);
    return () => clearTimeout(timer);
  }, [form.bank_bik]);

  const set = (k: keyof FullSubmission) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(ADMIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
      body: JSON.stringify({ action: "update_submission", ...form, id: submissionId }),
    });
    const d = await res.json();
    setSaving(false);
    if (d.ok) { toast.success("Сохранено"); onUpdated(); }
    else toast.error(d.error || "Ошибка сохранения");
  };

  if (loading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
      <Icon name="LoaderCircle" size={32} className="animate-spin" style={{ color: "#fff" }} />
    </div>
  );
  if (!sub) return null;

  const statusMeta = STATUS_OPTIONS.find(s => s.value === (form.status || "new")) || STATUS_OPTIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 md:p-6 overflow-y-auto" style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}>
      <div className="w-full max-w-2xl my-4 rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid var(--border-c)" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-5 py-4 flex items-start justify-between gap-3" style={{ background: "var(--navy)" }}>
          <div className="min-w-0">
            <p className="text-xs font-semibold opacity-60" style={{ color: "#fff" }}>Заявка #{sub.id} · {formatDate(sub.created_at)}</p>
            <h3 className="text-lg font-bold mt-0.5 truncate" style={{ color: "#fff", fontFamily: "Playfair Display, serif" }}>{sub.name || "—"}</h3>
          </div>
          <button onClick={onClose} className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity mt-1" style={{ color: "#fff" }}>
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="p-5 space-y-6">

          {/* Статус */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Статус заявки:</span>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(s => (
                <button key={s.value} type="button"
                  onClick={() => setForm(prev => ({ ...prev, status: s.value }))}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all border"
                  style={{
                    background: (form.status || "new") === s.value ? s.color : "transparent",
                    color: (form.status || "new") === s.value ? "#fff" : s.color,
                    borderColor: s.color,
                  }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Исходное сообщение */}
          {sub.message && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "var(--bg)", border: "1px solid var(--border-c)", color: "var(--text)" }}>
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Сообщение клиента</p>
              {sub.message}
            </div>
          )}

          {/* Контактные данные */}
          <Section title="Контактные данные" icon="User">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Имя">
                <input className={INPUT} style={inputStyle} value={form.name || ""} onChange={set("name")} />
              </Field>
              <Field label="Должность">
                <input className={INPUT} style={inputStyle} placeholder="Директор, бухгалтер..." value={form.contact_position || ""} onChange={set("contact_position")} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Телефон">
                <PhoneInput className={INPUT} style={inputStyle} value={form.phone || ""} onChange={v => setForm(p => ({ ...p, phone: v }))} />
              </Field>
              <Field label="Email">
                <EmailInput className={INPUT} style={inputStyle} value={form.email || ""} onChange={v => setForm(p => ({ ...p, email: v }))} />
              </Field>
            </div>
            <Field label="Заметка о клиенте">
              <textarea className={INPUT} style={{ ...inputStyle, resize: "none" }} rows={2}
                placeholder="Любые пометки..." value={form.contact_note || ""} onChange={set("contact_note")} />
            </Field>
          </Section>

          {/* Файлы */}
          {sub.files && sub.files.length > 0 && (
            <Section title={`Приложенные файлы (${sub.files.length})`} icon="Paperclip">
              <div className="space-y-2">
                {sub.files.map(f => (
                  <a key={f.id} href={f.file_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all group"
                    style={{ background: "var(--bg)", border: "1px solid var(--border-c)" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(37,99,235,0.3)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border-c)")}>
                    <Icon name={fileIcon(f.mime_type) as "File"} size={18} style={{ color: "var(--blue)" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--navy)" }}>{f.file_name}</p>
                      {f.file_size && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{fmtSize(f.file_size)}</p>}
                    </div>
                    <Icon name="ExternalLink" size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--blue)" }} />
                  </a>
                ))}
              </div>
            </Section>
          )}
          {sub.files_count > 0 && (!sub.files || sub.files.length === 0) && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(217,119,6,0.06)", border: "1px solid rgba(217,119,6,0.2)", color: "#d97706" }}>
              <Icon name="AlertCircle" size={14} className="inline mr-1.5" />
              {sub.files_count} файл(а) были отправлены до обновления системы — доступны только в Telegram
            </div>
          )}

          {/* Реквизиты компании */}
          <Section title="Реквизиты компании" icon="Building">
            <Field label="ИНН (данные подтянутся автоматически)">
              <div className="relative">
                <input className={INPUT} style={inputStyle} placeholder="Введите ИНН..."
                  value={form.inn || ""}
                  onChange={set("inn")}
                  onFocus={() => partySugg.length > 0 && setPartyOpen(true)}
                  onBlur={() => setTimeout(() => setPartyOpen(false), 150)} />
                {partyOpen && partySugg.length > 0 && (
                  <ul className="absolute left-0 right-0 z-50 rounded-xl overflow-hidden text-sm mt-1"
                    style={{ background: "#fff", border: "1px solid var(--border-c)", boxShadow: "0 8px 24px rgba(0,0,0,0.10)", top: "100%" }}>
                    {partySugg.map((s, i) => (
                      <li key={i} onMouseDown={() => applyParty(s)}
                        className="px-4 py-2.5 cursor-pointer"
                        style={{ borderBottom: i < partySugg.length - 1 ? "1px solid var(--border-c)" : "none" }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "var(--bg)")}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#fff")}>
                        <p className="font-medium text-sm truncate" style={{ color: "var(--navy)" }}>{s.value}</p>
                        {s.data.inn && <p className="text-xs" style={{ color: "var(--text-muted)" }}>ИНН: {String(s.data.inn)}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Field>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Полное наименование">
                <input className={INPUT} style={inputStyle} value={form.company_full_name || ""} onChange={set("company_full_name")} />
              </Field>
              <Field label="КПП">
                <input className={INPUT} style={inputStyle} value={form.company_kpp || ""} onChange={set("company_kpp")} />
              </Field>
              <Field label="ОГРН">
                <input className={INPUT} style={inputStyle} value={form.company_ogrn || ""} onChange={set("company_ogrn")} />
              </Field>
              <Field label="Руководитель">
                <input className={INPUT} style={inputStyle} value={form.company_director || ""} onChange={set("company_director")} />
              </Field>
            </div>
            <Field label="Юридический адрес">
              <input className={INPUT} style={inputStyle} value={form.company_address || ""} onChange={set("company_address")} />
            </Field>
          </Section>

          {/* Банковские реквизиты */}
          <Section title="Банковские реквизиты" icon="CreditCard">
            <Field label="БИК (банк и корр. счёт подтянутся)">
              <input className={INPUT} style={inputStyle} placeholder="044525225"
                value={form.bank_bik || ""} onChange={set("bank_bik")} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Название банка">
                <input className={INPUT} style={inputStyle} placeholder="Заполнится по БИК" value={form.bank_name || ""} onChange={set("bank_name")} />
              </Field>
              <Field label="Расчётный счёт">
                <input className={INPUT} style={inputStyle} value={form.bank_account || ""} onChange={set("bank_account")} />
              </Field>
              <Field label="Корр. счёт">
                <input className={INPUT} style={inputStyle} placeholder="Заполнится по БИК" value={form.bank_corr || ""} onChange={set("bank_corr")} />
              </Field>
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex items-center justify-between gap-3" style={{ borderTop: "1px solid var(--border-c)", background: "var(--bg)" }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: statusMeta.color }} />
            <span className="text-xs font-semibold" style={{ color: statusMeta.color }}>{statusMeta.label}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: "var(--bg-white)", color: "var(--text-muted)", border: "1px solid var(--border-c)" }}>
              Закрыть
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
              style={{ background: "var(--blue)", color: "#fff", opacity: saving ? 0.7 : 1 }}>
              {saving ? <Icon name="LoaderCircle" size={15} className="animate-spin" /> : <Icon name="Save" size={15} />}
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}