import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";

const API_URL = "https://functions.poehali.dev/12e937a9-0e91-4d66-bb5d-c778c426b9ff";

interface FileItem {
  name: string;
  type: string;
  data: string;
  size: number;
}

interface DocumentModalProps {
  open: boolean;
  onClose: () => void;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

export default function DocumentModal({ open, onClose }: DocumentModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (selected: FileList | null) => {
    if (!selected) return;
    Array.from(selected).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        setFiles((prev) => [
          ...prev,
          { name: file.name, type: file.type, data: base64, size: file.size },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (i: number) =>
    setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email) {
      toast.error("Заполните все поля");
      return;
    }
    setLoading(true);
    setProgress(0);

    try {
      const body = JSON.stringify({ name, phone, email, files });
      const totalBytes = new Blob([body]).size;

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", API_URL);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 90));
          }
        };

        xhr.onload = () => {
          setProgress(100);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(xhr.responseText));
          }
        };

        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(body);
      });

      toast.success("Заявка отправлена! Мы свяжемся с вами в ближайшее время.");
      setName(""); setPhone(""); setEmail(""); setFiles([]);
      onClose();
    } catch {
      toast.error("Ошибка отправки. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded text-sm outline-none transition-colors font-body";
  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#fff",
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-md w-full p-0 overflow-hidden border-0"
        style={{ background: "var(--navy)", borderRadius: 4 }}
      >
        <DialogHeader className="px-8 pt-8 pb-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-4 h-px" style={{ background: "var(--red)" }} />
            <span
              className="font-display text-xs tracking-widest uppercase"
              style={{ color: "var(--red)" }}
            >
              Заявка
            </span>
          </div>
          <DialogTitle
            className="font-display text-xl tracking-wide"
            style={{ color: "#fff" }}
          >
            Отправить документ
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-8 pb-8 pt-6 space-y-4">
          <input
            className={inputClass}
            style={inputStyle}
            placeholder="Ваше имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          <input
            className={inputClass}
            style={inputStyle}
            placeholder="Телефон"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
          />
          <input
            className={inputClass}
            style={inputStyle}
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <div
            className="rounded cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 py-6"
            style={{
              border: "1px dashed rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.02)",
              pointerEvents: loading ? "none" : "auto",
            }}
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <Icon name="Upload" size={20} style={{ color: "var(--red)" }} />
            <span className="text-xs font-body" style={{ color: "rgba(255,255,255,0.4)" }}>
              Нажмите или перетащите файлы
            </span>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 rounded text-xs font-body"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Icon name="FileText" size={14} style={{ color: "var(--red)", flexShrink: 0 }} />
                    <span className="truncate">{f.name}</span>
                    <span style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>
                      {formatSize(f.size)}
                    </span>
                  </div>
                  {!loading && (
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      style={{ color: "rgba(255,255,255,0.3)" }}
                      className="hover:text-white transition-colors ml-2 flex-shrink-0"
                    >
                      <Icon name="X" size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-body" style={{ color: "rgba(255,255,255,0.4)" }}>
                <span>{progress < 100 ? "Загружаем файлы..." : "Обрабатываем..."}</span>
                <span>{progress < 100 ? `${progress}%` : ""}</span>
              </div>
              <div
                className="w-full rounded-full overflow-hidden"
                style={{ height: 3, background: "rgba(255,255,255,0.08)" }}
              >
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    background: "var(--red)",
                  }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full py-3 text-sm disabled:opacity-50"
          >
            {loading ? "Отправляем..." : "Отправить заявку"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
