import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import Icon from "@/components/ui/icon";
import { apiPartner } from "./types";

interface RefStats {
  clicks_total: number;
  clicks_7d: number;
  submissions_total: number;
  submissions_7d: number;
}

interface Props {
  sessionId: string;
  partnerId?: number;
}

export default function PartnerReferral({ sessionId, partnerId }: Props) {
  const [refCode, setRefCode] = useState<string | null>(null);
  const [stats, setStats] = useState<RefStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const refUrl = refCode ? `${window.location.origin}/?ref=${refCode}` : null;

  useEffect(() => {
    const profileReq = partnerId
      ? apiPartner(sessionId, { action: "get_profile", partner_id: partnerId })
      : apiPartner(sessionId, { action: "get_profile" });
    profileReq.then(async data => {
      let code = data.partner?.ref_code;
      if (!code && data.partner?.id) {
        const d = await apiPartner(sessionId, { action: "get_ref_link", ...(partnerId ? { partner_id: partnerId } : {}) });
        if (d.ref_code) code = d.ref_code;
      }
      if (code) {
        setRefCode(code);
        const s = await apiPartner(sessionId, { action: "get_ref_stats" });
        if (s.clicks_total !== undefined) setStats(s);
      }
      setLoading(false);
    });
  }, [sessionId, partnerId]);

  const copyLink = () => {
    if (!refUrl) return;
    navigator.clipboard.writeText(refUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const canvas = document.createElement("canvas");
    const size = 400;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const a = document.createElement("a");
      a.download = `ref-qr-${refCode}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Icon name="LoaderCircle" size={22} className="animate-spin" style={{ color: "var(--blue)" }} />
    </div>
  );

  if (!refCode) return (
    <div className="text-center py-12">
      <Icon name="Link2Off" size={36} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
      <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Реферальный код будет доступен после заполнения профиля</p>
    </div>
  );

  const convRate = stats && stats.clicks_total > 0
    ? Math.round((stats.submissions_total / stats.clicks_total) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>Ваш реферальный код</p>
        <p className="text-2xl font-bold tracking-widest" style={{ color: "var(--navy)", fontFamily: "monospace" }}>{refCode}</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: "MousePointerClick", label: "Переходов всего", value: stats.clicks_total, color: "var(--blue)" },
            { icon: "TrendingUp", label: "За 7 дней", value: stats.clicks_7d, color: "#7c3aed" },
            { icon: "FileText", label: "Заявок всего", value: stats.submissions_total, color: "var(--success)" },
            { icon: "Percent", label: "Конверсия", value: `${convRate}%`, color: "#d97706" },
          ].map(c => (
            <div key={c.label} className="rounded-2xl p-4" style={{ background: "var(--bg)", border: "1px solid var(--border-c)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: `${c.color}18` }}>
                <Icon name={c.icon as "MousePointerClick"} size={15} style={{ color: c.color }} />
              </div>
              <p className="text-xl font-bold mb-0.5" style={{ color: "var(--navy)" }}>{c.value}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{c.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Link block */}
      <div className="rounded-2xl p-5 space-y-3" style={{ background: "var(--bg)", border: "1px solid var(--border-c)" }}>
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Реферальная ссылка</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-xl px-4 py-3 text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap"
            style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)", color: "var(--text)" }}>
            {refUrl}
          </div>
          <button onClick={copyLink}
            className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm flex-shrink-0 transition-all"
            style={{ background: copied ? "var(--success)" : "var(--navy)", color: "#fff" }}>
            <Icon name={copied ? "Check" : "Copy"} size={15} />
            {copied ? "Скопировано" : "Копировать"}
          </button>
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Поделитесь этой ссылкой с потенциальными клиентами — все их заявки будут автоматически привязаны к вам.
        </p>
      </div>

      {/* Promo channel */}
      <a href="https://t.me/+AGCUWXbH0Qs2MWUy" target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-4 rounded-2xl p-5 transition-opacity hover:opacity-80"
        style={{ background: "linear-gradient(135deg, #0088cc18, #0088cc08)", border: "1px solid #0088cc30", textDecoration: "none" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#0088cc" }}>
          <Icon name="Send" size={18} style={{ color: "#fff" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--navy)" }}>Промо-материалы в Telegram</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Баннеры, скрипты и готовые тексты для привлечения клиентов</p>
        </div>
        <Icon name="ExternalLink" size={15} style={{ color: "#0088cc" }} />
      </a>

      {/* QR block */}
      <div className="rounded-2xl p-5" style={{ background: "var(--bg)", border: "1px solid var(--border-c)" }}>
        <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "var(--text-muted)" }}>QR-код</p>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div ref={qrRef} className="rounded-2xl p-4 flex-shrink-0"
            style={{ background: "#fff", border: "1px solid var(--border-c)" }}>
            <QRCodeSVG value={refUrl!} size={180} fgColor="#0d1826" bgColor="#ffffff" />
          </div>
          <div className="space-y-3 text-center sm:text-left">
            <p className="text-sm" style={{ color: "var(--text)" }}>
              Распечатайте QR-код и разместите его на раздаточных материалах, визитках или в офисе — клиент отсканирует и попадёт сразу на ваш реферальный URL.
            </p>
            <button onClick={downloadQR}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-80"
              style={{ background: "var(--navy)", color: "#fff" }}>
              <Icon name="Download" size={15} />
              Скачать PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}