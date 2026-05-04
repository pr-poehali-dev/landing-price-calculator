import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { apiPartner, DEAL_STATUS_META, fmtMoney, type Stats, type DealStatus } from "./types";

interface Props { sessionId: string; missingCount?: number; onGoToProfile?: () => void }

export default function PartnerStats({ sessionId, missingCount = 0, onGoToProfile }: Props) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await apiPartner(sessionId, { action: "get_stats" });
      if (data.stats) setStats(data.stats);
      setLoading(false);
    })();
  }, [sessionId]);

  if (loading) return (
    <div className="flex items-center justify-center py-8">
      <Icon name="LoaderCircle" size={22} className="animate-spin" style={{ color: "var(--blue)" }} />
    </div>
  );

  if (!stats) return null;

  const conversion = stats.total > 0
    ? Math.round(((stats.by_status.done || 0) / stats.total) * 100)
    : 0;

  return (
    <div className="space-y-5">
      {missingCount > 0 && (
        <div className="rounded-xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
          style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.25)" }}>
          <div className="flex items-center gap-3">
            <Icon name="AlertCircle" size={18} style={{ color: "#ef4444" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#ef4444" }}>Профиль не заполнен</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Не хватает {missingCount} {missingCount === 1 ? "поля" : missingCount < 5 ? "полей" : "полей"} — заполните, чтобы получать выплаты
              </p>
            </div>
          </div>
          {onGoToProfile && (
            <button onClick={onGoToProfile}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg flex-shrink-0 transition-opacity hover:opacity-80"
              style={{ background: "#ef4444", color: "#fff" }}>
              Заполнить профиль
              <Icon name="ArrowRight" size={13} />
            </button>
          )}
        </div>
      )}
      {/* Top cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: "Users", label: "Всего клиентов", value: stats.total, color: "var(--blue)" },
          { icon: "TrendingUp", label: "Конверсия", value: `${conversion}%`, color: "var(--success)" },
          { icon: "Wallet", label: "Начислено", value: fmtMoney(stats.total_reward), color: "#7c3aed" },
          { icon: "BadgeCheck", label: "Выплачено", value: fmtMoney(stats.paid_reward), color: "var(--success)" },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl p-5" style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)" }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: `${c.color}18` }}>
              <Icon name={c.icon as "Users"} size={18} style={{ color: c.color }} />
            </div>
            <p className="text-2xl font-bold mb-1" style={{ color: "var(--navy)" }}>{c.value}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* Funnel */}
      <div className="rounded-2xl p-6" style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)" }}>
        <p className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: "var(--text-muted)" }}>Воронка по статусам</p>
        <div className="space-y-2">
          {(Object.entries(DEAL_STATUS_META) as [DealStatus, typeof DEAL_STATUS_META[DealStatus]][]).map(([key, meta]) => {
            const count = stats.by_status[key] || 0;
            const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
            return (
              <div key={key} className="flex items-center gap-4">
                <span className="text-xs w-36 flex-shrink-0 font-medium" style={{ color: "var(--text)" }}>{meta.label}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--bg)" }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: meta.color }} />
                </div>
                <span className="text-xs w-6 text-right font-bold" style={{ color: meta.color }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}