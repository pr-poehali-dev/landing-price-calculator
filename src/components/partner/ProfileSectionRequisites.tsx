import { PARTNER_TYPE_LABELS, type PartnerType } from "./types";
import { Field, DaDropdown, INPUT, inputStyle, inputStyleMissing, type DDSuggestion } from "./ProfileShared";

interface Props {
  form: Record<string, string>;
  set: (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isMissing: (key: string) => boolean;
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
  form, set, isMissing,
  partySugg, partyOpen, partyLoading, setPartyOpen, applyParty,
  addrSugg, addrOpen, addrLoading, setAddrOpen, applyAddr,
  dirSugg, dirOpen, dirLoading, setDirOpen, applyDir,
}: Props) {
  return (
    <>
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

        <div className="mb-4">
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
            <input className={INPUT} style={isMissing("full_name") ? inputStyleMissing : inputStyle}
              placeholder="ООО «Ромашка»" value={form.full_name} onChange={set("full_name")} />
          </Field>
          <Field label="Краткое наименование">
            <input className={INPUT} style={inputStyle} placeholder="Ромашка" value={form.short_name} onChange={set("short_name")} />
          </Field>
        </div>

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
    </>
  );
}
