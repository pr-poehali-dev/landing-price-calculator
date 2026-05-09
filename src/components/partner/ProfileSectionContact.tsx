import PhoneInput from "@/components/ui/PhoneInput";
import EmailInput from "@/components/ui/EmailInput";
import { Field, DaDropdown, INPUT, inputStyle, inputStyleMissing, type DDSuggestion } from "./ProfileShared";

interface Props {
  form: Record<string, string>;
  set: (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  setForm: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isMissing: (key: string) => boolean;
  ctcSugg: DDSuggestion[];
  ctcOpen: boolean;
  ctcLoading: boolean;
  setCtcOpen: (v: boolean) => void;
  applyCtc: (s: DDSuggestion) => void;
}

export default function ProfileSectionContact({
  form, set, setForm, isMissing,
  ctcSugg, ctcOpen, ctcLoading, setCtcOpen, applyCtc,
}: Props) {
  return (
    <>
      {/* Контактное лицо */}
      <div>
        <h3 className="text-sm font-bold mb-4 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Контактное лицо</h3>
        <div className="mb-4">
          <Field label="ФИО" missing={isMissing("contact_name")}>
            <div className="relative">
              <input id="field-contact_name" className={INPUT} style={isMissing("contact_name") ? inputStyleMissing : inputStyle}
                placeholder="Петров Пётр Петрович"
                value={form.contact_name} onChange={set("contact_name")}
                onFocus={() => ctcSugg.length > 0 && setCtcOpen(true)}
                onBlur={() => setTimeout(() => setCtcOpen(false), 150)} />
              <DaDropdown suggestions={ctcOpen ? ctcSugg : []} onSelect={applyCtc} loading={ctcLoading} />
            </div>
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Телефон" missing={isMissing("contact_phone")}>
            <PhoneInput id="field-contact_phone" className={INPUT} style={isMissing("contact_phone") ? inputStyleMissing : inputStyle}
              value={form.contact_phone} onChange={v => setForm(prev => ({ ...prev, contact_phone: v }))} />
          </Field>
          <div>
            <Field label="Email" missing={isMissing("contact_email")}>
              <EmailInput id="field-contact_email" className={INPUT} style={isMissing("contact_email") ? inputStyleMissing : inputStyle}
                value={form.contact_email} onChange={v => setForm(prev => ({ ...prev, contact_email: v }))} />
            </Field>
          </div>
        </div>
      </div>

      {/* Реферальная программа */}
      <div>
        <h3 className="text-sm font-bold mb-1 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Реферальная программа</h3>
        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
          Если партнёр зарегистрируется по вашей реферальной ссылке, вы можете удерживать часть его вознаграждения в свою пользу. Например, при 5% — партнёр получит на 5% меньше стандартной ставки, а вы получите эти 5% с каждой его сделки.
        </p>
        <div style={{ maxWidth: 280 }}>
          <Field label="Ваш реферальный процент (0–30%)">
            <div className="flex items-center gap-3">
              <input
                type="number" min="0" max="30" step="0.5"
                className={INPUT} style={inputStyle}
                value={form.referral_fee_percent}
                onChange={e => setForm(prev => ({ ...prev, referral_fee_percent: e.target.value }))}
              />
              <span className="text-sm font-semibold flex-shrink-0" style={{ color: "var(--text-muted)" }}>%</span>
            </div>
          </Field>
        </div>
      </div>
    </>
  );
}