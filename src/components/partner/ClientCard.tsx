import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import {
  apiPartner, DEAL_STATUS_META, DOC_CATEGORIES, fmtDate, fmtMoney, fmtFileSize,
  DADATA_TOKEN,
  type ClientDetail, type StatusEntry, type Doc, type Comment, type DealStatus,
} from "./types";

const FIND_URL = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party";

interface Props {
  sessionId: string;
  clientId: number;
  isAdmin: boolean;
  onBack: () => void;
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
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

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="py-2" style={{ borderBottom: "1px solid var(--border-c)" }}>
      <span className="block text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>{label}</span>
      <span className="text-sm font-medium" style={{ color: "var(--navy)" }}>{value}</span>
    </div>
  );
}

export default function ClientCard({ sessionId, clientId, isAdmin, onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [statuses, setStatuses] = useState<StatusEntry[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  const [commentText, setCommentText] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  const [uploadCat, setUploadCat] = useState("other");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<DealStatus>("new");
  const [statusComment, setStatusComment] = useState("");
  const [settingStatus, setSettingStatus] = useState(false);

  const [ddLoading, setDdLoading] = useState(false);
  const [ddData, setDdData] = useState<Record<string, unknown> | null>(null);

  const load = async () => {
    const data = await apiPartner(sessionId, { action: "get_client", client_id: clientId });
    if (data.client) {
      setClient(data.client);
      setStatuses(data.statuses || []);
      setDocs(data.docs || []);
      setComments(data.comments || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [clientId]);

  // Загрузка DaData по ИНН клиента
  useEffect(() => {
    if (!client?.inn || !DADATA_TOKEN) return;
    setDdLoading(true);
    fetch(FIND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Token ${DADATA_TOKEN}` },
      body: JSON.stringify({ query: client.inn, count: 1 }),
    }).then(r => r.json()).then(d => {
      if (d.suggestions?.[0]) setDdData(d.suggestions[0].data);
    }).finally(() => setDdLoading(false));
  }, [client?.inn]);

  const sendComment = async () => {
    if (!commentText.trim()) return;
    setSendingComment(true);
    const data = await apiPartner(sessionId, { action: "add_comment", client_id: clientId, message: commentText });
    if (data.comment) {
      setComments(prev => [...prev, data.comment]);
      setCommentText("");
    }
    setSendingComment(false);
  };

  const handleFile = async (file: File) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const b64 = (reader.result as string).split(",")[1];
      const data = await apiPartner(sessionId, {
        action: "upload_doc", client_id: clientId,
        file_name: file.name, file_b64: b64, category: uploadCat,
      });
      if (data.doc) setDocs(prev => [data.doc, ...prev]);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const changeStatus = async () => {
    setSettingStatus(true);
    await apiPartner(sessionId, { action: "set_client_status", client_id: clientId, status: newStatus, comment: statusComment });
    setStatusModal(false);
    setStatusComment("");
    await load();
    setSettingStatus(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Icon name="LoaderCircle" size={32} className="animate-spin" style={{ color: "var(--blue)" }} />
    </div>
  );
  if (!client) return <div className="text-center py-12 text-sm" style={{ color: "var(--text-muted)" }}>Клиент не найден</div>;

  const currentStatusMeta = DEAL_STATUS_META[client.current_status];

  return (
    <div>
      {/* Back button + header */}
      <div className="mb-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm mb-3 transition-opacity hover:opacity-70"
          style={{ color: "var(--text-muted)" }}>
          <Icon name="ArrowLeft" size={16} /> Назад к списку
        </button>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl md:text-2xl font-bold leading-snug" style={{ fontFamily: "Playfair Display, serif", color: "var(--navy)" }}>
              {client.full_name}
            </h2>
            {client.inn && <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>ИНН: {client.inn}</p>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: currentStatusMeta.bg, color: currentStatusMeta.color }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: currentStatusMeta.color }} />
              {currentStatusMeta.label}
            </span>
            {isAdmin && (
              <button onClick={() => { setNewStatus(client.current_status); setStatusModal(true); }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{ background: "var(--blue)", color: "#fff" }}>
                Статус
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">

          {/* Основная информация */}
          <Section title="Основная информация" icon="User">
            <Row label="ФИО / Наименование" value={client.full_name} />
            <Row label="ИНН" value={client.inn} />
            <Row label="Телефон" value={client.phone} />
            <Row label="Email" value={client.email} />
            <Row label="Контактное лицо" value={client.contact_person} />
            <Row label="Дата добавления" value={fmtDate(client.created_at)} />
            <Row label="Партнёр" value={client.partner_name} />
            {client.notes && (
              <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border-c)" }}>
                <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Примечание</p>
                <p className="text-sm" style={{ color: "var(--text)" }}>{client.notes}</p>
              </div>
            )}
          </Section>

          {/* DaData: данные юр. лица */}
          {client.inn && (
            <Section title="Данные организации (ФНС)" icon="Building">
              {ddLoading && <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                <Icon name="LoaderCircle" size={14} className="animate-spin" /> Загрузка данных ФНС...
              </div>}
              {ddData && !ddLoading && (
                <div>
                  <Row label="Полное наименование" value={(ddData.name as Record<string, string>)?.full_with_opf} />
                  <Row label="ОГРН" value={ddData.ogrn as string} />
                  <Row label="Статус" value={ddData.state && (ddData.state as Record<string, string>).status === "ACTIVE" ? "Действующая" : "Недействующая"} />
                  <Row label="Адрес" value={(ddData.address as Record<string, string>)?.value} />
                  <Row label="Руководитель" value={(ddData.management as Record<string, string>)?.name} />
                  <Row label="Основной ОКВЭД" value={`${ddData.okved || "—"} ${ddData.okved_type || ""}`} />
                  {ddData.finance && (
                    <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border-c)" }}>
                      <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Финансы ({(ddData.finance as Record<string, number>).year})</p>
                      <div className="grid grid-cols-2 gap-2">
                        {(ddData.finance as Record<string, number>).revenue && (
                          <div className="rounded-lg px-3 py-2" style={{ background: "var(--success-dim)" }}>
                            <p className="text-xs" style={{ color: "var(--success)" }}>Выручка</p>
                            <p className="text-sm font-bold" style={{ color: "var(--success)" }}>{fmtMoney((ddData.finance as Record<string, number>).revenue)}</p>
                          </div>
                        )}
                        {(ddData.finance as Record<string, number>).expense && (
                          <div className="rounded-lg px-3 py-2" style={{ background: "rgba(239,68,68,0.06)" }}>
                            <p className="text-xs" style={{ color: "#ef4444" }}>Расходы</p>
                            <p className="text-sm font-bold" style={{ color: "#ef4444" }}>{fmtMoney((ddData.finance as Record<string, number>).expense)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {!ddData && !ddLoading && (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Данные не найдены в ФНС</p>
              )}
            </Section>
          )}

          {/* Финансы сделки */}
          <Section title="Финансовая информация" icon="DollarSign">
            <Row label="Сумма сделки" value={fmtMoney(client.deal_amount)} />
            <Row label="Вознаграждение" value={fmtMoney(client.partner_reward)} />
            <div className="py-2">
              <span className="block text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Выплата</span>
              <span className="text-sm font-semibold"
                style={{ color: client.reward_paid ? "var(--success)" : "#d97706" }}>
                {client.reward_paid ? "Выплачено" : "Ожидается"}
              </span>
            </div>
          </Section>

          {/* Документы */}
          <Section title="Документы" icon="Paperclip">
            {/* Upload zone */}
            <div className="mb-4 flex flex-col sm:flex-row gap-2">
              <select value={uploadCat} onChange={e => setUploadCat(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm outline-none w-full sm:w-auto"
                style={{ background: "var(--bg)", border: "1px solid var(--border-c)", color: "var(--text)" }}>
                {Object.entries(DOC_CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <input ref={fileRef} type="file" className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.docx,.doc,.xlsx,.xls"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="flex-1 border-2 border-dashed rounded-lg px-4 py-3 text-sm flex items-center justify-center gap-2 transition-all"
                style={{ borderColor: "var(--border-c)", color: "var(--text-muted)" }}
                onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
                {uploading
                  ? <><Icon name="LoaderCircle" size={16} className="animate-spin" /> Загрузка...</>
                  : <><Icon name="Upload" size={16} /> <span className="hidden sm:inline">Загрузить файл или перетащить сюда</span><span className="sm:hidden">Загрузить файл</span></>}
              </button>
            </div>

            {/* Doc list */}
            {docs.length === 0 && <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>Документов нет</p>}
            <div className="space-y-2">
              {docs.map(doc => (
                <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
                  style={{ background: "var(--bg)", border: "1px solid var(--border-c)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(37,99,235,0.3)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-c)")}>
                  <Icon name="FileText" size={18} style={{ color: "var(--blue)" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--navy)" }}>{doc.file_name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {DOC_CATEGORIES[doc.category] || doc.category} · {fmtDate(doc.created_at)}{doc.file_size ? ` · ${fmtFileSize(doc.file_size)}` : ""}
                    </p>
                  </div>
                  <Icon name="ExternalLink" size={14} style={{ color: "var(--text-muted)" }} />
                </a>
              ))}
            </div>
          </Section>

          {/* Чат / Комментарии */}
          <Section title="История взаимодействия" icon="MessageSquare">
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {comments.length === 0 && <p className="text-sm" style={{ color: "var(--text-muted)" }}>Комментариев нет</p>}
              {comments.map(c => (
                <div key={c.id} className={`flex gap-2 ${c.author_role === "admin" ? "flex-row-reverse" : ""}`}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5"
                    style={{ background: c.author_role === "admin" ? "var(--blue-dim)" : "var(--bg)", color: c.author_role === "admin" ? "var(--blue)" : "var(--text-muted)" }}>
                    {(c.author || c.author_role || "?")[0].toUpperCase()}
                  </div>
                  <div className={`max-w-[75%] ${c.author_role === "admin" ? "items-end" : "items-start"} flex flex-col`}>
                    <div className="rounded-2xl px-3 py-2 text-sm"
                      style={{ background: c.author_role === "admin" ? "var(--blue)" : "var(--bg)", color: c.author_role === "admin" ? "#fff" : "var(--text)" }}>
                      {c.message}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {c.author || c.author_role} · {fmtDate(c.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="flex-1 px-3 py-2.5 rounded-lg text-sm outline-none min-w-0"
                style={{ background: "var(--bg)", border: "1px solid var(--border-c)", color: "var(--text)" }}
                placeholder="Комментарий..."
                value={commentText} onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendComment()} />
              <button onClick={sendComment} disabled={sendingComment || !commentText.trim()}
                className="px-3 py-2.5 rounded-lg transition-all flex-shrink-0"
                style={{ background: "var(--blue)", color: "#fff", opacity: !commentText.trim() ? 0.5 : 1 }}>
                <Icon name={sendingComment ? "LoaderCircle" : "Send"} size={16}
                  className={sendingComment ? "animate-spin" : ""} />
              </button>
            </div>
          </Section>
        </div>

        {/* Right column: статус + история */}
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
      </div>

      {/* Status change modal (admin) */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: "#fff", border: "1px solid var(--border-c)" }}>
            <h3 className="font-bold text-lg mb-4" style={{ color: "var(--navy)" }}>Изменить статус</h3>
            <div className="space-y-2 mb-4">
              {(Object.entries(DEAL_STATUS_META) as [DealStatus, typeof DEAL_STATUS_META[DealStatus]][]).map(([key, meta]) => (
                <label key={key} className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-all"
                  style={{ border: `2px solid ${newStatus === key ? meta.color : "var(--border-c)"}`, background: newStatus === key ? meta.bg : "var(--bg)" }}>
                  <input type="radio" name="new_status" value={key} checked={newStatus === key}
                    onChange={() => setNewStatus(key)} className="hidden" />
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: meta.color }} />
                  <span className="text-sm font-medium" style={{ color: "var(--navy)" }}>{meta.label}</span>
                </label>
              ))}
            </div>
            <textarea className="w-full px-4 py-3 rounded-lg text-sm outline-none mb-4"
              style={{ background: "var(--bg)", border: "1px solid var(--border-c)", color: "var(--text)", resize: "none" }}
              rows={2} placeholder="Комментарий (необязательно)"
              value={statusComment} onChange={e => setStatusComment(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setStatusModal(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold"
                style={{ background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border-c)" }}>
                Отмена
              </button>
              <button onClick={changeStatus} disabled={settingStatus}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                style={{ background: "var(--blue)", color: "#fff" }}>
                {settingStatus ? <Icon name="LoaderCircle" size={16} className="animate-spin" /> : null}
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}