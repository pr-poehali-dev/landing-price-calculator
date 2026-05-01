import { DadataSuggestion } from "./types";

interface SuggestDropdownProps {
  suggestions: DadataSuggestion[];
  onSelect: (v: string) => void;
}

export default function SuggestDropdown({ suggestions, onSelect }: SuggestDropdownProps) {
  if (!suggestions.length) return null;
  return (
    <ul
      className="absolute left-0 right-0 z-50 rounded-lg overflow-hidden text-sm"
      style={{
        background: "#fff",
        border: "1px solid var(--border-c)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
        top: "calc(100% + 4px)",
      }}
    >
      {suggestions.map((s, i) => (
        <li
          key={i}
          className="px-4 py-2.5 cursor-pointer transition-colors"
          style={{ color: "var(--text)", borderBottom: i < suggestions.length - 1 ? "1px solid var(--border-c)" : "none" }}
          onMouseDown={(e) => { e.preventDefault(); onSelect(s.value); }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#fff")}
        >
          {s.value}
        </li>
      ))}
    </ul>
  );
}
