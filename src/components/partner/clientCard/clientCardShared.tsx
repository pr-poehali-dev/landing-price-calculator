import Icon from "@/components/ui/icon";

export interface ClientService {
  id: number;
  service_id: number;
  name: string;
  category: string;
  deal_amount: number | null;
  reward_amount: number | null;
  rate_pct: number | null;
  note: string | null;
}

export interface AvailableService {
  id: number;
  category: string;
  name: string;
  base_price: number | null;
  price_note: string | null;
  rate_pct: number;
}

export function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)" }}>
      <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border-c)" }}>
        <Icon name={icon as "Info"} size={15} style={{ color: "var(--blue)" }} />
        <h3 className="text-sm font-bold" style={{ color: "var(--navy)" }}>{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="py-2" style={{ borderBottom: "1px solid var(--border-c)" }}>
      <span className="block text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>{label}</span>
      <span className="text-sm font-medium" style={{ color: "var(--navy)" }}>{value}</span>
    </div>
  );
}
