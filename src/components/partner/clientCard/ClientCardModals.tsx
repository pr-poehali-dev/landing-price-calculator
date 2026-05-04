import Icon from "@/components/ui/icon";
import { DEAL_STATUS_META, type DealStatus } from "../types";

interface StatusModalProps {
  newStatus: DealStatus;
  statusComment: string;
  settingStatus: boolean;
  onStatusChange: (s: DealStatus) => void;
  onCommentChange: (v: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export function StatusModal({ newStatus, statusComment, settingStatus, onStatusChange, onCommentChange, onSave, onClose }: StatusModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: "#fff", border: "1px solid var(--border-c)" }}>
        <h3 className="font-bold text-lg mb-4" style={{ color: "var(--navy)" }}>Изменить статус</h3>
        <div className="space-y-2 mb-4">
          {(Object.entries(DEAL_STATUS_META) as [DealStatus, typeof DEAL_STATUS_META[DealStatus]][]).map(([key, meta]) => (
            <label key={key} className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-all"
              style={{ border: `2px solid ${newStatus === key ? meta.color : "var(--border-c)"}`, background: newStatus === key ? meta.bg : "var(--bg)" }}>
              <input type="radio" name="new_status" value={key} checked={newStatus === key}
                onChange={() => onStatusChange(key)} className="hidden" />
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: meta.color }} />
              <span className="text-sm font-medium" style={{ color: "var(--navy)" }}>{meta.label}</span>
            </label>
          ))}
        </div>
        <textarea className="w-full px-4 py-3 rounded-lg text-sm outline-none mb-4"
          style={{ background: "var(--bg)", border: "1px solid var(--border-c)", color: "var(--text)", resize: "none" }}
          rows={2} placeholder="Комментарий (необязательно)"
          value={statusComment} onChange={e => onCommentChange(e.target.value)} />
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border-c)" }}>
            Отмена
          </button>
          <button onClick={onSave} disabled={settingStatus}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
            style={{ background: "var(--blue)", color: "#fff" }}>
            {settingStatus ? <Icon name="LoaderCircle" size={16} className="animate-spin" /> : null}
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

interface DeleteModalProps {
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteModal({ deleting, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background: "#fff", border: "1px solid var(--border-c)" }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(239,68,68,0.1)" }}>
          <Icon name="Trash2" size={22} style={{ color: "#ef4444" }} />
        </div>
        <h3 className="font-bold text-center mb-2" style={{ color: "var(--navy)" }}>Удалить клиента?</h3>
        <p className="text-sm text-center mb-5" style={{ color: "var(--text-muted)" }}>
          Будут удалены все данные, документы и история переписки. Отменить нельзя.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border-c)" }}>
            Отмена
          </button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            style={{ background: "#ef4444", color: "#fff" }}>
            {deleting ? <Icon name="LoaderCircle" size={15} className="animate-spin" /> : <Icon name="Trash2" size={15} />}
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}
