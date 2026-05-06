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

interface CustomRate {
  id: number;
  service_name: string;
  amount: number;
  note: string | null;
}

interface Props {
  sessionId: string;
  partnerId: number;
  isAdmin: boolean;
  lawyerType?: string | null;
}

function fmtMoney(v: number | null) {
  if (!v) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} млн ₽`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)} тыс. ₽`;
  return `${v.toLocaleString("ru-RU")} ₽`;
}

const EMPTY_CUSTOM = { service_name: "", amount: "", note: "" };

export default function PartnerRates({ sessionId, partnerId, isAdmin, lawyerType }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [customRates, setCustomRates] = useState<CustomRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, string>>({});

  // Форма нового / редактируемого индивидуального тарифа
  const [editCustom, setEditCustom] = useState<{ id?: number; service_name: string; amount: string; note: string } | null>(null);
  const [savingCustom, setSavingCustom] = useState(false);
  const [deletingCustom, setDeletingCustom] = useState<number | null>(null);

  const load = () => {
    Promise.all([
      apiPartner(sessionId, { action: "get_services", partner_id: partnerId }),
      apiPartner(sessionId, { action: "get_custom_rates", partner_id: partnerId }),
    ]).then(([sd, cd]) => {
      if (sd.services) {
        setServices(sd.services);
        const init: Record<number, string> = {};
        sd.services.forEach((s: Service) => { init[s.id] = String(s.rate_pct ?? 0); });
        setDrafts(init);
      }
      if (cd.custom_rates) setCustomRates(cd.custom_rates);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, [sessionId, partnerId]);

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

  const handleSaveCustom = async () => {
    if (!editCustom) return;
    if (!editCustom.service_name.trim()) { toast.error("Укажите название услуги"); return; }
    setSavingCustom(true);
    const data = await apiPartner(sessionId, {
      action: "save_custom_rate",
      partner_id: partnerId,
      id: editCustom.id,
      service_name: editCustom.service_name.trim(),
      amount: parseFloat(editCustom.amount) || 0,
      note: editCustom.note.trim() || null,
    });
    setSavingCustom(false);
    if (data.ok) {
      toast.success(editCustom.id ? "Тариф обновлён" : "Тариф добавлен");
      setEditCustom(null);
      load();
    } else {
      toast.error(data.error || "Ошибка");
    }
  };

  const handleDeleteCustom = async (id: number) => {
    setDeletingCustom(id);
    const data = await apiPartner(sessionId, {
      action: "delete_custom_rate",
      partner_id: partnerId,
      id,
    });
    setDeletingCustom(null);
    if (data.ok) {
      setCustomRates(prev => prev.filter(r => r.id !== id));
      toast.success("Тариф удалён");
    } else {
      toast.error(data.error || "Ошибка");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Icon name="LoaderCircle" size={24} className="animate-spin" style={{ color: "var(--blue)" }} />
    </div>
  );

  const hasLawyerAccess = isAdmin || lawyerType === "lawyer" || lawyerType === "advocate";
  const visibleServices = services.filter(s => s.category !== "Для юристов" || hasLawyerAccess);
  const categories = [...new Set(visibleServices.map(s => s.category))];

  return (
    <div className="space-y-8">

      {/* ── Стандартные ставки ── */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
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

        {!isAdmin && !hasLawyerAccess && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(217,119,6,0.06)", border: "1px solid rgba(217,119,6,0.2)" }}>
            <Icon name="Clock" size={16} style={{ color: "#d97706", flexShrink: 0, marginTop: 1 }} />
            <div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: "#d97706" }}>Тарифы для юристов и адвокатов</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Доступ к дополнительным тарифам открывается после подтверждения вашего статуса юриста или адвоката администратором.
              </p>
            </div>
          </div>
        )}

        {!isAdmin && hasLawyerAccess && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)" }}>
            <Icon name="BadgeCheck" size={14} style={{ color: "#7c3aed" }} />
            <p className="text-xs font-medium" style={{ color: "#7c3aed" }}>
              {lawyerType === "advocate" ? "Адвокат" : "Юрист"} — доступ к расширенным тарифам открыт
            </p>
          </div>
        )}

        {categories.map(cat => {
          const catServices = visibleServices.filter(s => s.category === cat);
          return (
            <div key={cat}>
              <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{cat}</p>
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-c)" }}>
                {catServices.map((s, i) => (
                  <div key={s.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3"
                    style={{ borderBottom: i < catServices.length - 1 ? "1px solid var(--border-c)" : "none", background: "var(--bg-white)" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: "var(--navy)" }}>{s.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {s.description} · {s.price_note || fmtMoney(s.base_price)}
                      </p>
                    </div>
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
                            {saving === s.id ? <Icon name="LoaderCircle" size={12} className="animate-spin" /> : <Icon name="Check" size={12} />}
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

      {/* ── Разделитель ── */}
      <div className="h-px" style={{ background: "var(--border-c)" }} />

      {/* ── Индивидуальные тарифы ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon name="Sparkles" size={15} style={{ color: "var(--blue)" }} />
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Индивидуальный тариф
            </p>
          </div>
          <button
            onClick={() => setEditCustom({ ...EMPTY_CUSTOM })}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
            style={{ background: "var(--blue)", color: "#fff" }}>
            <Icon name="Plus" size={13} />
            Добавить
          </button>
        </div>

        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Произвольная услуга с фиксированной суммой вознаграждения — например, за нестандартную юридическую работу.
        </p>

        {/* Список индивидуальных тарифов */}
        {customRates.length === 0 ? (
          <div className="rounded-xl py-8 text-center" style={{ border: "1px dashed var(--border-c)" }}>
            <Icon name="Sparkles" size={24} className="mx-auto mb-2 opacity-30" style={{ color: "var(--text-muted)" }} />
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Индивидуальных тарифов пока нет</p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-c)" }}>
            {customRates.map((r, i) => (
              <div key={r.id}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: i < customRates.length - 1 ? "1px solid var(--border-c)" : "none", background: "var(--bg-white)" }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: "var(--navy)" }}>{r.service_name}</p>
                  {r.note && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{r.note}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-bold font-mono" style={{ color: "var(--blue)" }}>
                    {fmtMoney(r.amount)}
                  </span>
                  <button
                    onClick={() => setEditCustom({ id: r.id, service_name: r.service_name, amount: String(r.amount), note: r.note || "" })}
                    className="p-1.5 rounded-lg transition-opacity hover:opacity-70"
                    style={{ color: "var(--text-muted)" }}>
                    <Icon name="Pencil" size={13} />
                  </button>
                  <button
                    onClick={() => handleDeleteCustom(r.id)}
                    disabled={deletingCustom === r.id}
                    className="p-1.5 rounded-lg transition-opacity hover:opacity-70"
                    style={{ color: "#ef4444" }}>
                    {deletingCustom === r.id
                      ? <Icon name="LoaderCircle" size={13} className="animate-spin" />
                      : <Icon name="Trash2" size={13} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Форма добавления / редактирования */}
        {editCustom && (
          <div className="rounded-xl p-4 space-y-3" style={{ background: "var(--bg)", border: "1px solid var(--blue)", borderStyle: "dashed" }}>
            <p className="text-xs font-bold" style={{ color: "var(--navy)" }}>
              {editCustom.id ? "Редактировать тариф" : "Новый индивидуальный тариф"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Название услуги *</label>
                <input
                  value={editCustom.service_name}
                  onChange={e => setEditCustom(p => p && ({ ...p, service_name: e.target.value }))}
                  placeholder="Например: Арбитражное сопровождение"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)", color: "var(--navy)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Сумма вознаграждения, ₽ *</label>
                <input
                  type="number" min="0" step="100"
                  value={editCustom.amount}
                  onChange={e => setEditCustom(p => p && ({ ...p, amount: e.target.value }))}
                  placeholder="50000"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none font-mono"
                  style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)", color: "var(--navy)" }}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Комментарий</label>
              <input
                value={editCustom.note}
                onChange={e => setEditCustom(p => p && ({ ...p, note: e.target.value }))}
                placeholder="Дополнительные условия или описание"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)", color: "var(--navy)" }}
              />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setEditCustom(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium"
                style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)", color: "var(--text-muted)" }}>
                Отмена
              </button>
              <button
                onClick={handleSaveCustom}
                disabled={savingCustom}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ background: "var(--blue)", color: "#fff" }}>
                {savingCustom ? <Icon name="LoaderCircle" size={13} className="animate-spin" /> : <Icon name="Check" size={13} />}
                Сохранить
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}