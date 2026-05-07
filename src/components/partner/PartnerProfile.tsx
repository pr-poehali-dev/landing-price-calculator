import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { apiPartner, type Partner } from "./types";
import {
  SUGGEST_PARTY, FIND_PARTY, SUGGEST_BANK, SUGGEST_ADDR, SUGGEST_FIO,
  REQUIRED_FIELDS, ddFetch, type DDSuggestion,
} from "./ProfileShared";
import ProfileSectionRequisites from "./ProfileSectionRequisites";
import ProfileSectionBank from "./ProfileSectionBank";
import ProfileSectionContact from "./ProfileSectionContact";

interface Props { sessionId: string; onSaved?: (p: Partner) => void; isAdmin?: boolean }

export default function PartnerProfile({ sessionId, onSaved, isAdmin = false }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [form, setForm] = useState<Record<string, string>>({
    partner_type: "legal", inn: "", kpp: "", ogrn: "", full_name: "", short_name: "",
    legal_address: "", director_name: "", bank_name: "", bank_bik: "", bank_account: "",
    bank_corr: "", contact_name: "", contact_phone: "", contact_email: "",
    referral_fee_percent: "0",
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
          referral_fee_percent: String(p.referral_fee_percent ?? 0),
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

      <ProfileSectionRequisites
        form={form} set={set} isMissing={isMissing}
        partySugg={partySugg} partyOpen={partyOpen} partyLoading={partyLoading}
        setPartyOpen={setPartyOpen} applyParty={applyParty}
        addrSugg={addrSugg} addrOpen={addrOpen} addrLoading={addrLoading}
        setAddrOpen={setAddrOpen} applyAddr={applyAddr}
        dirSugg={dirSugg} dirOpen={dirOpen} dirLoading={dirLoading}
        setDirOpen={setDirOpen} applyDir={applyDir}
      />

      <ProfileSectionBank
        form={form} set={set} isMissing={isMissing}
        bankSugg={bankSugg} bankOpen={bankOpen} bankLoading={bankLoading}
        setBankOpen={setBankOpen} applyBank={applyBank}
      />

      <ProfileSectionContact
        form={form} set={set} setForm={setForm} isMissing={isMissing}
        ctcSugg={ctcSugg} ctcOpen={ctcOpen} ctcLoading={ctcLoading}
        setCtcOpen={setCtcOpen} applyCtc={applyCtc}
      />

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