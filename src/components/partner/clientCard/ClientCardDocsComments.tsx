import { useRef } from "react";
import Icon from "@/components/ui/icon";
import { DOC_CATEGORIES, fmtDate, fmtFileSize, type Doc, type Comment } from "../types";
import { Section } from "./clientCardShared";

interface Props {
  docs: Doc[];
  comments: Comment[];
  commentText: string;
  sendingComment: boolean;
  uploadCat: string;
  uploading: boolean;
  onCommentChange: (v: string) => void;
  onSendComment: () => void;
  onUploadCatChange: (v: string) => void;
  onFileSelect: (file: File) => void;
}

export default function ClientCardDocsComments({
  docs, comments, commentText, sendingComment,
  uploadCat, uploading,
  onCommentChange, onSendComment, onUploadCatChange, onFileSelect,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  return (
    <>
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
    </>
  );
}
