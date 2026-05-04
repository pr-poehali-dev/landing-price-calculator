import { useState, useEffect, useRef } from "react";
import { DADATA_TOKEN } from "@/components/modal/types";

const DOMAINS = ["gmail.com", "mail.ru", "yandex.ru", "ya.ru", "outlook.com", "icloud.com", "bk.ru", "list.ru", "inbox.ru", "rambler.ru"];

function getSuggestions(value: string): string[] {
  const at = value.indexOf("@");
  if (at === -1 || at === value.length - 1) {
    const user = at === -1 ? value : value.slice(0, at);
    if (!user) return [];
    return DOMAINS.map(d => `${user}@${d}`);
  }
  const user = value.slice(0, at);
  const domain = value.slice(at + 1).toLowerCase();
  if (!domain) return DOMAINS.map(d => `${user}@${d}`);
  const matched = DOMAINS.filter(d => d.startsWith(domain) && d !== domain);
  return matched.map(d => `${user}@${d}`);
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function EmailInput({ value, onChange, placeholder = "example@mail.ru", disabled, className, style }: Props) {
  const [open, setOpen] = useState(false);
  const [ddSugg, setDdSugg] = useState<string[]>([]);
  const [localSugg, setLocalSugg] = useState<string[]>([]);
  const ddTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Локальные подсказки по доменам
  useEffect(() => {
    setLocalSugg(getSuggestions(value));
  }, [value]);

  // DaData email suggestions
  useEffect(() => {
    if (ddTimer.current) clearTimeout(ddTimer.current);
    if (!value || value.length < 2 || !DADATA_TOKEN) { setDdSugg([]); return; }
    ddTimer.current = setTimeout(() => {
      fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/email", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Token ${DADATA_TOKEN}` },
        body: JSON.stringify({ query: value, count: 5 }),
      })
        .then(r => r.json())
        .then(d => setDdSugg((d.suggestions || []).map((s: { value: string }) => s.value)))
        .catch(() => setDdSugg([]));
    }, 300);
  }, [value]);

  // Объединяем: DaData приоритетнее, дополняем локальными
  const allSugg = [...new Set([...ddSugg, ...localSugg])].slice(0, 6);

  return (
    <div className="relative">
      <input
        type="email"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        style={style}
        autoComplete="off"
      />
      {open && allSugg.length > 0 && (
        <ul className="absolute left-0 right-0 z-50 rounded-xl overflow-hidden text-sm mt-1"
          style={{ background: "#fff", border: "1px solid var(--border-c)", boxShadow: "0 8px 24px rgba(0,0,0,0.10)", top: "100%" }}>
          {allSugg.map((s, i) => (
            <li key={s} onMouseDown={() => { onChange(s); setOpen(false); }}
              className="px-4 py-2.5 cursor-pointer"
              style={{ borderBottom: i < allSugg.length - 1 ? "1px solid var(--border-c)" : "none", color: "var(--navy)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#fff")}>
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
