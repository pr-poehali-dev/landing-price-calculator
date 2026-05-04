import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";

import {
  FileItem, FieldError, InnInfo,
  formatPhone, validateName, validatePhone, validateEmail, validateInn,
  INPUT_BASE,
} from "./modal/types";
import { useDadata } from "./modal/useDadata";
import SuggestDropdown from "./modal/SuggestDropdown";
import InnField from "./modal/InnField";
import FileUpload from "./modal/FileUpload";

const API_URL = "https://functions.poehali.dev/12e937a9-0e91-4d66-bb5d-c778c426b9ff";

interface DocumentModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DocumentModal({ open, onClose }: DocumentModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [inn, setInn] = useState("");
  const [innInfo, setInnInfo] = useState<InnInfo | null>(null);
  const [innChecking, setInnChecking] = useState(false);
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<FieldError>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [nameFocus, setNameFocus] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);

  const nameSuggest = useDadata("fio", name, nameFocus);
  const emailSuggest = useDadata("email", email, emailFocus);

  const validate = useCallback((): FieldError => ({
    name: validateName(name),
    phone: validatePhone(phone),
    email: validateEmail(email),
    inn: validateInn(inn),
  }), [name, phone, email, inn]);

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
        setFiles((prev) => [...prev, { name: file.name, type: file.type, data: base64, size: file.size }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, phone: true, email: true, inn: true });
    const errs = validate();
    setErrors(errs);

    if (errs.name || errs.phone || errs.email || errs.inn) {
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
      const body = JSON.stringify({ name, phone, email, inn, innInfo, message, files });

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", API_URL);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 90));
        };
        xhr.onload = () => {
          setProgress(100);
          if (xhr.status >= 200 && xhr.status < 300) { resolve(); } else { reject(new Error(xhr.responseText)); }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(body);
      });

      toast.success("Заявка отправлена! Мы свяжемся с вами в ближайшее время.");
      setName(""); setPhone(""); setEmail(""); setInn(""); setInnInfo(null);
      setMessage(""); setFiles([]); setErrors({}); setTouched({});
      onClose();
    } catch {
      toast.error("Ошибка отправки. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

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
            <span className="font-body text-xs tracking-widest uppercase font-semibold" style={{ color: "var(--blue)" }}>
              Заявка
            </span>
          </div>
          <DialogTitle className="font-display text-xl tracking-wide" style={{ color: "var(--navy)" }}>
            Отправить документ
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-8 pb-8 pt-5 space-y-3 overflow-y-auto flex-1">

          {/* Name */}
          <div className="relative">
            <input
              style={inputStyle("name")}
              placeholder="Введите имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={(e) => { setNameFocus(true); e.currentTarget.style.borderColor = "#D4AF37"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212,175,55,0.12)"; }}
              onBlur={(e) => { setTimeout(() => setNameFocus(false), 150); blurField("name"); e.currentTarget.style.borderColor = touched.name && errors.name ? "#ef4444" : "rgba(212,175,55,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
              disabled={loading}
              autoComplete="off"
            />
            {nameFocus && (
              <SuggestDropdown
                suggestions={nameSuggest.suggestions}
                onSelect={(v) => { setName(v); nameSuggest.clear(); setNameFocus(false); }}
              />
            )}
            {touched.name && errors.name && (
              <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#ef4444" }}>
                <Icon name="CircleAlert" size={12} />{errors.name}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <input
              style={inputStyle("phone")}
              placeholder="+7 (___) ___-__-__"
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#D4AF37"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212,175,55,0.12)"; }}
              onBlur={(e) => { blurField("phone"); e.currentTarget.style.borderColor = touched.phone && errors.phone ? "#ef4444" : "rgba(212,175,55,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
              disabled={loading}
            />
            {touched.phone && errors.phone && (
              <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#ef4444" }}>
                <Icon name="CircleAlert" size={12} />{errors.phone}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="relative">
            <input
              style={inputStyle("email")}
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={(e) => { setEmailFocus(true); e.currentTarget.style.borderColor = "#D4AF37"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212,175,55,0.12)"; }}
              onBlur={(e) => { setTimeout(() => setEmailFocus(false), 150); blurField("email"); e.currentTarget.style.borderColor = touched.email && errors.email ? "#ef4444" : "rgba(212,175,55,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
              disabled={loading}
              autoComplete="off"
            />
            {emailFocus && (
              <SuggestDropdown
                suggestions={emailSuggest.suggestions}
                onSelect={(v) => { setEmail(v); emailSuggest.clear(); setEmailFocus(false); }}
              />
            )}
            {touched.email && errors.email && (
              <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#ef4444" }}>
                <Icon name="CircleAlert" size={12} />{errors.email}
              </p>
            )}
          </div>

          {/* INN */}
          <InnField
            inn={inn}
            innInfo={innInfo}
            innChecking={innChecking}
            touched={touched}
            errors={errors}
            loading={loading}
            setInn={setInn}
            setInnInfo={setInnInfo}
            setInnChecking={setInnChecking}
            setErrors={setErrors}
            onBlur={() => blurField("inn")}
          />

          {/* Message */}
          <textarea
            className={INPUT_BASE}
            style={{ background: "var(--bg)", border: "1px solid var(--border-c)", color: "var(--text)", resize: "none" }}
            placeholder="Опишите вашу ситуацию или вопрос"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
          />

          {/* File upload */}
          <FileUpload
            files={files}
            loading={loading}
            progress={progress}
            onFiles={handleFiles}
            onRemove={removeFile}
          />

          {/* Consent */}
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <div className="relative mt-0.5 flex-shrink-0">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="sr-only" disabled={loading} />
              <div
                className="w-4 h-4 rounded flex items-center justify-center transition-all"
                style={{ background: consent ? "var(--blue)" : "var(--bg)", border: `1px solid ${consent ? "var(--blue)" : "var(--border-c)"}` }}
              >
                {consent && <Icon name="Check" size={11} style={{ color: "#fff" }} />}
              </div>
            </div>
            <span className="text-xs font-body leading-relaxed" style={{ color: "#ffffff" }}>
              Я соглашаюсь на обработку персональных данных в соответствии с{" "}
              <a href="/privacy" target="_blank" className="underline" style={{ color: "var(--blue)" }}>Политикой конфиденциальности</a>
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