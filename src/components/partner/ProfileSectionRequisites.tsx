import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { PARTNER_TYPE_LABELS, type PartnerType } from "./types";
import { Field, DaDropdown, INPUT, inputStyle, inputStyleMissing, type DDSuggestion, SUGGEST_FIO, SUGGEST_ADDR, SUGGEST_FMS, ddFetch } from "./ProfileShared";

interface Props {
  form: Record<string, string>;
  set: (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  setForm: (fn: (prev: Record<string, string>) => Record<string, string>) => void;
  isMissing: (key: string) => boolean;
  isLawyer?: boolean;
  partySugg: DDSuggestion[];
  partyOpen: boolean;
  partyLoading: boolean;
  setPartyOpen: (v: boolean) => void;
  applyParty: (s: DDSuggestion) => void;
  addrSugg: DDSuggestion[];
  addrOpen: boolean;
  addrLoading: boolean;
  setAddrOpen: (v: boolean) => void;
  applyAddr: (s: DDSuggestion) => void;
  dirSugg: DDSuggestion[];
  dirOpen: boolean;
  dirLoading: boolean;
  setDirOpen: (v: boolean) => void;
  applyDir: (s: DDSuggestion) => void;
}

export default function ProfileSectionRequisites({
  form, set, setForm, isMissing, isLawyer = false,
  partySugg, partyOpen, partyLoading, setPartyOpen, applyParty,
  addrSugg, addrOpen, addrLoading, setAddrOpen, applyAddr,
  dirSugg, dirOpen, dirLoading, setDirOpen, applyDir,
}: Props) {
  const [ndflWarningShown, setNdflWarningShown] = useState(false);
  const [pendingIndividual, setPendingIndividual] = useState(false);

  // DaData: ФИО физлица
  const [fioSugg, setFioSugg] = useState<DDSuggestion[]>([]);
  const [fioOpen, setFioOpen] = useState(false);
  const [fioLoading, setFioLoading] = useState(false);
  const fioTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // DaData: адрес регистрации физлица
  const [regAddrSugg, setRegAddrSugg] = useState<DDSuggestion[]>([]);
  const [regAddrOpen, setRegAddrOpen] = useState(false);
  const [regAddrLoading, setRegAddrLoading] = useState(false);
  const regAddrTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // DaData: подразделение МВД (кем выдан паспорт — по названию)
  const [fmsSugg, setFmsSugg] = useState<DDSuggestion[]>([]);
  const [fmsOpen, setFmsOpen] = useState(false);
  const [fmsLoading, setFmsLoading] = useState(false);
  const fmsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // DaData: подразделение МВД (по коду подразделения)
  const [fmsCodeSugg, setFmsCodeSugg] = useState<DDSuggestion[]>([]);
  const [fmsCodeOpen, setFmsCodeOpen] = useState(false);
  const [fmsCodeLoading, setFmsCodeLoading] = useState(false);
  const fmsCodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isIndividual = form.partner_type === "individual";
  const isSelfEmployed = form.partner_type === "self_employed";

  useEffect(() => {
    if (!isIndividual && !isSelfEmployed) return;
    if (fioTimer.current) clearTimeout(fioTimer.current);
    const v = (form.individual_full_name || "").trim();
    if (!v || v.length < 2) { setFioSugg([]); return; }
    setFioLoading(true);
    fioTimer.current = setTimeout(async () => {
      const s = await ddFetch(SUGGEST_FIO, { query: v, count: 5 });
      setFioSugg(s); setFioOpen(true); setFioLoading(false);
    }, 300);
  }, [form.individual_full_name, isIndividual, isSelfEmployed]);

  useEffect(() => {
    if (!isIndividual && !isSelfEmployed) return;
    if (regAddrTimer.current) clearTimeout(regAddrTimer.current);
    const v = (form.individual_registration_address || "").trim();
    if (!v || v.length < 3) { setRegAddrSugg([]); return; }
    setRegAddrLoading(true);
    regAddrTimer.current = setTimeout(async () => {
      const s = await ddFetch(SUGGEST_ADDR, { query: v, count: 5 });
      setRegAddrSugg(s); setRegAddrOpen(true); setRegAddrLoading(false);
    }, 350);
  }, [form.individual_registration_address, isIndividual, isSelfEmployed]);

  const applyFio = (s: DDSuggestion) => {
    setForm(prev => ({ ...prev, individual_full_name: s.value }));
    setFioOpen(false); setFioSugg([]);
  };

  const applyRegAddr = (s: DDSuggestion) => {
    setForm(prev => ({ ...prev, individual_registration_address: s.value }));
    setRegAddrOpen(false); setRegAddrSugg([]);
  };

  useEffect(() => {
    if (!isIndividual && !isSelfEmployed) return;
    if (fmsTimer.current) clearTimeout(fmsTimer.current);
    const v = (form.individual_passport_issued_by || "").trim();
    if (!v || v.length < 3) { setFmsSugg([]); return; }
    setFmsLoading(true);
    fmsTimer.current = setTimeout(async () => {
      const s = await ddFetch(SUGGEST_FMS, { query: v, count: 5 });
      setFmsSugg(s); setFmsOpen(true); setFmsLoading(false);
    }, 350);
  }, [form.individual_passport_issued_by, isIndividual, isSelfEmployed]);

  const applyFms = (s: DDSuggestion) => {
    const code = String(s.data.code || "");
    const series = code.replace("-", "").slice(0, 4);
    setForm(prev => ({
      ...prev,
      individual_passport_issued_by: s.value,
      individual_passport_code: code,
      individual_passport_series: prev.individual_passport_series || series,
    }));
    setFmsOpen(false); setFmsSugg([]);
  };

  useEffect(() => {
    if (!isIndividual && !isSelfEmployed) return;
    if (fmsCodeTimer.current) clearTimeout(fmsCodeTimer.current);
    const v = (form.individual_passport_code || "").trim();
    if (!v || v.length < 3) { setFmsCodeSugg([]); return; }
    setFmsCodeLoading(true);
    fmsCodeTimer.current = setTimeout(async () => {
      const s = await ddFetch(SUGGEST_FMS, { query: v, count: 5 });
      setFmsCodeSugg(s); setFmsCodeOpen(true); setFmsCodeLoading(false);
    }, 300);
  }, [form.individual_passport_code, isIndividual, isSelfEmployed]);

  const applyFmsCode = (s: DDSuggestion) => {
    const code = String(s.data.code || "");
    const series = code.replace("-", "").slice(0, 4);
    setForm(prev => ({
      ...prev,
      individual_passport_code: code,
      individual_passport_issued_by: s.value,
      individual_passport_series: prev.individual_passport_series || series,
    }));
    setFmsCodeOpen(false); setFmsCodeSugg([]);
  };

  const handleTypeChange = (val: PartnerType) => {
    if (val === "individual" && !ndflWarningShown) {
      setPendingIndividual(true);
      return;
    }
    setForm(prev => ({ ...prev, partner_type: val }));
  };

  const confirmIndividual = () => {
    setNdflWarningShown(true);
    setPendingIndividual(false);
    setForm(prev => ({ ...prev, partner_type: "individual" }));
  };

  const types = Object.entries(PARTNER_TYPE_LABELS).filter(
    ([val]) => !isLawyer || val !== "individual"
  ) as [PartnerType, string][];

  return (
    <>
      {/* Модальное предупреждение НДФЛ */}
      {pendingIndividual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="rounded-2xl p-6 max-w-md w-full shadow-2xl" style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)" }}>
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(234,179,8,0.12)" }}>
                <Icon name="AlertTriangle" size={20} style={{ color: "#ca8a04" }} />
              </div>
              <div>
                <h3 className="font-bold text-base mb-1" style={{ color: "var(--navy)" }}>Важно: удержание НДФЛ</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  При выплате вознаграждения физическому лицу по агентскому договору наша компания является{" "}
                  <strong style={{ color: "var(--text)" }}>налоговым агентом</strong> согласно ст. 226 Налогового кодекса РФ.
                </p>
              </div>
            </div>
            <div className="rounded-xl p-4 mb-5 text-sm leading-relaxed" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.25)", color: "var(--text)" }}>
              Это означает, что с суммы вашего вознаграждения будет автоматически удержан{" "}
              <strong>НДФЛ 13%</strong> (или 15% при доходе свыше 5 млн ₽ в год) до выплаты.
              Мы самостоятельно перечислим налог в бюджет и предоставим справку 2-НДФЛ по итогам года.
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={confirmIndividual}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: "var(--navy)", color: "#fff" }}
              >
                Понятно, продолжить
              </button>
              <button
                type="button"
                onClick={() => setPendingIndividual(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: "var(--bg)", border: "1px solid var(--border-c)", color: "var(--text-muted)" }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Тип партнёра */}
      <div>
        <h3 className="text-sm font-bold mb-4 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Тип партнёра</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {types.map(([val, label]) => (
            <label key={val}
              className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-all"
              onClick={() => handleTypeChange(val)}
              style={{
                border: `2px solid ${form.partner_type === val ? "var(--blue)" : "var(--border-c)"}`,
                background: form.partner_type === val ? "var(--blue-dim)" : "var(--bg)",
              }}>
              <input type="radio" name="partner_type" value={val} checked={form.partner_type === val}
                onChange={() => {}} className="hidden" />
              <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                style={{ borderColor: form.partner_type === val ? "var(--blue)" : "var(--border-c)" }}>
                {form.partner_type === val && <div className="w-2 h-2 rounded-full" style={{ background: "var(--blue)" }} />}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: form.partner_type === val ? "var(--navy)" : "var(--text-muted)" }}>{label}</span>
                {val === "individual" && (
                  <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: "rgba(234,179,8,0.15)", color: "#ca8a04" }}>НДФЛ</span>
                )}
              </div>
            </label>
          ))}
        </div>

        {/* Напоминание об НДФЛ если уже выбрано */}
        {isIndividual && (
          <div className="mt-3 flex items-start gap-2 rounded-xl px-4 py-3 text-xs" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}>
            <Icon name="Info" size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#ca8a04" }} />
            <span style={{ color: "#92400e" }}>
              Мы являемся налоговым агентом и удерживаем НДФЛ 13% с суммы вознаграждения согласно ст. 226 НК РФ.
            </span>
          </div>
        )}
        {isSelfEmployed && (
          <div className="mt-3 flex items-start gap-2 rounded-xl px-4 py-3 text-xs" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <Icon name="Info" size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#16a34a" }} />
            <span style={{ color: "#15803d" }}>
              Самозанятый платит налог самостоятельно. НДФЛ с вознаграждения не удерживается.
            </span>
          </div>
        )}
      </div>

      {/* Реквизиты физлица / самозанятого */}
      {(isIndividual || isSelfEmployed) ? (
        <div className="space-y-6">
          {/* Личные данные */}
          <div className="rounded-xl p-5 space-y-4" style={{ border: "1px solid var(--border-c)", background: "var(--bg)" }}>
            <h3 className="text-sm font-bold uppercase tracking-wide flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
              <Icon name="User" size={14} />
              Личные данные
            </h3>

            <Field label="ФИО полностью" required missing={isMissing("individual_full_name")}>
              <div className="relative">
                <input id="field-individual_full_name" className={INPUT} style={isMissing("individual_full_name") ? inputStyleMissing : inputStyle}
                  placeholder="Иванов Иван Иванович"
                  value={form.individual_full_name || ""} onChange={set("individual_full_name")}
                  onFocus={() => fioSugg.length > 0 && setFioOpen(true)}
                  onBlur={() => setTimeout(() => setFioOpen(false), 150)} />
                <DaDropdown suggestions={fioOpen ? fioSugg : []} onSelect={applyFio} loading={fioLoading} />
              </div>
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Дата рождения" required missing={isMissing("individual_birth_date")}>
                <input id="field-individual_birth_date" className={INPUT} style={isMissing("individual_birth_date") ? inputStyleMissing : inputStyle} type="date"
                  value={form.individual_birth_date || ""} onChange={set("individual_birth_date")} />
              </Field>
              <Field label="ИНН физлица" required missing={isMissing("inn")}>
                <div className="relative">
                  <input id="field-inn" className={INPUT} style={isMissing("inn") ? inputStyleMissing : inputStyle}
                    placeholder="12 цифр"
                    value={form.inn} onChange={set("inn")}
                    onFocus={() => partySugg.length > 0 && setPartyOpen(true)}
                    onBlur={() => setTimeout(() => setPartyOpen(false), 150)} />
                  <DaDropdown suggestions={partyOpen ? partySugg : []} onSelect={applyParty} loading={partyLoading} />
                </div>
              </Field>
            </div>

            <Field label="Адрес регистрации" required missing={isMissing("individual_registration_address")}>
              <div className="relative">
                <input id="field-individual_registration_address" className={INPUT} style={isMissing("individual_registration_address") ? inputStyleMissing : inputStyle}
                  placeholder="г. Москва, ул. Ленина, д. 1, кв. 1"
                  value={form.individual_registration_address || ""} onChange={set("individual_registration_address")}
                  onFocus={() => regAddrSugg.length > 0 && setRegAddrOpen(true)}
                  onBlur={() => setTimeout(() => setRegAddrOpen(false), 150)} />
                <DaDropdown suggestions={regAddrOpen ? regAddrSugg : []} onSelect={applyRegAddr} loading={regAddrLoading} />
              </div>
            </Field>
          </div>

          {/* Паспортные данные */}
          <div className="rounded-xl p-5 space-y-4" style={{ border: "1px solid var(--border-c)", background: "var(--bg)" }}>
            <h3 className="text-sm font-bold uppercase tracking-wide flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
              <Icon name="BookOpen" size={14} />
              Паспортные данные
            </h3>

            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Серия паспорта" required missing={isMissing("individual_passport_series")}>
                <input id="field-individual_passport_series" className={INPUT} style={isMissing("individual_passport_series") ? inputStyleMissing : inputStyle} placeholder="1234"
                  value={form.individual_passport_series || ""} onChange={set("individual_passport_series")} />
              </Field>
              <Field label="Номер паспорта" required missing={isMissing("individual_passport_number")}>
                <input id="field-individual_passport_number" className={INPUT} style={isMissing("individual_passport_number") ? inputStyleMissing : inputStyle} placeholder="567890"
                  value={form.individual_passport_number || ""} onChange={set("individual_passport_number")} />
              </Field>
              <Field label="Код подразделения" required missing={isMissing("individual_passport_code")}>
                <div className="relative">
                  <input id="field-individual_passport_code" className={INPUT} style={isMissing("individual_passport_code") ? inputStyleMissing : inputStyle} placeholder="770-001"
                    value={form.individual_passport_code || ""} onChange={set("individual_passport_code")}
                    onFocus={() => fmsCodeSugg.length > 0 && setFmsCodeOpen(true)}
                    onBlur={() => setTimeout(() => setFmsCodeOpen(false), 150)} />
                  <DaDropdown suggestions={fmsCodeOpen ? fmsCodeSugg : []} onSelect={applyFmsCode} loading={fmsCodeLoading} />
                </div>
              </Field>
            </div>

            <Field label="Кем выдан" required missing={isMissing("individual_passport_issued_by")}>
              <div className="relative">
                <input id="field-individual_passport_issued_by" className={INPUT} style={isMissing("individual_passport_issued_by") ? inputStyleMissing : inputStyle} placeholder="УМВД России по г. Москве"
                  value={form.individual_passport_issued_by || ""} onChange={set("individual_passport_issued_by")}
                  onFocus={() => fmsSugg.length > 0 && setFmsOpen(true)}
                  onBlur={() => setTimeout(() => setFmsOpen(false), 150)} />
                <DaDropdown suggestions={fmsOpen ? fmsSugg : []} onSelect={applyFms} loading={fmsLoading} />
              </div>
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Дата выдачи" required missing={isMissing("individual_passport_issued_date")}>
                <input id="field-individual_passport_issued_date" className={INPUT} style={isMissing("individual_passport_issued_date") ? inputStyleMissing : inputStyle} type="date"
                  value={form.individual_passport_issued_date || ""} onChange={set("individual_passport_issued_date")} />
              </Field>
              <Field label="СНИЛС">
                <input className={INPUT} style={inputStyle} placeholder="000-000-000 00"
                  value={form.individual_snils || ""} onChange={set("individual_snils")} />
              </Field>
            </div>
          </div>
        </div>
      ) : (
        /* Реквизиты юрлица/ИП/самозанятого */
        <div>
          <h3 className="text-sm font-bold mb-4 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Реквизиты</h3>

          <div className="mb-4">
            <Field label="ИНН" required missing={isMissing("inn")}>
              <div className="relative">
                <input id="field-inn" className={INPUT} style={isMissing("inn") ? inputStyleMissing : inputStyle}
                  placeholder="Введите ИНН — данные подтянутся автоматически"
                  value={form.inn} onChange={set("inn")}
                  onFocus={() => partySugg.length > 0 && setPartyOpen(true)}
                  onBlur={() => setTimeout(() => setPartyOpen(false), 150)} />
                <DaDropdown suggestions={partyOpen ? partySugg : []} onSelect={applyParty} loading={partyLoading} />
              </div>
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
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
              <input id="field-full_name" className={INPUT} style={isMissing("full_name") ? inputStyleMissing : inputStyle}
                placeholder="ООО «Ромашка»" value={form.full_name} onChange={set("full_name")} />
            </Field>
            <Field label="Краткое наименование">
              <input className={INPUT} style={inputStyle} placeholder="Ромашка" value={form.short_name} onChange={set("short_name")} />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Юридический адрес" missing={isMissing("legal_address")}>
              <div className="relative">
                <input id="field-legal_address" className={INPUT} style={isMissing("legal_address") ? inputStyleMissing : inputStyle}
                  placeholder="г. Москва, ул. Ленина, д. 1"
                  value={form.legal_address} onChange={set("legal_address")}
                  onFocus={() => addrSugg.length > 0 && setAddrOpen(true)}
                  onBlur={() => setTimeout(() => setAddrOpen(false), 150)} />
                <DaDropdown suggestions={addrOpen ? addrSugg : []} onSelect={applyAddr} loading={addrLoading} />
              </div>
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Руководитель / ФИО ИП" missing={isMissing("director_name")}>
              <div className="relative">
                <input id="field-director_name" className={INPUT} style={isMissing("director_name") ? inputStyleMissing : inputStyle}
                  placeholder="Иванов Иван Иванович"
                  value={form.director_name} onChange={set("director_name")}
                  onFocus={() => dirSugg.length > 0 && setDirOpen(true)}
                  onBlur={() => setTimeout(() => setDirOpen(false), 150)} />
                <DaDropdown suggestions={dirOpen ? dirSugg : []} onSelect={applyDir} loading={dirLoading} />
              </div>
            </Field>
          </div>
        </div>
      )}
    </>
  );
}