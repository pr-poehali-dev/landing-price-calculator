import Icon from "@/components/ui/icon";
import { fmtMoney } from "../types";
import { Section, type ClientService, type AvailableService } from "./clientCardShared";

interface Props {
  clientServices: ClientService[];
  allServices: AvailableService[];
  addingService: boolean;
  selectedServiceId: number | null;
  serviceDealAmount: string;
  savingService: boolean;
  removingServiceId: number | null;
  computedReward: number | null;
  selectedService: AvailableService | undefined;
  onAddingService: (v: boolean) => void;
  onSelectServiceId: (id: number | null) => void;
  onServiceDealAmountChange: (v: string) => void;
  onAddService: () => void;
  onRemoveService: (id: number) => void;
}

export default function ClientCardServices({
  clientServices, allServices, addingService, selectedServiceId,
  serviceDealAmount, savingService, removingServiceId,
  computedReward, selectedService,
  onAddingService, onSelectServiceId, onServiceDealAmountChange,
  onAddService, onRemoveService,
}: Props) {
  return (
    <Section title="Услуги по сделке" icon="Briefcase">
      {clientServices.length > 0 && (
        <div className="space-y-2 mb-3">
          {clientServices.map(cs => (
            <div key={cs.id} className="rounded-xl px-4 py-3 flex items-start justify-between gap-3"
              style={{ background: "var(--bg)", border: "1px solid var(--border-c)" }}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: "var(--navy)" }}>{cs.name}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{cs.category}</p>
                <div className="flex flex-wrap gap-3 mt-1.5">
                  {cs.deal_amount != null && (
                    <span className="text-xs" style={{ color: "var(--text)" }}>Сумма: <b>{fmtMoney(cs.deal_amount)}</b></span>
                  )}
                  {cs.rate_pct != null && cs.rate_pct > 0 && (
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>Ставка: {cs.rate_pct}%</span>
                  )}
                  {cs.reward_amount != null && cs.reward_amount > 0 && (
                    <span className="text-xs font-semibold" style={{ color: "var(--success)" }}>
                      Бонус: {fmtMoney(cs.reward_amount)}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => onRemoveService(cs.id)} disabled={removingServiceId === cs.id}
                className="flex-shrink-0 transition-opacity hover:opacity-70 mt-0.5"
                style={{ color: "#ef4444" }}>
                {removingServiceId === cs.id
                  ? <Icon name="LoaderCircle" size={14} className="animate-spin" />
                  : <Icon name="X" size={14} />}
              </button>
            </div>
          ))}
        </div>
      )}

      {addingService ? (
        <div className="rounded-xl px-4 py-4 space-y-3" style={{ background: "var(--bg)", border: "1px solid var(--border-c)" }}>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Выберите услугу</label>
            <select
              value={selectedServiceId || ""}
              onChange={e => { onSelectServiceId(Number(e.target.value)); onServiceDealAmountChange(""); }}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "#fff", border: "1px solid var(--border-c)", color: "var(--text)" }}>
              <option value="">— выберите —</option>
              {[...new Set(allServices.map(s => s.category))].map(cat => (
                <optgroup key={cat} label={cat}>
                  {allServices.filter(s => s.category === cat).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.rate_pct > 0 ? `(${s.rate_pct}%)` : ""} — {s.price_note || (s.base_price ? fmtMoney(s.base_price) : "по договорённости")}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {selectedService && (
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
                Сумма сделки {selectedService.base_price ? `(по умолчанию ${fmtMoney(selectedService.base_price)})` : ""}
              </label>
              <input type="number" min="0"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "#fff", border: "1px solid var(--border-c)", color: "var(--text)" }}
                placeholder={selectedService.base_price ? String(selectedService.base_price) : "0"}
                value={serviceDealAmount}
                onChange={e => onServiceDealAmountChange(e.target.value)} />
              {selectedService.rate_pct > 0 && (
                <p className="text-xs mt-1.5" style={{ color: "var(--success)" }}>
                  Бонус {selectedService.rate_pct}%: <b>{fmtMoney(computedReward)}</b>
                </p>
              )}
              {selectedService.rate_pct === 0 && (
                <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
                  Ставка для этой услуги не установлена
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button onClick={() => { onAddingService(false); onSelectServiceId(null); onServiceDealAmountChange(""); }}
              className="px-4 py-2 rounded-lg text-xs font-medium"
              style={{ background: "var(--bg-white)", color: "var(--text-muted)", border: "1px solid var(--border-c)" }}>
              Отмена
            </button>
            <button onClick={onAddService} disabled={!selectedServiceId || savingService}
              className="px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              style={{ background: "var(--blue)", color: "#fff", opacity: !selectedServiceId ? 0.5 : 1 }}>
              {savingService ? <Icon name="LoaderCircle" size={13} className="animate-spin" /> : <Icon name="Plus" size={13} />}
              Добавить
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => onAddingService(true)}
          className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          style={{ background: "var(--bg)", border: "1px dashed var(--border-c)", color: "var(--text-muted)" }}>
          <Icon name="Plus" size={14} />
          Добавить услугу
        </button>
      )}
    </Section>
  );
}
