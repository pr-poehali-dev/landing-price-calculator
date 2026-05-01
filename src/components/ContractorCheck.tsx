import { useState } from "react";
import Icon from "@/components/ui/icon";

const DADATA_TOKEN = import.meta.env.VITE_DADATA_API_KEY || "";

type SearchType = "inn" | "fio" | "address" | "okved";

interface SearchOption {
  type: SearchType;
  label: string;
  placeholder: string;
  icon: string;
  hint: string;
}

const SEARCH_OPTIONS: SearchOption[] = [
  { type: "inn", label: "По ИНН", placeholder: "Введите ИНН (10 или 12 цифр)", icon: "Hash", hint: "ИНН организации или ИП" },
  { type: "fio", label: "По директору / учредителю", placeholder: "Например: Иванов Иван", icon: "User", hint: "ФИО руководителя или учредителя" },
  { type: "address", label: "По адресу", placeholder: "Например: Москва, Ленина 1", icon: "MapPin", hint: "Юридический адрес организации" },
  { type: "okved", label: "По виду деятельности", placeholder: "Например: разработка программного обеспечения", icon: "Briefcase", hint: "Вид деятельности по ОКВЭД" },
];

interface Party {
  value: string;
  data: {
    inn?: string;
    kpp?: string;
    ogrn?: string;
    ogrn_date?: number;
    type?: string;
    state?: { status?: string; registration_date?: number; liquidation_date?: number };
    address?: { value?: string };
    management?: { name?: string; post?: string };
    founders?: { name?: string; share?: { value?: number } }[];
    okved?: string;
    okved_type?: string;
    employee_count?: number;
    finance?: { tax_system?: string; year?: number; revenue?: number; expense?: number };
    authorities?: { fts_registration?: { name?: string }; pfr?: { name?: string } };
  };
}

function statusLabel(status?: string): { text: string; color: string } {
  switch (status) {
    case "ACTIVE": return { text: "Действующая", color: "var(--success)" };
    case "LIQUIDATING": return { text: "В процессе ликвидации", color: "#f59e0b" };
    case "LIQUIDATED": return { text: "Ликвидирована", color: "#ef4444" };
    case "BANKRUPT": return { text: "Банкротство", color: "#ef4444" };
    case "REORGANIZING": return { text: "Реорганизация", color: "#f59e0b" };
    default: return { text: status || "Неизвестно", color: "var(--text-muted)" };
  }
}

function formatDate(ts?: number): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("ru-RU");
}

function formatMoney(v?: number): string {
  if (!v) return "—";
  if (Math.abs(v) >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)} млрд ₽`;
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} млн ₽`;
  return `${v.toLocaleString("ru-RU")} ₽`;
}

function PartyCard({ party, onClose }: { party: Party; onClose: () => void }) {
  const d = party.data;
  const status = statusLabel(d.state?.status);
  const isIP = d.type === "INDIVIDUAL";

  return (
    <div className="mt-4 rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border-c)", background: "#fff" }}>
      {/* Header */}
      <div className="px-6 py-5 flex items-start justify-between gap-4" style={{ background: "var(--navy)" }}>
        <div>
          <p className="text-xs font-semibold mb-1 opacity-60" style={{ color: "#fff" }}>{isIP ? "Индивидуальный предприниматель" : "Организация"}</p>
          <h3 className="text-lg font-bold leading-snug" style={{ color: "#fff", fontFamily: "Playfair Display, serif" }}>{party.value}</h3>
          {d.okved && (
            <p className="text-xs mt-1 opacity-60" style={{ color: "#fff" }}>{d.okved} · {d.okved_type}</p>
          )}
        </div>
        <button onClick={onClose} className="flex-shrink-0 mt-1 opacity-60 hover:opacity-100 transition-opacity" style={{ color: "#fff" }}>
          <Icon name="X" size={18} />
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Status + Reg date */}
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: d.state?.status === "ACTIVE" ? "var(--success-dim)" : "rgba(239,68,68,0.08)", color: status.color, border: `1px solid ${status.color}30` }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: status.color }} />
            {status.text}
          </span>
          {d.state?.registration_date && (
            <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: "var(--bg)", color: "var(--text-muted)", border: "1px solid var(--border-c)" }}>
              Зарегистрирована: {formatDate(d.state.registration_date)}
            </span>
          )}
          {d.state?.liquidation_date && (
            <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
              Ликвидирована: {formatDate(d.state.liquidation_date)}
            </span>
          )}
        </div>

        {/* Main details grid */}
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
          {[
            { label: "ИНН", value: d.inn },
            { label: "КПП", value: d.kpp },
            { label: "ОГРН", value: d.ogrn },
            { label: "ОГРН зарегистрирован", value: formatDate(d.ogrn_date) },
            { label: "Юридический адрес", value: d.address?.value },
            { label: "Сотрудников", value: d.employee_count ? `${d.employee_count} чел.` : undefined },
          ].map(({ label, value }) => value ? (
            <div key={label}>
              <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
              <p className="text-sm font-medium" style={{ color: "var(--navy)" }}>{value}</p>
            </div>
          ) : null)}
        </div>

        {/* Management */}
        {d.management?.name && (
          <div className="rounded-xl px-4 py-3" style={{ background: "var(--bg)", border: "1px solid var(--border-c)" }}>
            <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Руководитель</p>
            <p className="text-sm font-semibold" style={{ color: "var(--navy)" }}>{d.management.name}</p>
            {d.management.post && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{d.management.post}</p>}
          </div>
        )}

        {/* Finance */}
        {d.finance && (d.finance.revenue || d.finance.expense) && (
          <div>
            <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Финансы {d.finance.year ? `(${d.finance.year})` : ""}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {d.finance.revenue && (
                <div className="rounded-xl px-4 py-3" style={{ background: "var(--success-dim)", border: "1px solid rgba(21,128,61,0.15)" }}>
                  <p className="text-xs mb-0.5" style={{ color: "var(--success)" }}>Выручка</p>
                  <p className="text-sm font-bold" style={{ color: "var(--success)" }}>{formatMoney(d.finance.revenue)}</p>
                </div>
              )}
              {d.finance.expense && (
                <div className="rounded-xl px-4 py-3" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                  <p className="text-xs mb-0.5" style={{ color: "#dc2626" }}>Расходы</p>
                  <p className="text-sm font-bold" style={{ color: "#dc2626" }}>{formatMoney(d.finance.expense)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tax / FTS */}
        {d.authorities?.fts_registration?.name && (
          <div>
            <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Налоговый орган</p>
            <p className="text-sm" style={{ color: "var(--text)" }}>{d.authorities.fts_registration.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContractorCheck() {
  const [searchType, setSearchType] = useState<SearchType>("inn");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Party[]>([]);
  const [selected, setSelected] = useState<Party | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const currentOption = SEARCH_OPTIONS.find((o) => o.type === searchType)!;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (!DADATA_TOKEN) {
      alert("DaData API ключ не настроен");
      return;
    }

    setLoading(true);
    setResults([]);
    setSelected(null);
    setSearched(false);

    try {
      let url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party";
      const body: Record<string, unknown> = { query: query.trim(), count: 10 };

      if (searchType === "inn") {
        url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party";
        body.query = query.trim();
        body.count = 5;
      } else if (searchType === "fio") {
        body.filters = [{ "management.name": query.trim() }];
      } else if (searchType === "address") {
        body.filters = [{ "address": query.trim() }];
      } else if (searchType === "okved") {
        body.filters = [{ "okved": query.trim() }];
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Token ${DADATA_TOKEN}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResults(data.suggestions || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)" }}>
      {/* Header */}
      <div className="px-6 py-5" style={{ borderBottom: "1px solid var(--border-c)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--blue-dim)" }}>
            <Icon name="SearchCheck" size={18} style={{ color: "var(--blue)" }} />
          </div>
          <div>
            <h2 className="font-bold text-base" style={{ color: "var(--navy)" }}>Проверь контрагента</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Данные из реестра ФНС через сервис DaData</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Search type tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          {SEARCH_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              type="button"
              onClick={() => { setSearchType(opt.type); setQuery(""); setResults([]); setSelected(null); setSearched(false); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: searchType === opt.type ? "var(--blue)" : "var(--bg)",
                color: searchType === opt.type ? "#fff" : "var(--text-muted)",
                border: `1px solid ${searchType === opt.type ? "var(--blue)" : "var(--border-c)"}`,
              }}
            >
              <Icon name={opt.icon as "Hash"} size={13} />
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Icon
              name={currentOption.icon as "Hash"}
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none transition-colors font-body"
              style={{ background: "var(--bg)", border: "1px solid var(--border-c)", color: "var(--text)" }}
              placeholder={currentOption.placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-5 py-3 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 flex-shrink-0"
            style={{ background: "var(--blue)", color: "#fff", opacity: loading || !query.trim() ? 0.6 : 1 }}
          >
            {loading ? <Icon name="LoaderCircle" size={16} className="animate-spin" /> : <Icon name="Search" size={16} />}
            Найти
          </button>
        </form>

        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>{currentOption.hint}</p>

        {/* Selected result */}
        {selected && <PartyCard party={selected} onClose={() => setSelected(null)} />}

        {/* Results list */}
        {!selected && results.length > 0 && (
          <div className="mt-4 space-y-2">
            {results.map((r, i) => {
              const status = statusLabel(r.data?.state?.status);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelected(r)}
                  className="w-full text-left rounded-xl px-5 py-4 transition-all"
                  style={{ background: "var(--bg)", border: "1px solid var(--border-c)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(37,99,235,0.3)";
                    (e.currentTarget as HTMLElement).style.background = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-c)";
                    (e.currentTarget as HTMLElement).style.background = "var(--bg)";
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: "var(--navy)" }}>{r.value}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        ИНН: {r.data?.inn || "—"}
                        {r.data?.address?.value && ` · ${r.data.address.value}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-medium" style={{ color: status.color }}>
                        {status.text}
                      </span>
                      <Icon name="ChevronRight" size={14} style={{ color: "var(--text-muted)" }} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* No results */}
        {searched && !loading && results.length === 0 && !selected && (
          <div className="mt-6 text-center py-8" style={{ color: "var(--text-muted)" }}>
            <Icon name="SearchX" size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Ничего не найдено. Попробуйте изменить запрос.</p>
          </div>
        )}
      </div>
    </div>
  );
}
