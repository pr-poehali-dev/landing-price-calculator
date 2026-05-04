import { useState, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";

import {
  FileItem, FieldError, InnInfo,
  formatPhone, validateName, validatePhone, validateEmail, validateInn,
} from "./modal/types";
import { useDadata } from "./modal/useDadata";
import SuggestDropdown from "./modal/SuggestDropdown";
import InnField from "./modal/InnField";
import FileUpload from "./modal/FileUpload";

const API_URL = "https://functions.poehali.dev/12e937a9-0e91-4d66-bb5d-c778c426b9ff";

const I: React.CSSProperties = {
  width: "100%",
  background: "#0F172A",
  color: "#f1f5f9",
  border: "1px solid rgba(212,175,55,0.18)",
  borderRadius: 10,
  padding: "13px 16px",
  fontSize: 14,
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

function iErr(has: boolean): React.CSSProperties {
  return { ...I, border: `1px solid ${has ? "#ef4444" : "rgba(212,175,55,0.18)"}`, boxShadow: has ? "0 0 0 2px rgba(239,68,68,0.12)" : "none" };
}

function onFocusStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "#D4AF37";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212,175,55,0.13)";
}

function onBlurStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>, hasErr = false) {
  e.currentTarget.style.borderColor = hasErr ? "#ef4444" : "rgba(212,175,55,0.18)";
  e.currentTarget.style.boxShadow = hasErr ? "0 0 0 2px rgba(239,68,68,0.12)" : "none";
}

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
    setErrors(validate());
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
        xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 90)); };
        xhr.onload = () => { setProgress(100); if (xhr.status < 300) { resolve(); } else { reject(new Error(xhr.responseText)); } };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(body);
      });
      toast.success("Заявка отправлена! Мы свяжемся с вами в ближайшее время.");
      setName(""); setPhone(""); setEmail(""); setInn(""); setInnInfo(null);
      setMessage(""); setFiles([]); setErrors({}); setTouched({}); setConsent(false);
      onClose();
    } catch {
      toast.error("Ошибка отправки. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-lg w-full p-0 border-0 flex flex-col"
        style={{
          background: "linear-gradient(160deg, #0d1526 0%, #0B0F1A 100%)",
          borderRadius: 20,
          border: "1px solid rgba(212,175,55,0.18)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.8), 0 0 60px rgba(212,175,55,0.04)",
          maxHeight: "92dvh",
        }}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-5" style={{ borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
          <div className="flex items-center gap-2.5 mb-3">
            <div style={{ width: 28, height: 1.5, background: "linear-gradient(90deg,#D4AF37,transparent)", borderRadius: 2 }} />
            <span style={{ color: "#D4AF37", fontSize: 10, letterSpacing: "0.22em", fontWeight: 600, textTransform: "uppercase" }}>
              Заявка
            </span>
          </div>
          <h2 style={{ color: "#ffffff", fontSize: 22, fontWeight: 700, fontFamily: "Playfair Display, serif", letterSpacing: "-0.01em", margin: 0 }}>
            Отправить документ
          </h2>
          <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13, marginTop: 6 }}>
            Загрузите материалы — оценим задачу и предложим решение
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 pt-5 overflow-y-auto flex-1" style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Name */}
          <div className="relative">
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(212,175,55,0.5)", pointerEvents: "none" }}>
                <Icon name="User" size={15} />
              </span>
              <input
                style={{ ...iErr(!!(touched.name && errors.name)), paddingLeft: 40 }}
                placeholder="Ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={(e) => { setNameFocus(true); onFocusStyle(e); }}
                onBlur={(e) => { setTimeout(() => setNameFocus(false), 150); blurField("name"); onBlurStyle(e, !!(touched.name && errors.name)); }}
                disabled={loading}
                autoComplete="off"
              />
            </div>
            {nameFocus && <SuggestDropdown suggestions={nameSuggest.suggestions} onSelect={(v) => { setName(v); nameSuggest.clear(); setNameFocus(false); }} />}
            {touched.name && errors.name && <p style={{ color: "#ef4444", fontSize: 11, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}><Icon name="CircleAlert" size={11} />{errors.name}</p>}
          </div>

          {/* Phone */}
          <div>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(212,175,55,0.5)", pointerEvents: "none" }}>
                <Icon name="Phone" size={15} />
              </span>
              <input
                style={{ ...iErr(!!(touched.phone && errors.phone)), paddingLeft: 40 }}
                placeholder="+7 (___) ___-__-__"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                onFocus={onFocusStyle}
                onBlur={(e) => { blurField("phone"); onBlurStyle(e, !!(touched.phone && errors.phone)); }}
                disabled={loading}
              />
            </div>
            {touched.phone && errors.phone && <p style={{ color: "#ef4444", fontSize: 11, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}><Icon name="CircleAlert" size={11} />{errors.phone}</p>}
          </div>

          {/* Email */}
          <div className="relative">
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(212,175,55,0.5)", pointerEvents: "none" }}>
                <Icon name="Mail" size={15} />
              </span>
              <input
                style={{ ...iErr(!!(touched.email && errors.email)), paddingLeft: 40 }}
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={(e) => { setEmailFocus(true); onFocusStyle(e); }}
                onBlur={(e) => { setTimeout(() => setEmailFocus(false), 150); blurField("email"); onBlurStyle(e, !!(touched.email && errors.email)); }}
                disabled={loading}
                autoComplete="off"
              />
            </div>
            {emailFocus && <SuggestDropdown suggestions={emailSuggest.suggestions} onSelect={(v) => { setEmail(v); emailSuggest.clear(); setEmailFocus(false); }} />}
            {touched.email && errors.email && <p style={{ color: "#ef4444", fontSize: 11, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}><Icon name="CircleAlert" size={11} />{errors.email}</p>}
          </div>

          {/* INN */}
          <InnField
            inn={inn} innInfo={innInfo} innChecking={innChecking}
            touched={touched} errors={errors} loading={loading}
            setInn={setInn} setInnInfo={setInnInfo} setInnChecking={setInnChecking}
            setErrors={setErrors} onBlur={() => blurField("inn")}
          />

          {/* Message */}
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: 14, color: "rgba(212,175,55,0.5)", pointerEvents: "none" }}>
              <Icon name="MessageSquare" size={15} />
            </span>
            <textarea
              style={{ ...I, paddingLeft: 40, resize: "none" }}
              placeholder="Опишите вашу ситуацию или вопрос (необязательно)"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={onFocusStyle}
              onBlur={(e) => onBlurStyle(e)}
              disabled={loading}
            />
          </div>

          {/* File upload */}
          <FileUpload files={files} loading={loading} progress={progress} onFiles={handleFiles} onRemove={(i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))} />

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? "rgba(212,175,55,0.4)" : "linear-gradient(135deg,#D4AF37 0%,#b8922a 100%)",
              color: "#0B0F1A",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.13em",
              textTransform: "uppercase",
              borderRadius: 10,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 4px 28px rgba(212,175,55,0.35)",
              transition: "all 0.2s",
              fontFamily: "inherit",
              marginTop: 4,
            }}
            onMouseEnter={(e) => { if (!loading) { (e.currentTarget).style.boxShadow = "0 6px 36px rgba(212,175,55,0.55)"; (e.currentTarget).style.transform = "translateY(-1px)"; } }}
            onMouseLeave={(e) => { (e.currentTarget).style.boxShadow = "0 4px 28px rgba(212,175,55,0.35)"; (e.currentTarget).style.transform = "none"; }}
          >
            {loading ? "Отправляем..." : "Отправить документ"}
          </button>

          {/* Privacy */}
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", userSelect: "none", marginTop: 2 }}>
            <div style={{ position: "relative", flexShrink: 0, marginTop: 1 }}>
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} disabled={loading} />
              <div style={{
                width: 16, height: 16, borderRadius: 4,
                background: consent ? "#D4AF37" : "transparent",
                border: `1.5px solid ${consent ? "#D4AF37" : "rgba(212,175,55,0.35)"}`,
                boxShadow: consent ? "0 0 10px rgba(212,175,55,0.4)" : "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}>
                {consent && <Icon name="Check" size={10} style={{ color: "#0B0F1A" }} />}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
              <Icon name="Lock" size={12} style={{ color: "rgba(212,175,55,0.4)", flexShrink: 0, marginTop: 2 }} />
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, lineHeight: 1.55 }}>
                Нажимая кнопку, вы соглашаетесь с обработкой персональных данных и принимаете{" "}
                <a href="/privacy" target="_blank" style={{ color: "#D4AF37", textDecoration: "underline" }}>
                  политику конфиденциальности
                </a>
              </span>
            </div>
          </label>

        </form>
      </DialogContent>
    </Dialog>
  );
}