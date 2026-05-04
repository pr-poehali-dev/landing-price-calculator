import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";
import { apiPartner } from "./types";

interface Service {
  id: number;
  category: string;
  name: string;
  description: string | null;
  base_price: number | null;
  price_note: string | null;
  rate_pct: number;
}

interface Props {
  sessionId: string;
  partnerId: number;
  isAdmin: boolean;
}

function fmtMoney(v: number | null) {
  if (!v) return "—";
  if (v >= 1000) return `${(v / 1000).toFixed(0)} тыс. ₽`;
  return `${v.toLocaleString("ru-RU")} ₽`;
}

export default function PartnerRates({ sessionId, partnerId, isAdmin }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, string>>({});

  useEffect(() => {
    apiPartner(sessionId, { action: "get_services", partner_id: partnerId })
      .then(d => {
        if (d.services) {
          setServices(d.services);
          const init: Record<number, string> = {};
          d.services.forEach((s: Service) => { init[s.id] = String(s.rate_pct ?? 0); });
          setDrafts(init);
        }
        setLoading(false);
      });
  }, [sessionId, partnerId]);

  const handleSave = async (serviceId: number) => {
    setSaving(serviceId);
    const rate = parseFloat(drafts[serviceId] || "0");
    const data = await apiPartner(sessionId, {
      action: "set_partner_rate",
      partner_id: partnerId,
      service_id: serviceId,
      rate_pct: rate,
    });
    setSaving(null);
    if (data.ok) {
      setServices(prev => prev.map(s => s.id === serviceId ? { ...s, rate_pct: rate } : s));
      toast.success("Ставка сохранена");
    } else {
      toast.error(data.error || "Ошибка");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Icon name="LoaderCircle" size={24} className="animate-spin" style={{ color: "var(--blue)" }} />
    </div>
  );

  // группируем по категориям
  const categories = [...new Set(services.map(s => s.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-1">
        <Icon name="Percent" size={15} style={{ color: "var(--blue)" }} />
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          {isAdmin ? "Индивидуальные ставки вознаграждения" : "Мои ставки вознаграждения"}
        </p>
      </div>
      {!isAdmin && (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Ставки устанавливает администратор индивидуально для каждой услуги.
        </p>
      )}

      {categories.map(cat => {
        const catServices = services.filter(s => s.category === cat);
        return (
          <div key={cat}>
            <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{cat}</p>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-c)" }}>
              {catServices.map((s, i) => (
                <div key={s.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3"
                  style={{ borderBottom: i < catServices.length - 1 ? "1px solid var(--border-c)" : "none", background: "#fff" }}>
                  {/* Название */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "var(--navy)" }}>{s.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {s.description} · {s.price_note || fmtMoney(s.base_price)}
                    </p>
                  </div>

                  {/* Ставка */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isAdmin ? (
                      <>
                        <div className="relative">
                          <input
                            type="number" min="0" max="100" step="0.5"
                            value={drafts[s.id] ?? "0"}
                            onChange={e => setDrafts(prev => ({ ...prev, [s.id]: e.target.value }))}
                            className="w-20 px-3 py-1.5 rounded-lg text-sm outline-none text-right font-mono"
                            style={{ background: "var(--bg)", border: "1px solid var(--border-c)", color: "var(--navy)" }}
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: "var(--text-muted)" }}>%</span>
                        </div>
                        <button
                          onClick={() => handleSave(s.id)}
                          disabled={saving === s.id || drafts[s.id] === String(s.rate_pct)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                          style={{
                            background: drafts[s.id] !== String(s.rate_pct) ? "var(--blue)" : "var(--bg)",
                            color: drafts[s.id] !== String(s.rate_pct) ? "#fff" : "var(--text-muted)",
                            border: "1px solid var(--border-c)",
                          }}>
                          {saving === s.id
                            ? <Icon name="LoaderCircle" size={12} className="animate-spin" />
                            : <Icon name="Check" size={12} />}
                          Сохранить
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                        style={{ background: s.rate_pct > 0 ? "var(--blue-dim)" : "var(--bg)", border: "1px solid var(--border-c)" }}>
                        <span className="text-sm font-bold font-mono" style={{ color: s.rate_pct > 0 ? "var(--blue)" : "var(--text-muted)" }}>
                          {s.rate_pct > 0 ? `${s.rate_pct}%` : "—"}
                        </span>
                        {s.rate_pct > 0 && s.base_price && (
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            → {fmtMoney(s.base_price * s.rate_pct / 100)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
