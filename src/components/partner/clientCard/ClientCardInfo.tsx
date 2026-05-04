import { useRef } from "react";
import Icon from "@/components/ui/icon";
import { DOC_CATEGORIES, fmtDate, fmtMoney, fmtFileSize, type ClientDetail, type Doc, type Comment } from "../types";
import { Section, Row, type ClientService, type AvailableService } from "./clientCardShared";

interface Props {
  client: ClientDetail;
  docs: Doc[];
  comments: Comment[];
  commentText: string;
  sendingComment: boolean;
  uploadCat: string;
  uploading: boolean;
  ddLoading: boolean;
  ddData: Record<string, unknown> | null;
  clientServices: ClientService[];
  allServices: AvailableService[];
  addingService: boolean;
  selectedServiceId: number | null;
  serviceDealAmount: string;
  savingService: boolean;
  removingServiceId: number | null;
  computedReward: number | null;
  selectedService: AvailableService | undefined;
  onCommentChange: (v: string) => void;
  onSendComment: () => void;
  onUploadCatChange: (v: string) => void;
  onFileSelect: (file: File) => void;
  onAddingService: (v: boolean) => void;
  onSelectServiceId: (id: number | null) => void;
  onServiceDealAmountChange: (v: string) => void;
  onAddService: () => void;
  onRemoveService: (id: number) => void;
}

export default function ClientCardInfo({
  client, docs, comments, commentText, sendingComment,
  uploadCat, uploading, ddLoading, ddData,
  clientServices, allServices, addingService, selectedServiceId,
  serviceDealAmount, savingService, removingServiceId,
  computedReward, selectedService,
  onCommentChange, onSendComment, onUploadCatChange, onFileSelect,
  onAddingService, onSelectServiceId, onServiceDealAmountChange,
  onAddService, onRemoveService,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  return (
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

      {/* Услуги */}
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
        <div className="mb-4 flex flex-col sm:flex-row gap-2">
          <select value={uploadCat} onChange={e => onUploadCatChange(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm outline-none w-full sm:w-auto"
            style={{ background: "var(--bg)", border: "1px solid var(--border-c)", color: "var(--text)" }}>
            {Object.entries(DOC_CATEGORIES).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <input ref={fileRef} type="file" className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.docx,.doc,.xlsx,.xls"
            onChange={e => e.target.files?.[0] && onFileSelect(e.target.files[0])} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="flex-1 border-2 border-dashed rounded-lg px-4 py-3 text-sm flex items-center justify-center gap-2 transition-all"
            style={{ borderColor: "var(--border-c)", color: "var(--text-muted)" }}
            onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
            {uploading
              ? <><Icon name="LoaderCircle" size={16} className="animate-spin" /> Загрузка...</>
              : <><Icon name="Upload" size={16} /> <span className="hidden sm:inline">Загрузить файл или перетащить сюда</span><span className="sm:hidden">Загрузить файл</span></>}
          </button>
        </div>
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
            value={commentText} onChange={e => onCommentChange(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && onSendComment()} />
          <button onClick={onSendComment} disabled={sendingComment || !commentText.trim()}
            className="px-3 py-2.5 rounded-lg transition-all flex-shrink-0"
            style={{ background: "var(--blue)", color: "#fff", opacity: !commentText.trim() ? 0.5 : 1 }}>
            <Icon name={sendingComment ? "LoaderCircle" : "Send"} size={16}
              className={sendingComment ? "animate-spin" : ""} />
          </button>
        </div>
      </Section>
    </div>
  );
}
