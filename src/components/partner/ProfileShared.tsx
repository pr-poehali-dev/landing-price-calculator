import Icon from "@/components/ui/icon";
import { DADATA_TOKEN } from "./types";

export const SUGGEST_PARTY = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party";
export const FIND_PARTY    = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party";
export const SUGGEST_BANK  = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/bank";
export const SUGGEST_ADDR  = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";
export const SUGGEST_FIO   = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fio";

export const INPUT = "w-full px-4 py-3 rounded-lg text-sm outline-none transition-all font-body";
export const inputStyle = { background: "var(--bg)", border: "1px solid var(--border-c)", color: "var(--text)" };
export const inputStyleMissing = { background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.35)", color: "var(--text)" };

export const REQUIRED_FIELDS: { key: string; label: string }[] = [
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

export interface DDSuggestion { value: string; data: Record<string, unknown> }

export async function ddFetch(url: string, body: object): Promise<DDSuggestion[]> {
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

export function Field({ label, children, required, missing }: { label: string; children: React.ReactNode; required?: boolean; missing?: boolean }) {
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

export function DaDropdown({ suggestions, onSelect, loading }: {
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
