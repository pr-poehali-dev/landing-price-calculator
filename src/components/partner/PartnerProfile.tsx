import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import {
  apiPartner, DADATA_TOKEN, PARTNER_TYPE_LABELS,
  type Partner, type PartnerType,
} from "./types";

const SUGGEST_PARTY  = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party";
const FIND_PARTY     = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party";
const SUGGEST_BANK   = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/bank";
const SUGGEST_ADDR   = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";
const SUGGEST_FIO    = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fio";

interface Props { sessionId: string; onSaved?: (p: Partner) => void; isAdmin?: boolean }
interface DDSuggestion { value: string; data: Record<string, unknown> }

const INPUT = "w-full px-4 py-3 rounded-lg text-sm outline-none transition-all font-body";
const inputStyle = { background: "var(--bg)", border: "1px solid var(--border-c)", color: "var(--text)" };
const inputStyleMissing = { background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.35)", color: "var(--text)" };

function Field({ label, children, required, missing }: { label: string; children: React.ReactNode; required?: boolean; missing?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1" style={{ color: missing ? "#ef4444" : "var(--text-muted)" }}>
        {label}{required && <span style={{ color: "#ef4444" }}> *</span>}
        {missing && <span className="text-xs font-normal">(не заполнено)</span>}
      </label>
      {children}
    </div>
  );
}

async function ddFetch(url: string, body: object): Promise<DDSuggestion[]> {
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
  suggestions: DDSuggestion[];
  onSelect: (s: DDSuggestion) => void;
  loading: boolean;
}) {
  if (loading) return (
    <div className="absolute right-3 top-1/2 -translate-y-1/2">
      <Icon name="LoaderCircle" size={14} className="animate-spin" style={{ color: "var(--text-muted)" }} />
    </div>
  );
  if (!suggestions.length) return null;
  return (
    <ul className="absolute left-0 right-0 z-50 rounded-xl overflow-hidden text-sm mt-1"
      style={{ background: "#fff", border: "1px solid var(--border-c)", boxShadow: "0 8px 24px rgba(0,0,0,0.10)", top: "100%" }}>
      {suggestions.map((s, i) => (
        <li key={i} onMouseDown={() => onSelect(s)}
          className="px-4 py-2.5 cursor-pointer"
          style={{ borderBottom: i < suggestions.length - 1 ? "1px solid var(--border-c)" : "none" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#fff")}>
          <p className="font-medium truncate" style={{ color: "var(--navy)" }}>{s.value}</p>
          {s.data.inn && <p className="text-xs" style={{ color: "var(--text-muted)" }}>ИНН: {String(s.data.inn)}</p>}
          {s.data.bic && <p className="text-xs" style={{ color: "var(--text-muted)" }}>БИК: {String(s.data.bic)}</p>}
        </li>
      ))}
    </ul>
  );
}

const REQUIRED_FIELDS: { key: string; label: string }[] = [
  { key: "inn",          label: "ИНН" },
  { key: "full_name",    label: "Полное наименование" },
  { key: "legal_address",label: "Юридический адрес" },
  { key: "director_name",label: "Руководитель / ФИО ИП" },
  { key: "bank_bik",     label: "БИК банка" },
  { key: "bank_account", label: "Расчётный счёт" },
  { key: "contact_name", label: "Контактное лицо" },
  { key: "contact_phone",label: "Телефон" },
  { key: "contact_email",label: "Email" },
];

export default function PartnerProfile({ sessionId, onSaved, isAdmin = false }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [form, setForm] = useState<Record<string, string>>({
    partner_type: "legal", inn: "", kpp: "", ogrn: "", full_name: "", short_name: "",
    legal_address: "", director_name: "", bank_name: "", bank_bik: "", bank_account: "",
    bank_corr: "", contact_name: "", contact_phone: "", contact_email: "",
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showMissing, setShowMissing] = useState(false);

  // DaData: party (ИНН)
  const [partySugg, setPartySugg] = useState<DDSuggestion[]>([]);
  const [partyOpen, setPartyOpen] = useState(false);
  const [partyLoading, setPartyLoading] = useState(false);
  const partyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // DaData: bank (БИК)
  const [bankSugg, setBankSugg] = useState<DDSuggestion[]>([]);
  const [bankOpen, setBankOpen] = useState(false);
  const [bankLoading, setBankLoading] = useState(false);
  const bankTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // DaData: address
  const [addrSugg, setAddrSugg] = useState<DDSuggestion[]>([]);
  const [addrOpen, setAddrOpen] = useState(false);
  const [addrLoading, setAddrLoading] = useState(false);
  const addrTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // DaData: director FIO
  const [dirSugg, setDirSugg] = useState<DDSuggestion[]>([]);
  const [dirOpen, setDirOpen] = useState(false);
  const [dirLoading, setDirLoading] = useState(false);
  const dirTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // DaData: contact FIO
  const [ctcSugg, setCtcSugg] = useState<DDSuggestion[]>([]);
  const [ctcOpen, setCtcOpen] = useState(false);
  const [ctcLoading, setCtcLoading] = useState(false);
  const ctcTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      const data = await apiPartner(sessionId, { action: "get_profile" });
      if (data.partner) {
        const p: Partner = data.partner;
        setPartner(p);
        const f = {
          partner_type: p.partner_type || "legal",
          inn: p.inn || "", kpp: p.kpp || "", ogrn: p.ogrn || "",
          full_name: p.full_name || "", short_name: p.short_name || "",
          legal_address: p.legal_address || "", director_name: p.director_name || "",
          bank_name: p.bank_name || "", bank_bik: p.bank_bik || "",
          bank_account: p.bank_account || "", bank_corr: p.bank_corr || "",
          contact_name: p.contact_name || "", contact_phone: p.contact_phone || "",
          contact_email: p.contact_email || "",
        };
        setForm(f);
        const missing = REQUIRED_FIELDS.filter(rf => !f[rf.key]);
        setShowMissing(missing.length > 0);
      }
      setLoading(false);
    })();
  }, [sessionId]);

  // ИНН → party
  useEffect(() => {
    if (partyTimer.current) clearTimeout(partyTimer.current);
    const v = form.inn.trim();
    if (!v || v.length < 3) { setPartySugg([]); return; }
    setPartyLoading(true);
    partyTimer.current = setTimeout(async () => {
      const url = v.length >= 10 ? FIND_PARTY : SUGGEST_PARTY;
      const s = await ddFetch(url, { query: v, count: 7 });
      setPartySugg(s); setPartyOpen(true); setPartyLoading(false);
    }, 250);
  }, [form.inn]);

  // БИК → bank
  useEffect(() => {
    if (bankTimer.current) clearTimeout(bankTimer.current);
    const v = form.bank_bik.trim();
    if (!v || v.length < 3) { setBankSugg([]); return; }
    setBankLoading(true);
    bankTimer.current = setTimeout(async () => {
      const s = await ddFetch(SUGGEST_BANK, { query: v, count: 5 });
      setBankSugg(s); setBankOpen(true); setBankLoading(false);
    }, 250);
  }, [form.bank_bik]);

  // Адрес
  useEffect(() => {
    if (addrTimer.current) clearTimeout(addrTimer.current);
    const v = form.legal_address.trim();
    if (!v || v.length < 3) { setAddrSugg([]); return; }
    setAddrLoading(true);
    addrTimer.current = setTimeout(async () => {
      const s = await ddFetch(SUGGEST_ADDR, { query: v, count: 5 });
      setAddrSugg(s); setAddrOpen(true); setAddrLoading(false);
    }, 350);
  }, [form.legal_address]);

  // ФИО директора
  useEffect(() => {
    if (dirTimer.current) clearTimeout(dirTimer.current);
    const v = form.director_name.trim();
    if (!v || v.length < 2) { setDirSugg([]); return; }
    setDirLoading(true);
    dirTimer.current = setTimeout(async () => {
      const s = await ddFetch(SUGGEST_FIO, { query: v, count: 5 });
      setDirSugg(s); setDirOpen(true); setDirLoading(false);
    }, 300);
  }, [form.director_name]);

  // ФИО контакта
  useEffect(() => {
    if (ctcTimer.current) clearTimeout(ctcTimer.current);
    const v = form.contact_name.trim();
    if (!v || v.length < 2) { setCtcSugg([]); return; }
    setCtcLoading(true);
    ctcTimer.current = setTimeout(async () => {
      const s = await ddFetch(SUGGEST_FIO, { query: v, count: 5 });
      setCtcSugg(s); setCtcOpen(true); setCtcLoading(false);
    }, 300);
  }, [form.contact_name]);

  const applyParty = (s: DDSuggestion) => {
    const d = s.data;
    const addr = (d.address as Record<string, string> | null)?.value || "";
    const mgmt = d.management as Record<string, string> | null;
    setForm(prev => ({
      ...prev,
      inn: String(d.inn || prev.inn),
      kpp: String(d.kpp || ""),
      ogrn: String(d.ogrn || ""),
      full_name: String((d.name as Record<string, string>)?.full_with_opf || s.value),
      short_name: String((d.name as Record<string, string>)?.short_with_opf || s.value),
      legal_address: addr,
      director_name: mgmt?.name || "",
    }));
    setPartyOpen(false); setPartySugg([]);
  };

  const applyBank = (s: DDSuggestion) => {
    const d = s.data;
    setForm(prev => ({
      ...prev,
      bank_bik: String(d.bic || prev.bank_bik),
      bank_name: s.value,
      bank_corr: String(d.correspondent_account || ""),
    }));
    setBankOpen(false); setBankSugg([]);
  };

  const applyAddr = (s: DDSuggestion) => {
    setForm(prev => ({ ...prev, legal_address: s.value }));
    setAddrOpen(false); setAddrSugg([]);
  };

  const applyDir = (s: DDSuggestion) => {
    setForm(prev => ({ ...prev, director_name: s.value }));
    setDirOpen(false); setDirSugg([]);
  };

  const applyCtc = (s: DDSuggestion) => {
    setForm(prev => ({ ...prev, contact_name: s.value }));
    setCtcOpen(false); setCtcSugg([]);
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.inn.trim()) { setError("Укажите ИНН"); return; }
    setSaving(true); setError("");
    const data = await apiPartner(sessionId, { action: "save_profile", ...form });
    setSaving(false);
    if (data.error) { setError(data.error); return; }
    setPartner(data.partner);
    const missing = REQUIRED_FIELDS.filter(rf => !form[rf.key]);
    setShowMissing(missing.length > 0);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    if (onSaved) onSaved(data.partner);
  };

  const missingFields = REQUIRED_FIELDS.filter(rf => !form[rf.key]);
  const isMissing = (key: string) => !isAdmin && showMissing && !form[key];

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Icon name="LoaderCircle" size={28} className="animate-spin" style={{ color: "var(--blue)" }} />
    </div>
  );

  return (
    <form onSubmit={handleSave} className="space-y-8">

      {/* Реферальный код */}
      {partner?.ref_code && (
        <div className="rounded-xl px-5 py-4 flex items-center gap-4" style={{ background: "var(--blue-dim)", border: "1px solid rgba(37,99,235,0.2)" }}>
          <Icon name="Link" size={18} style={{ color: "var(--blue)" }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold" style={{ color: "var(--blue)" }}>Реферальный код</p>
            <p className="text-sm font-mono font-bold" style={{ color: "var(--navy)" }}>{partner.ref_code}</p>
          </div>
        </div>
      )}

      {/* Блок незаполненных полей */}
      {!isAdmin && showMissing && missingFields.length > 0 && (
        <div className="rounded-xl px-5 py-4" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.25)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Icon name="AlertCircle" size={16} style={{ color: "#ef4444" }} />
            <p className="text-sm font-semibold" style={{ color: "#ef4444" }}>
              Профиль заполнен не полностью — {missingFields.length} {missingFields.length === 1 ? "поле" : missingFields.length < 5 ? "поля" : "полей"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {missingFields.map(f => (
              <span key={f.key} className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                {f.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Тип партнёра */}
      <div>
        <h3 className="text-sm font-bold mb-4 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Тип партнёра</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {(Object.entries(PARTNER_TYPE_LABELS) as [PartnerType, string][]).map(([val, label]) => (
            <label key={val} className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-all"
              style={{
                border: `2px solid ${form.partner_type === val ? "var(--blue)" : "var(--border-c)"}`,
                background: form.partner_type === val ? "var(--blue-dim)" : "var(--bg)",
              }}>
              <input type="radio" name="partner_type" value={val} checked={form.partner_type === val}
                onChange={set("partner_type")} className="hidden" />
              <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                style={{ borderColor: form.partner_type === val ? "var(--blue)" : "var(--border-c)" }}>
                {form.partner_type === val && <div className="w-2 h-2 rounded-full" style={{ background: "var(--blue)" }} />}
              </div>
              <span className="text-sm font-medium" style={{ color: form.partner_type === val ? "var(--navy)" : "var(--text-muted)" }}>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Реквизиты */}
      <div>
        <h3 className="text-sm font-bold mb-4 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Реквизиты</h3>
        <div className="grid sm:grid-cols-2 gap-4">

          {/* ИНН с DaData */}
          <Field label="ИНН" required missing={isMissing("inn")}>
            <div className="relative">
              <input className={INPUT} style={isMissing("inn") ? inputStyleMissing : inputStyle}
                placeholder="Введите ИНН — данные подтянутся автоматически"
                value={form.inn} onChange={set("inn")}
                onFocus={() => partySugg.length > 0 && setPartyOpen(true)}
                onBlur={() => setTimeout(() => setPartyOpen(false), 150)} />
              <DaDropdown suggestions={partyOpen ? partySugg : []} onSelect={applyParty} loading={partyLoading} />
            </div>
          </Field>

          {form.partner_type === "legal" && (
            <Field label="КПП">
              <input className={INPUT} style={inputStyle} placeholder="КПП" value={form.kpp} onChange={set("kpp")} />
            </Field>
          )}

          <Field label="ОГРН / ОГРНИП">
            <input className={INPUT} style={inputStyle} placeholder="ОГРН" value={form.ogrn} onChange={set("ogrn")} />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <Field label="Полное наименование" missing={isMissing("full_name")}>
            <input className={INPUT} style={isMissing("full_name") ? inputStyleMissing : inputStyle}
              placeholder="ООО «Ромашка»" value={form.full_name} onChange={set("full_name")} />
          </Field>
          <Field label="Краткое наименование">
            <input className={INPUT} style={inputStyle} placeholder="Ромашка" value={form.short_name} onChange={set("short_name")} />
          </Field>
        </div>

        {/* Адрес с DaData */}
        <div className="mt-4">
          <Field label="Юридический адрес" missing={isMissing("legal_address")}>
            <div className="relative">
              <input className={INPUT} style={isMissing("legal_address") ? inputStyleMissing : inputStyle}
                placeholder="г. Москва, ул. Ленина, д. 1"
                value={form.legal_address} onChange={set("legal_address")}
                onFocus={() => addrSugg.length > 0 && setAddrOpen(true)}
                onBlur={() => setTimeout(() => setAddrOpen(false), 150)} />
              <DaDropdown suggestions={addrOpen ? addrSugg : []} onSelect={applyAddr} loading={addrLoading} />
            </div>
          </Field>
        </div>

        {/* ФИО директора с DaData */}
        <div className="mt-4">
          <Field label="Руководитель / ФИО ИП" missing={isMissing("director_name")}>
            <div className="relative">
              <input className={INPUT} style={isMissing("director_name") ? inputStyleMissing : inputStyle}
                placeholder="Иванов Иван Иванович"
                value={form.director_name} onChange={set("director_name")}
                onFocus={() => dirSugg.length > 0 && setDirOpen(true)}
                onBlur={() => setTimeout(() => setDirOpen(false), 150)} />
              <DaDropdown suggestions={dirOpen ? dirSugg : []} onSelect={applyDir} loading={dirLoading} />
            </div>
          </Field>
        </div>
      </div>

      {/* Банковские реквизиты */}
      <div>
        <h3 className="text-sm font-bold mb-4 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Банковские реквизиты</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="БИК" missing={isMissing("bank_bik")}>
            <div className="relative">
              <input className={INPUT} style={isMissing("bank_bik") ? inputStyleMissing : inputStyle}
                placeholder="044525225 — банк подтянется автоматически"
                value={form.bank_bik} onChange={set("bank_bik")}
                onFocus={() => bankSugg.length > 0 && setBankOpen(true)}
                onBlur={() => setTimeout(() => setBankOpen(false), 150)} />
              <DaDropdown suggestions={bankOpen ? bankSugg : []} onSelect={applyBank} loading={bankLoading} />
            </div>
          </Field>
          <Field label="Название банка">
            <input className={INPUT} style={inputStyle} placeholder="Заполнится по БИК" value={form.bank_name} onChange={set("bank_name")} />
          </Field>
          <Field label="Расчётный счёт" missing={isMissing("bank_account")}>
            <input className={INPUT} style={isMissing("bank_account") ? inputStyleMissing : inputStyle}
              placeholder="40702810000000000000" value={form.bank_account} onChange={set("bank_account")} />
          </Field>
          <Field label="Корр. счёт">
            <input className={INPUT} style={inputStyle} placeholder="Заполнится по БИК" value={form.bank_corr} onChange={set("bank_corr")} />
          </Field>
        </div>
      </div>

      {/* Контактное лицо */}
      <div>
        <h3 className="text-sm font-bold mb-4 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Контактное лицо</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="ФИО" missing={isMissing("contact_name")}>
            <div className="relative">
              <input className={INPUT} style={isMissing("contact_name") ? inputStyleMissing : inputStyle}
                placeholder="Петров Пётр Петрович"
                value={form.contact_name} onChange={set("contact_name")}
                onFocus={() => ctcSugg.length > 0 && setCtcOpen(true)}
                onBlur={() => setTimeout(() => setCtcOpen(false), 150)} />
              <DaDropdown suggestions={ctcOpen ? ctcSugg : []} onSelect={applyCtc} loading={ctcLoading} />
            </div>
          </Field>
          <Field label="Телефон" missing={isMissing("contact_phone")}>
            <input className={INPUT} style={isMissing("contact_phone") ? inputStyleMissing : inputStyle}
              placeholder="+7 (999) 000-00-00" value={form.contact_phone} onChange={set("contact_phone")} />
          </Field>
          <Field label="Email" missing={isMissing("contact_email")}>
            <input className={INPUT} style={isMissing("contact_email") ? inputStyleMissing : inputStyle}
              placeholder="partner@mail.ru" value={form.contact_email} onChange={set("contact_email")} />
          </Field>
        </div>
      </div>

      {error && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button type="submit" disabled={saving}
          className="px-8 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
          style={{ background: "var(--blue)", color: "#fff", opacity: saving ? 0.7 : 1 }}>
          {saving ? <Icon name="LoaderCircle" size={16} className="animate-spin" /> : <Icon name="Save" size={16} />}
          Сохранить профиль
        </button>
        {saved && (
          <span className="text-sm font-medium flex items-center gap-1.5" style={{ color: "var(--success)" }}>
            <Icon name="CheckCircle" size={16} />
            Сохранено
          </span>
        )}
      </div>
    </form>
  );
}