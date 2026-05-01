import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const DADATA_TOKEN = import.meta.env.VITE_DADATA_API_KEY || "";
const SUGGEST_URL = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party";
const FIND_URL = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party";

type SearchType = "inn" | "fio" | "address" | "okved";

const SEARCH_OPTIONS = [
  { type: "inn" as SearchType, label: "По ИНН", placeholder: "Введите ИНН (10 или 12 цифр)", icon: "Hash", hint: "ИНН организации или ИП" },
  { type: "fio" as SearchType, label: "По директору / учредителю", placeholder: "Например: Иванов Иван", icon: "User", hint: "ФИО руководителя или учредителя" },
  { type: "address" as SearchType, label: "По адресу", placeholder: "Например: Москва, Ленина 1", icon: "MapPin", hint: "Юридический адрес организации" },
  { type: "okved" as SearchType, label: "По виду деятельности", placeholder: "Например: разработка программного обеспечения", icon: "Briefcase", hint: "Вид деятельности или код ОКВЭД" },
];

interface Founder {
  type?: string;
  name?: string;
  inn?: string;
  share?: { value?: number; type?: string };
  capital?: { value?: number; type?: string };
}

interface OkvedItem {
  code?: string;
  name?: string;
  main?: boolean;
}

interface FinanceYear {
  year?: number;
  revenue?: number;
  expense?: number;
  profit?: number;
  assets?: number;
  debt_payable?: number;
  cash_flow?: number;
  tax_system?: string;
}

interface License {
  series?: string;
  number?: string;
  issue_date?: string;
  expire_date?: string;
  activity?: string;
  authority?: string;
}

interface PartyData {
  inn?: string;
  kpp?: string;
  ogrn?: string;
  ogrn_date?: number;
  type?: string;
  name?: { full_with_opf?: string; short_with_opf?: string; latin?: string };
  state?: { status?: string; registration_date?: number; liquidation_date?: number; actuality_date?: number };
  address?: { value?: string; data?: { postal_code?: string; region?: string; city?: string; street?: string; house?: string } };
  phones?: { value?: string; type?: string; data?: { number?: string } }[];
  emails?: { value?: string; type?: string }[];
  management?: { name?: string; post?: string; disqualified?: boolean };
  founders?: Founder[];
  managers?: { name?: string; inn?: string; post?: string }[];
  predecessors?: { name?: string; inn?: string; ogrn?: string }[];
  successors?: { name?: string; inn?: string; ogrn?: string }[];
  branch_type?: string;
  branch_count?: number;
  okved?: string;
  okved_type?: string;
  okveds?: OkvedItem[];
  employee_count?: number;
  finance?: FinanceYear;
  finances?: FinanceYear[];
  licenses?: License[];
  authorities?: {
    fts_registration?: { name?: string; code?: string };
    fts_report?: { name?: string; code?: string };
    pfr?: { name?: string; code?: string };
    sif?: { name?: string; code?: string };
  };
  capital?: { value?: number; type?: string };
}

interface Party {
  value: string;
  data: PartyData;
}

function statusLabel(status?: string): { text: string; color: string; bg: string } {
  switch (status) {
    case "ACTIVE": return { text: "Действующая", color: "var(--success)", bg: "var(--success-dim)" };
    case "LIQUIDATING": return { text: "В процессе ликвидации", color: "#d97706", bg: "rgba(217,119,6,0.08)" };
    case "LIQUIDATED": return { text: "Ликвидирована", color: "#ef4444", bg: "rgba(239,68,68,0.08)" };
    case "BANKRUPT": return { text: "Банкротство", color: "#ef4444", bg: "rgba(239,68,68,0.08)" };
    case "REORGANIZING": return { text: "Реорганизация", color: "#d97706", bg: "rgba(217,119,6,0.08)" };
    default: return { text: status || "—", color: "var(--text-muted)", bg: "var(--bg)" };
  }
}

function fmtDate(ts?: number | string): string {
  if (!ts) return "—";
  const d = typeof ts === "number" ? new Date(ts) : new Date(ts);
  return d.toLocaleDateString("ru-RU");
}

function fmtMoney(v?: number): string {
  if (v === undefined || v === null) return "—";
  const abs = Math.abs(v);
  const sign = v < 0 ? "−" : "";
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(1)} млрд ₽`;
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)} млн ₽`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(0)} тыс. ₽`;
  return `${sign}${abs.toLocaleString("ru-RU")} ₽`;
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon name={icon as "Info"} size={14} style={{ color: "var(--blue)" }} />
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{title}</p>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-2" style={{ borderBottom: "1px solid var(--border-c)" }}>
      <span className="text-xs flex-shrink-0 w-44" style={{ color: "var(--text-muted)" }}>{label}</span>
      <span className={`text-sm font-medium flex-1 ${mono ? "font-mono" : ""}`} style={{ color: "var(--navy)" }}>{value}</span>
    </div>
  );
}

function FinanceBlock({ fin }: { fin: FinanceYear }) {
  const items = [
    { label: "Выручка", value: fin.revenue, pos: true },
    { label: "Расходы", value: fin.expense, pos: false },
    { label: "Прибыль / убыток", value: fin.profit, pos: (fin.profit ?? 0) >= 0 },
    { label: "Активы", value: fin.assets, pos: true },
    { label: "Кредиторская задолженность", value: fin.debt_payable, pos: false },
    { label: "Денежный поток", value: fin.cash_flow, pos: (fin.cash_flow ?? 0) >= 0 },
  ].filter(i => i.value !== undefined && i.value !== null);

  if (!items.length) return null;

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-c)" }}>
      <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: "var(--bg)", borderBottom: "1px solid var(--border-c)" }}>
        <span className="text-xs font-bold" style={{ color: "var(--navy)" }}>{fin.year} год</span>
        {fin.tax_system && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--blue-dim)", color: "var(--blue)" }}>{fin.tax_system}</span>}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-px" style={{ background: "var(--border-c)" }}>
        {items.map(({ label, value, pos }) => (
          <div key={label} className="px-3 py-3" style={{ background: "#fff" }}>
            <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
            <p className="text-sm font-bold" style={{ color: pos ? "var(--success)" : "#ef4444" }}>{fmtMoney(value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PartyCard({ party, onClose }: { party: Party; onClose: () => void }) {
  const d = party.data;
  const status = statusLabel(d.state?.status);
  const isIP = d.type === "INDIVIDUAL";
  const finances = d.finances?.length ? d.finances : d.finance ? [d.finance] : [];

  return (
    <div className="mt-4 rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border-c)", background: "#fff" }}>
      {/* Header */}
      <div className="px-6 py-5 flex items-start justify-between gap-4" style={{ background: "var(--navy)" }}>
        <div className="min-w-0">
          <p className="text-xs font-semibold mb-1 opacity-60" style={{ color: "#fff" }}>
            {isIP ? "Индивидуальный предприниматель" : "Юридическое лицо"}
            {d.branch_type === "BRANCH" && " · Филиал"}
          </p>
          <h3 className="text-xl font-bold leading-snug" style={{ color: "#fff", fontFamily: "Playfair Display, serif" }}>{party.value}</h3>
          {d.name?.latin && <p className="text-xs opacity-50 mt-0.5" style={{ color: "#fff" }}>{d.name.latin}</p>}
          {d.okved && <p className="text-xs mt-1.5 opacity-60" style={{ color: "#fff" }}>{d.okved} · {d.okved_type}</p>}
        </div>
        <button onClick={onClose} className="flex-shrink-0 mt-1 opacity-60 hover:opacity-100 transition-opacity" style={{ color: "#fff" }}>
          <Icon name="X" size={18} />
        </button>
      </div>

      {/* Status badges */}
      <div className="px-6 pt-5 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ background: status.bg, color: status.color, border: `1px solid ${status.color}30` }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />
          {status.text}
        </span>
        {d.state?.registration_date && (
          <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: "var(--bg)", color: "var(--text-muted)", border: "1px solid var(--border-c)" }}>
            Зарег.: {fmtDate(d.state.registration_date)}
          </span>
        )}
        {d.state?.liquidation_date && (
          <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
            Ликв.: {fmtDate(d.state.liquidation_date)}
          </span>
        )}
        {d.employee_count && (
          <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: "var(--bg)", color: "var(--text-muted)", border: "1px solid var(--border-c)" }}>
            {d.employee_count} сотр.
          </span>
        )}
        {d.branch_count != null && d.branch_count > 0 && (
          <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: "var(--bg)", color: "var(--text-muted)", border: "1px solid var(--border-c)" }}>
            Филиалов: {d.branch_count}
          </span>
        )}
      </div>

      <div className="px-6 pb-6 pt-4 space-y-6">

        {/* Реквизиты */}
        <Section title="Реквизиты" icon="FileText">
          <div>
            <Row label="ИНН" value={d.inn} mono />
            <Row label="КПП" value={d.kpp} mono />
            <Row label="ОГРН" value={d.ogrn} mono />
            <Row label="Дата регистрации ОГРН" value={fmtDate(d.ogrn_date)} />
            {d.capital?.value && <Row label="Уставной капитал" value={fmtMoney(d.capital.value)} />}
          </div>
        </Section>

        {/* Адрес */}
        {d.address?.value && (
          <Section title="Юридический адрес" icon="MapPin">
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "var(--bg)", color: "var(--navy)" }}>
              {d.address.value}
            </div>
          </Section>
        )}

        {/* Контакты */}
        {((d.phones && d.phones.length > 0) || (d.emails && d.emails.length > 0)) && (
          <Section title="Контактные данные" icon="Phone">
            <div>
              {d.phones?.map((p, i) => (
                <Row key={i} label={`Телефон${d.phones!.length > 1 ? ` ${i + 1}` : ""}`} value={p.value || p.data?.number} />
              ))}
              {d.emails?.map((e, i) => (
                <Row key={i} label={`Email${d.emails!.length > 1 ? ` ${i + 1}` : ""}`} value={e.value} />
              ))}
            </div>
          </Section>
        )}

        {/* Руководство */}
        {(d.management || (d.managers && d.managers.length > 0)) && (
          <Section title="Руководство" icon="UserCheck">
            <div className="space-y-2">
              {d.management?.name && (
                <div className="rounded-xl px-4 py-3" style={{ background: "var(--bg)", border: "1px solid var(--border-c)" }}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--navy)" }}>{d.management.name}</p>
                      {d.management.post && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{d.management.post}</p>}
                    </div>
                    {d.management.disqualified && (
                      <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                        Дисквалифицирован
                      </span>
                    )}
                  </div>
                </div>
              )}
              {d.managers?.filter(m => m.name !== d.management?.name).map((m, i) => (
                <div key={i} className="rounded-xl px-4 py-3" style={{ background: "var(--bg)", border: "1px solid var(--border-c)" }}>
                  <p className="text-sm font-semibold" style={{ color: "var(--navy)" }}>{m.name}</p>
                  {m.post && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{m.post}</p>}
                  {m.inn && <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>ИНН: {m.inn}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Учредители */}
        {d.founders && d.founders.length > 0 && (
          <Section title="Учредители" icon="Users">
            <div className="space-y-2">
              {d.founders.map((f, i) => (
                <div key={i} className="rounded-xl px-4 py-3 flex items-center justify-between gap-3" style={{ background: "var(--bg)", border: "1px solid var(--border-c)" }}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--navy)" }}>{f.name || "—"}</p>
                    {f.inn && <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>ИНН: {f.inn}</p>}
                    {f.type && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{f.type === "LEGAL" ? "Юр. лицо" : "Физ. лицо"}</p>}
                  </div>
                  {f.share?.value != null && (
                    <span className="text-sm font-bold flex-shrink-0" style={{ color: "var(--blue)" }}>
                      {f.share.value}%
                    </span>
                  )}
                  {f.capital?.value != null && (
                    <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                      {fmtMoney(f.capital.value)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ОКВЭД */}
        {d.okveds && d.okveds.length > 0 && (
          <Section title="Виды деятельности (ОКВЭД)" icon="Briefcase">
            <div className="space-y-1.5">
              {d.okveds.slice(0, 10).map((o, i) => (
                <div key={i} className="flex gap-3 items-start py-1.5" style={{ borderBottom: "1px solid var(--border-c)" }}>
                  <span className="text-xs font-mono font-semibold flex-shrink-0 mt-0.5" style={{ color: o.main ? "var(--blue)" : "var(--text-muted)" }}>
                    {o.code}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text)" }}>{o.name}</span>
                  {o.main && <span className="text-xs ml-auto flex-shrink-0 px-2 py-0.5 rounded-full" style={{ background: "var(--blue-dim)", color: "var(--blue)" }}>основной</span>}
                </div>
              ))}
              {d.okveds.length > 10 && (
                <p className="text-xs text-center pt-1" style={{ color: "var(--text-muted)" }}>и ещё {d.okveds.length - 10}...</p>
              )}
            </div>
          </Section>
        )}

        {/* Финансовая отчётность */}
        {finances.length > 0 && (
          <Section title="Финансовая отчётность" icon="BarChart2">
            <div className="space-y-3">
              {finances.sort((a, b) => (b.year ?? 0) - (a.year ?? 0)).map((fin, i) => (
                <FinanceBlock key={i} fin={fin} />
              ))}
            </div>
          </Section>
        )}

        {/* Лицензии */}
        {d.licenses && d.licenses.length > 0 && (
          <Section title="Лицензии" icon="ShieldCheck">
            <div className="space-y-2">
              {d.licenses.map((l, i) => (
                <div key={i} className="rounded-xl px-4 py-3" style={{ background: "var(--bg)", border: "1px solid var(--border-c)" }}>
                  <p className="text-sm font-semibold" style={{ color: "var(--navy)" }}>{l.activity || "Лицензируемая деятельность"}</p>
                  <div className="mt-1 space-y-0.5">
                    {l.number && <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>№ {l.series ? `${l.series} ` : ""}{l.number}</p>}
                    {l.issue_date && <p className="text-xs" style={{ color: "var(--text-muted)" }}>Выдана: {fmtDate(l.issue_date)}{l.expire_date ? ` · Действует до: ${fmtDate(l.expire_date)}` : ""}</p>}
                    {l.authority && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{l.authority}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Реорганизации */}
        {((d.predecessors && d.predecessors.length > 0) || (d.successors && d.successors.length > 0)) && (
          <Section title="Реорганизация" icon="GitMerge">
            <div className="space-y-1.5">
              {d.predecessors?.map((p, i) => <Row key={`pre-${i}`} label="Предшественник" value={`${p.name}${p.inn ? ` (ИНН ${p.inn})` : ""}`} />)}
              {d.successors?.map((s, i) => <Row key={`suc-${i}`} label="Правопреемник" value={`${s.name}${s.inn ? ` (ИНН ${s.inn})` : ""}`} />)}
            </div>
          </Section>
        )}

        {/* Налоговые органы */}
        {d.authorities && (
          <Section title="Контролирующие органы" icon="Building">
            <div>
              {d.authorities.fts_registration?.name && <Row label="ИФНС (регистрация)" value={`${d.authorities.fts_registration.name}${d.authorities.fts_registration.code ? ` (${d.authorities.fts_registration.code})` : ""}`} />}
              {d.authorities.fts_report?.name && <Row label="ИФНС (отчётность)" value={`${d.authorities.fts_report.name}${d.authorities.fts_report.code ? ` (${d.authorities.fts_report.code})` : ""}`} />}
              {d.authorities.pfr?.name && <Row label="ПФР" value={`${d.authorities.pfr.name}${d.authorities.pfr.code ? ` (${d.authorities.pfr.code})` : ""}`} />}
              {d.authorities.sif?.name && <Row label="ФСС" value={`${d.authorities.sif.name}${d.authorities.sif.code ? ` (${d.authorities.sif.code})` : ""}`} />}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

export default function ContractorCheck() {
  const [searchType, setSearchType] = useState<SearchType>("inn");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Party[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [results, setResults] = useState<Party[]>([]);
  const [selected, setSelected] = useState<Party | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentOption = SEARCH_OPTIONS.find((o) => o.type === searchType)!;

  // Автодополнение при вводе
  useEffect(() => {
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    if (!query.trim() || query.length < 2 || !DADATA_TOKEN) {
      setSuggestions([]);
      return;
    }
    suggestTimer.current = setTimeout(async () => {
      const body: Record<string, unknown> = { query: query.trim(), count: 7 };
      if (searchType === "fio") body.filters = [{ "management.name": query.trim() }];
      else if (searchType === "address") body.filters = [{ "address": query.trim() }];
      else if (searchType === "okved") body.filters = [{ "okved": query.trim() }];

      const url = searchType === "inn" ? FIND_URL : SUGGEST_URL;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Token ${DADATA_TOKEN}` },
        body: JSON.stringify(body),
      }).catch(() => null);
      if (!res) return;
      const data = await res.json();
      setSuggestions(data.suggestions || []);
      setShowSuggestions(true);
    }, 250);
  }, [query, searchType]);

  // Загрузка полных данных по ИНН
  const loadFull = async (inn: string): Promise<Party | null> => {
    const res = await fetch(FIND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Token ${DADATA_TOKEN}` },
      body: JSON.stringify({ query: inn, count: 1 }),
    }).catch(() => null);
    if (!res) return null;
    const data = await res.json();
    return data.suggestions?.[0] || null;
  };

  const selectParty = async (party: Party) => {
    setShowSuggestions(false);
    setSuggestions([]);
    setQuery(party.value);
    setResults([]);
    setSearched(true);
    // Подгружаем полные данные по ИНН
    if (party.data?.inn) {
      setLoading(true);
      const full = await loadFull(party.data.inn);
      setSelected(full || party);
      setLoading(false);
    } else {
      setSelected(party);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setShowSuggestions(false);
    setSuggestions([]);
    setLoading(true);
    setResults([]);
    setSelected(null);
    setSearched(false);

    try {
      const body: Record<string, unknown> = { query: query.trim(), count: 10 };
      const url = searchType === "inn" ? FIND_URL : SUGGEST_URL;
      if (searchType === "fio") body.filters = [{ "management.name": query.trim() }];
      else if (searchType === "address") body.filters = [{ "address": query.trim() }];
      else if (searchType === "okved") body.filters = [{ "okved": query.trim() }];

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Token ${DADATA_TOKEN}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      const list: Party[] = data.suggestions || [];
      // Если один результат — сразу открываем с полными данными
      if (list.length === 1 && list[0].data?.inn) {
        const full = await loadFull(list[0].data.inn);
        setSelected(full || list[0]);
      } else {
        setResults(list);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const reset = () => { setQuery(""); setResults([]); setSelected(null); setSuggestions([]); setSearched(false); };

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
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Реестр ФНС · финансы · контакты · учредители</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          {SEARCH_OPTIONS.map((opt) => (
            <button key={opt.type} type="button"
              onClick={() => { setSearchType(opt.type); reset(); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: searchType === opt.type ? "var(--blue)" : "var(--bg)",
                color: searchType === opt.type ? "#fff" : "var(--text-muted)",
                border: `1px solid ${searchType === opt.type ? "var(--blue)" : "var(--border-c)"}`,
              }}>
              <Icon name={opt.icon as "Hash"} size={13} />
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Icon name={currentOption.icon as "Hash"} size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-muted)" }} />
            <input
              ref={inputRef}
              className="w-full pl-10 pr-10 py-3 rounded-lg text-sm outline-none transition-colors font-body"
              style={{ background: "var(--bg)", border: "1px solid var(--border-c)", color: "var(--text)" }}
              placeholder={currentOption.placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              disabled={loading}
              autoComplete="off"
            />
            {query && (
              <button type="button" onClick={reset}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                style={{ color: "var(--text-muted)" }}>
                <Icon name="X" size={15} />
              </button>
            )}

            {/* Autocomplete dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 z-50 rounded-xl overflow-hidden text-sm mt-1"
                style={{ background: "#fff", border: "1px solid var(--border-c)", boxShadow: "0 8px 24px rgba(0,0,0,0.10)", top: "100%" }}>
                {suggestions.map((s, i) => {
                  const st = statusLabel(s.data?.state?.status);
                  return (
                    <li key={i} onMouseDown={() => selectParty(s)}
                      className="px-4 py-3 cursor-pointer transition-colors"
                      style={{ borderBottom: i < suggestions.length - 1 ? "1px solid var(--border-c)" : "none" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#fff")}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium truncate" style={{ color: "var(--navy)" }}>{s.value}</p>
                          <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                            ИНН: {s.data?.inn || "—"}
                            {s.data?.address?.value && ` · ${s.data.address.value}`}
                          </p>
                        </div>
                        <span className="text-xs flex-shrink-0 font-medium" style={{ color: st.color }}>{st.text}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <button type="submit" disabled={loading || !query.trim()}
            className="px-5 py-3 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 flex-shrink-0"
            style={{ background: "var(--blue)", color: "#fff", opacity: loading || !query.trim() ? 0.6 : 1 }}>
            {loading ? <Icon name="LoaderCircle" size={16} className="animate-spin" /> : <Icon name="Search" size={16} />}
            Найти
          </button>
        </form>
        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>{currentOption.hint}</p>

        {/* Selected party full card */}
        {selected && <PartyCard party={selected} onClose={() => setSelected(null)} />}

        {/* Results list */}
        {!selected && results.length > 0 && (
          <div className="mt-4 space-y-2">
            {results.map((r, i) => {
              const st = statusLabel(r.data?.state?.status);
              return (
                <button key={i} type="button" onClick={() => selectParty(r)}
                  className="w-full text-left rounded-xl px-5 py-4 transition-all"
                  style={{ background: "var(--bg)", border: "1px solid var(--border-c)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(37,99,235,0.3)"; (e.currentTarget as HTMLElement).style.background = "#fff"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-c)"; (e.currentTarget as HTMLElement).style.background = "var(--bg)"; }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: "var(--navy)" }}>{r.value}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        ИНН: {r.data?.inn || "—"}{r.data?.address?.value && ` · ${r.data.address.value}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-medium" style={{ color: st.color }}>{st.text}</span>
                      <Icon name="ChevronRight" size={14} style={{ color: "var(--text-muted)" }} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Empty state */}
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
