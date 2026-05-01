import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";

const API_URL = "https://functions.poehali.dev/12e937a9-0e91-4d66-bb5d-c778c426b9ff";
const DADATA_TOKEN = import.meta.env.VITE_DADATA_API_KEY || "";

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

interface FieldError {
  name?: string;
  phone?: string;
  email?: string;
}

interface DadataSuggestion {
  value: string;
  data?: Record<string, unknown>;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const d = digits.startsWith("8") ? "7" + digits.slice(1) : digits.startsWith("7") ? digits : "7" + digits;
  const n = d.slice(0, 11);
  let result = "+7";
  if (n.length > 1) result += " (" + n.slice(1, 4);
  if (n.length >= 4) result += ") " + n.slice(4, 7);
  if (n.length >= 7) result += "-" + n.slice(7, 9);
  if (n.length >= 9) result += "-" + n.slice(9, 11);
  return result;
}

function validateName(v: string): string | undefined {
  if (!v.trim()) return "Введите имя";
  if (v.trim().length < 2) return "Имя слишком короткое";
  return undefined;
}

function validatePhone(v: string): string | undefined {
  const digits = v.replace(/\D/g, "");
  if (!digits) return "Введите телефон";
  if (digits.length < 11) return "Неполный номер телефона";
  return undefined;
}

function validateEmail(v: string): string | undefined {
  if (!v.trim()) return "Введите email";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return "Некорректный email";
  return undefined;
}

function useDadata(type: "fio" | "email", query: string, enabled: boolean) {
  const [suggestions, setSuggestions] = useState<DadataSuggestion[]>([]);

  useEffect(() => {
    if (!enabled || !DADATA_TOKEN || query.length < 2) {
      setSuggestions([]);
      return;
    }
    const url =
      type === "fio"
        ? "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fio"
        : "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/email";

    const timer = setTimeout(() => {
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${DADATA_TOKEN}`,
        },
        body: JSON.stringify({ query, count: 5 }),
      })
        .then((r) => r.json())
        .then((data) => setSuggestions(data.suggestions || []))
        .catch(() => setSuggestions([]));
    }, 250);

    return () => clearTimeout(timer);
  }, [query, type, enabled]);

  return { suggestions, clear: () => setSuggestions([]) };
}

interface SuggestDropdownProps {
  suggestions: DadataSuggestion[];
  onSelect: (v: string) => void;
}

function SuggestDropdown({ suggestions, onSelect }: SuggestDropdownProps) {
  if (!suggestions.length) return null;
  return (
    <ul
      className="absolute left-0 right-0 z-50 rounded-lg overflow-hidden text-sm"
      style={{
        background: "#fff",
        border: "1px solid var(--border-c)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
        top: "calc(100% + 4px)",
      }}
    >
      {suggestions.map((s, i) => (
        <li
          key={i}
          className="px-4 py-2.5 cursor-pointer transition-colors"
          style={{ color: "var(--text)", borderBottom: i < suggestions.length - 1 ? "1px solid var(--border-c)" : "none" }}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(s.value);
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#fff")}
        >
          {s.value}
        </li>
      ))}
    </ul>
  );
}

export default function DocumentModal({ open, onClose }: DocumentModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<FieldError>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [nameFocus, setNameFocus] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const nameSuggest = useDadata("fio", name, nameFocus);
  const emailSuggest = useDadata("email", email, emailFocus);

  const validate = useCallback((): FieldError => ({
    name: validateName(name),
    phone: validatePhone(phone),
    email: validateEmail(email),
  }), [name, phone, email]);

  const blurField = (field: string) => {
    setTouched((t) => ({ ...t, [field]: true }));
    const errs = validate();
    setErrors(errs);
  };

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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, phone: true, email: true });
    const errs = validate();
    setErrors(errs);

    if (errs.name || errs.phone || errs.email) {
      toast.error("Проверьте правильность заполнения полей");
      return;
    }
    if (!consent) {
      toast.error("Необходимо согласие на обработку персональных данных");
      return;
    }
    setLoading(true);
    setProgress(0);

    try {
      const body = JSON.stringify({ name, phone, email, message, files });

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
      setName(""); setPhone(""); setEmail(""); setMessage(""); setFiles([]);
      setErrors({}); setTouched({});
      onClose();
    } catch {
      toast.error("Ошибка отправки. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const inputBase =
    "w-full px-4 py-3 rounded text-sm outline-none transition-colors font-body";

  const inputStyle = (field: keyof FieldError) => ({
    background: "var(--bg)",
    border: `1px solid ${touched[field] && errors[field] ? "#ef4444" : "var(--border-c)"}`,
    color: "var(--text)",
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-md w-full p-0 border-0 flex flex-col"
        style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)", borderRadius: 8, border: "1px solid var(--border-c)", maxHeight: "90dvh" }}
      >
        <DialogHeader className="px-8 pt-8 pb-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-4 h-0.5 rounded" style={{ background: "var(--blue)" }} />
            <span
              className="font-body text-xs tracking-widest uppercase font-semibold"
              style={{ color: "var(--blue)" }}
            >
              Заявка
            </span>
          </div>
          <DialogTitle
            className="font-display text-xl tracking-wide"
            style={{ color: "var(--navy)" }}
          >
            Отправить документ
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-8 pb-8 pt-6 space-y-4 overflow-y-auto flex-1">

          {/* Name */}
          <div className="relative">
            <input
              className={inputBase}
              style={inputStyle("name")}
              placeholder="Ваше имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setNameFocus(true)}
              onBlur={() => { setNameFocus(false); blurField("name"); }}
              disabled={loading}
              autoComplete="off"
            />
            {nameFocus && <SuggestDropdown suggestions={nameSuggest.suggestions} onSelect={(v) => { setName(v); nameSuggest.clear(); }} />}
            {touched.name && errors.name && (
              <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#ef4444" }}>
                <Icon name="CircleAlert" size={12} />
                {errors.name}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <input
              className={inputBase}
              style={inputStyle("phone")}
              placeholder="+7 (___) ___-__-__"
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              onBlur={() => blurField("phone")}
              disabled={loading}
            />
            {touched.phone && errors.phone && (
              <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#ef4444" }}>
                <Icon name="CircleAlert" size={12} />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="relative">
            <input
              className={inputBase}
              style={inputStyle("email")}
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocus(true)}
              onBlur={() => { setEmailFocus(false); blurField("email"); }}
              disabled={loading}
              autoComplete="off"
            />
            {emailFocus && <SuggestDropdown suggestions={emailSuggest.suggestions} onSelect={(v) => { setEmail(v); emailSuggest.clear(); }} />}
            {touched.email && errors.email && (
              <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#ef4444" }}>
                <Icon name="CircleAlert" size={12} />
                {errors.email}
              </p>
            )}
          </div>

          {/* Message */}
          <textarea
            className={inputBase}
            style={{ background: "var(--bg)", border: "1px solid var(--border-c)", color: "var(--text)", resize: "none" }}
            placeholder="Опишите вашу ситуацию или вопрос"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
          />

          {/* File upload */}
          <div
            className="rounded cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 py-6"
            style={{
              border: "1px dashed var(--border-c)",
              background: "var(--bg)",
              pointerEvents: loading ? "none" : "auto",
            }}
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <Icon name="Upload" size={20} style={{ color: "var(--blue)" }} />
            <span className="text-xs font-body" style={{ color: "var(--text-muted)" }}>
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
                  style={{ background: "var(--bg)", color: "var(--text)" }}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Icon name="FileText" size={14} style={{ color: "var(--blue)", flexShrink: 0 }} />
                    <span className="truncate">{f.name}</span>
                    <span style={{ color: "var(--text-muted)", flexShrink: 0 }}>{formatSize(f.size)}</span>
                  </div>
                  {!loading && (
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      style={{ color: "var(--text-muted)" }}
                      className="transition-colors ml-2 flex-shrink-0"
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
              <div className="flex justify-between text-xs font-body" style={{ color: "var(--text-muted)" }}>
                <span>{progress < 100 ? "Загружаем файлы..." : "Обрабатываем..."}</span>
                <span>{progress < 100 ? `${progress}%` : ""}</span>
              </div>
              <div className="w-full rounded-full h-1" style={{ background: "var(--border-c)" }}>
                <div
                  className="h-1 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, background: "var(--blue)" }}
                />
              </div>
            </div>
          )}

          {/* Consent */}
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <div className="relative mt-0.5 flex-shrink-0">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="sr-only"
                disabled={loading}
              />
              <div
                className="w-4 h-4 rounded flex items-center justify-center transition-all"
                style={{
                  background: consent ? "var(--blue)" : "var(--bg)",
                  border: `1px solid ${consent ? "var(--blue)" : "var(--border-c)"}`,
                }}
              >
                {consent && <Icon name="Check" size={11} style={{ color: "#fff" }} />}
              </div>
            </div>
            <span className="text-xs font-body leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Я соглашаюсь на обработку персональных данных в соответствии с{" "}
              <a href="/privacy" target="_blank" className="underline" style={{ color: "var(--blue)" }}>
                Политикой конфиденциальности
              </a>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full py-3 text-xs font-semibold transition-opacity"
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Отправляем..." : "Отправить заявку"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
