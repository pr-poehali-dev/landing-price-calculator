import { Field, DaDropdown, INPUT, inputStyle, inputStyleMissing, type DDSuggestion } from "./ProfileShared";

interface Props {
  form: Record<string, string>;
  set: (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isMissing: (key: string) => boolean;
  bankSugg: DDSuggestion[];
  bankOpen: boolean;
  bankLoading: boolean;
  setBankOpen: (v: boolean) => void;
  applyBank: (s: DDSuggestion) => void;
}

export default function ProfileSectionBank({
  form, set, isMissing,
  bankSugg, bankOpen, bankLoading, setBankOpen, applyBank,
}: Props) {
  return (
    <div>
      <h3 className="text-sm font-bold mb-4 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Банковские реквизиты</h3>

      <div className="mb-4">
        <Field label="БИК" missing={isMissing("bank_bik")}>
          <div className="relative">
            <input id="field-bank_bik" className={INPUT} style={isMissing("bank_bik") ? inputStyleMissing : inputStyle}
              placeholder="044525225 — банк и корр. счёт подтянутся автоматически"
              value={form.bank_bik} onChange={set("bank_bik")}
              onFocus={() => bankSugg.length > 0 && setBankOpen(true)}
              onBlur={() => setTimeout(() => setBankOpen(false), 150)} />
            <DaDropdown suggestions={bankOpen ? bankSugg : []} onSelect={applyBank} loading={bankLoading} />
          </div>
        </Field>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Название банка">
          <input className={INPUT} style={inputStyle} placeholder="Заполнится по БИК" value={form.bank_name} onChange={set("bank_name")} />
        </Field>
        <Field label="Расчётный счёт" missing={isMissing("bank_account")}>
          <input id="field-bank_account" className={INPUT} style={isMissing("bank_account") ? inputStyleMissing : inputStyle}
            placeholder="40702810000000000000" value={form.bank_account} onChange={set("bank_account")} />
        </Field>
        <Field label="Корр. счёт">
          <input className={INPUT} style={inputStyle} placeholder="Заполнится по БИК" value={form.bank_corr} onChange={set("bank_corr")} />
        </Field>
      </div>
    </div>
  );
}