import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

const ADMIN_URL = "https://functions.poehali.dev/2fb10b23-2471-4f73-a39f-315ed4c51e8c";

interface ChartPoint { date: string; count: number }

interface DashData {
  submissions_total: number;
  submissions_7d: number;
  partners_total: number;
  partners_active: number;
  clients_total: number;
  clients_done: number;
  contracts_sum: number;
  contracts_paid_sum: number;
  rewards_total: number;
  rewards_paid: number;
  rewards_pending: number;
  payments_sum: number;
  submissions_chart: ChartPoint[];
  clients_chart: ChartPoint[];
}

function fmtMoney(v: number) {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)} млрд ₽`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} млн ₽`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)} тыс. ₽`;
  return `${v.toLocaleString("ru-RU")} ₽`;
}

function fmtDay(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
}

// Заполняем пропущенные дни нулями за последние 30 дней
function fillDays(chart: ChartPoint[]): { date: string; label: string; count: number }[] {
  const map: Record<string, number> = {};
  chart.forEach(p => { map[p.date] = p.count; });
  const result = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, label: fmtDay(key), count: map[key] || 0 });
  }
  return result;
}

interface CardProps {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

function StatCard({ icon, label, value, sub, color = "var(--blue)" }: CardProps) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)" }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
          <Icon name={icon as "Users"} size={18} style={{ color }} />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{label}</p>
      </div>
      <p className="text-2xl md:text-3xl font-bold mb-1" style={{ color: "var(--navy)" }}>{value}</p>
      {sub && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{sub}</p>}
    </div>
  );
}

export default function AdminDashboard({ sessionId }: { sessionId: string }) {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch(ADMIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
      body: JSON.stringify({ action: "dashboard" }),
    });
    const json = await res.json();
    setData(json);
    setLastUpdate(new Date());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Icon name="LoaderCircle" size={28} className="animate-spin" style={{ color: "var(--blue)" }} />
    </div>
  );

  if (!data) return null;

  const convRate = data.clients_total > 0
    ? Math.round((data.clients_done / data.clients_total) * 100)
    : 0;

  const submissionsChart = fillDays(data.submissions_chart || []);
  const clientsChart = fillDays(data.clients_chart || []);

  // Объединяем два чарта по дате для одного графика
  const combinedChart = submissionsChart.map((s, i) => ({
    label: s.label,
    "Заявки с сайта": s.count,
    "Клиенты партнёров": clientsChart[i]?.count || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: "var(--text-muted)" }}>Обновлено</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {lastUpdate?.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <button onClick={load}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-opacity hover:opacity-70"
          style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)", color: "var(--blue)" }}>
          <Icon name="RefreshCw" size={13} />
          Обновить
        </button>
      </div>

      {/* Заявки */}
      <section>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Заявки с сайта</p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon="Inbox" label="Всего заявок" value={data.submissions_total} color="var(--blue)" />
          <StatCard icon="TrendingUp" label="За 7 дней" value={data.submissions_7d} color="#7c3aed" />
        </div>
      </section>

      {/* Партнёры и клиенты */}
      <section>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Партнёры и клиенты</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon="Handshake" label="Партнёров всего" value={data.partners_total} color="#d97706" />
          <StatCard icon="CheckCircle2" label="Активных" value={data.partners_active} color="var(--success)" />
          <StatCard icon="Users" label="Клиентов" value={data.clients_total} color="var(--blue)" />
          <StatCard icon="Percent" label="Конверсия" value={`${convRate}%`} sub={`${data.clients_done} завершено`} color="#7c3aed" />
        </div>
      </section>

      {/* График динамики */}
      <section>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Динамика за 30 дней</p>
        <div className="rounded-2xl p-5" style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)" }}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={combinedChart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--blue)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradPurple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-c)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                tickLine={false}
                axisLine={false}
                interval={6}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-white)",
                  border: "1px solid var(--border-c)",
                  borderRadius: 12,
                  fontSize: 12,
                  color: "var(--navy)",
                }}
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                iconType="circle"
                iconSize={8}
              />
              <Area
                type="monotone"
                dataKey="Заявки с сайта"
                stroke="var(--blue)"
                strokeWidth={2}
                fill="url(#gradBlue)"
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Area
                type="monotone"
                dataKey="Клиенты партнёров"
                stroke="#7c3aed"
                strokeWidth={2}
                fill="url(#gradPurple)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Финансы */}
      <section>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Финансы</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          {/* Контракты */}
          <div className="rounded-2xl p-5 space-y-4" style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)" }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(21,128,61,0.1)" }}>
                <Icon name="FileSignature" size={16} style={{ color: "var(--success)" }} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Суммы контрактов</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Всего по контрактам</span>
                <span className="text-base font-bold" style={{ color: "var(--navy)" }}>{fmtMoney(data.contracts_sum)}</span>
              </div>
              <div className="h-px" style={{ background: "var(--border-c)" }} />
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Оплачено клиентами</span>
                <span className="text-base font-bold" style={{ color: "var(--success)" }}>{fmtMoney(data.contracts_paid_sum)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Ожидает оплаты</span>
                <span className="text-base font-bold" style={{ color: "#d97706" }}>{fmtMoney(data.contracts_sum - data.contracts_paid_sum)}</span>
              </div>
              {data.contracts_sum > 0 && (
                <div>
                  <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                    <span>Собрано</span>
                    <span>{Math.round((data.contracts_paid_sum / data.contracts_sum) * 100)}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (data.contracts_paid_sum / data.contracts_sum) * 100)}%`, background: "var(--success)" }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Вознаграждения */}
          <div className="rounded-2xl p-5 space-y-4" style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)" }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.1)" }}>
                <Icon name="Wallet" size={16} style={{ color: "#7c3aed" }} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Вознаграждения партнёрам</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Начислено всего</span>
                <span className="text-base font-bold" style={{ color: "var(--navy)" }}>{fmtMoney(data.rewards_total)}</span>
              </div>
              <div className="h-px" style={{ background: "var(--border-c)" }} />
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Уже выплачено</span>
                <span className="text-base font-bold" style={{ color: "var(--success)" }}>{fmtMoney(data.rewards_paid)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>К выплате</span>
                <span className="text-base font-bold" style={{ color: "#ef4444" }}>{fmtMoney(data.rewards_pending)}</span>
              </div>
              {data.rewards_total > 0 && (
                <div>
                  <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                    <span>Выплачено</span>
                    <span>{Math.round((data.rewards_paid / data.rewards_total) * 100)}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (data.rewards_paid / data.rewards_total) * 100)}%`, background: "#7c3aed" }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Столбчатый график по неделям */}
      <section>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Заявки по неделям</p>
        <div className="rounded-2xl p-5" style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)" }}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={[0, 1, 2, 3].map(weekIdx => {
                const startI = weekIdx * 7;
                const slice = combinedChart.slice(startI, startI + 7);
                const label = slice[0]?.label || "";
                return {
                  label,
                  "Заявки с сайта": slice.reduce((s, p) => s + p["Заявки с сайта"], 0),
                  "Клиенты": slice.reduce((s, p) => s + p["Клиенты партнёров"], 0),
                };
              })}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-c)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--text-muted)" }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "var(--text-muted)" }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-white)",
                  border: "1px solid var(--border-c)",
                  borderRadius: 12,
                  fontSize: 12,
                  color: "var(--navy)",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} iconType="circle" iconSize={8} />
              <Bar dataKey="Заявки с сайта" fill="var(--blue)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Клиенты" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
