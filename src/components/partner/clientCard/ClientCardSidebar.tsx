import { DEAL_STATUS_META, fmtDate, type StatusEntry } from "../types";
import { Section } from "./clientCardShared";

interface Props {
  statuses: StatusEntry[];
}

export default function ClientCardSidebar({ statuses }: Props) {
  return (
    <div className="space-y-5">
      <Section title="История статусов" icon="Clock">
        {statuses.length === 0 && <p className="text-sm" style={{ color: "var(--text-muted)" }}>Нет данных</p>}
        <div className="space-y-3">
          {statuses.map((s, i) => {
            const meta = DEAL_STATUS_META[s.status];
            return (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5" style={{ background: meta?.color || "#ccc" }} />
                  {i < statuses.length - 1 && <div className="w-px flex-1 mt-1" style={{ background: "var(--border-c)" }} />}
                </div>
                <div className="pb-3 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: meta?.color || "var(--text-muted)" }}>
                    {meta?.label || s.status}
                  </p>
                  {s.comment && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{s.comment}</p>}
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {fmtDate(s.created_at)}{s.changed_by ? ` · ${s.changed_by}` : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
