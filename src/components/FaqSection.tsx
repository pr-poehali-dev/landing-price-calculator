import { useState } from "react";
import Icon from "@/components/ui/icon";

// ─── DATA ────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "Как быстро вы подготовите документ?",
    a: "Стандартный срок — 24 часа с момента получения всех материалов. При экстренной необходимости возможно ускорение, это обсуждается отдельно.",
  },
  {
    q: "Что входит в «отзыв под ключ» по авторским правам и товарным знакам?",
    a: "Анализ доказательной базы, подготовка правовой позиции, составление отзыва с учётом актуальной судебной практики и подача в суд. Вы ничего не делаете самостоятельно.",
  },
  {
    q: "Почему цена зависит от суммы иска?",
    a: "Объём работы напрямую связан со ставками: чем выше иск, тем тщательнее анализ, тем сильнее должна быть позиция. Наш гонорар отражает реальную сложность.",
  },
  {
    q: "Как работает взаимодействие с ФНС?",
    a: "Мы анализируем запрос налогового органа, готовим грамотное возражение или ответ и подаём от вашего имени. Срок — 24 часа. Стоимость зависит от вида документа.",
  },
  {
    q: "Работаете ли вы дистанционно?",
    a: "Да. Весь документооборот — цифровой. Документы передаются по защищённому каналу, подписание — через ЭЦП или курьером при необходимости.",
  },
  {
    q: "Как обеспечивается конфиденциальность?",
    a: "Адвокатская тайна защищена законом. Переписка — по зашифрованным каналам. Мы не раскрываем даже сам факт сотрудничества.",
  },
];

// ─── FAQ ITEM ────────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button
        className="w-full flex items-center justify-between py-5 text-left gap-4"
        onClick={() => setOpen(!open)}
      >
        <span className="font-display text-lg" style={{ color: "var(--navy)" }}>
          {q}
        </span>
        <span
          className="flex-shrink-0 transition-transform duration-300"
          style={{ color: "var(--blue)", transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          <Icon name="Plus" size={16} />
        </span>
      </button>
      {open && (
        <div className="pb-5 animate-fade-in">
          <p className="font-body text-sm leading-7" style={{ color: "var(--text-muted)" }}>
            {a}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── FAQ SECTION ─────────────────────────────────────────────────────────────

export default function FaqSection({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <>
      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-6 md:px-10" style={{ background: "var(--bg-white)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-16">
            <div>
              <p
                className="font-body text-xs tracking-widest uppercase mb-3"
                style={{ color: "var(--blue)", letterSpacing: "0.2em" }}
              >
                Ответы
              </p>
              <h2 className="font-display text-4xl" style={{ color: "var(--navy)" }}>
                Часто задаваемые вопросы
              </h2>
              <div className="gold-line mt-5" />
              <p className="mt-5 font-body text-sm leading-7" style={{ color: "var(--text-muted)" }}>
                Не нашли ответ? Напишите нам — ответим за 1 час.
              </p>
              <button className="btn-gold mt-6 px-7 py-3 text-xs" onClick={onOpenModal}>Задать вопрос</button>
            </div>
            <div className="lg:col-span-2">
              {FAQS.map((f) => (
                <FaqItem key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-10 pb-28 md:pb-20" style={{ background: "var(--bg)" }}>
        <div className="max-w-6xl mx-auto">
          <div
            className="p-12 lg:p-16 text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(15,44,90,0.02) 100%)",
              border: "1px solid rgba(37,99,235,0.15)",
              borderRadius: 12,
            }}
          >
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px"
              style={{ background: "linear-gradient(90deg, transparent, var(--blue), transparent)" }}
            />
            <p
              className="font-body text-xs tracking-widest uppercase mb-4"
              style={{ color: "var(--blue)", letterSpacing: "0.2em" }}
            >
              Начать работу
            </p>
            <h2
              className="font-display text-4xl lg:text-5xl mb-4"
              style={{ color: "var(--navy)" }}
            >
              Разберём вашу ситуацию{" "}
              <span style={{ color: "var(--blue)", fontStyle: "italic" }}>сегодня</span>
            </h2>
            <p
              className="font-body text-sm mb-10 max-w-md mx-auto"
              style={{ color: "var(--text-muted)" }}
            >
              Отправьте документ — скажем, как действовать
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="flex items-center justify-center gap-3 px-10 py-4 font-body font-semibold text-xs tracking-widest uppercase transition-all duration-200"
                style={{ background: "#25D366", color: "#fff", borderRadius: 6 }}
              >
                <Icon name="MessageCircle" size={16} />
                WhatsApp
              </button>
              <button
                className="flex items-center justify-center gap-3 px-10 py-4 font-body font-semibold text-xs tracking-widest uppercase transition-all duration-200"
                style={{ background: "#229ED9", color: "#fff", borderRadius: 6 }}
              >
                <Icon name="Send" size={16} />
                Telegram
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer
        className="py-10 px-6 md:px-10"
        style={{ borderTop: "1px solid var(--border-c)", background: "var(--bg-white)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <img
            src="https://cdn.poehali.dev/projects/ec09f91e-5c19-456f-a8f1-620fce7cd143/bucket/f43bee61-8d4f-4628-9014-63453c99021f.png"
            alt="Legis24"
            style={{ height: 40, width: "auto", opacity: 0.8 }}
          />
          <p className="font-body text-xs" style={{ color: "var(--text-muted)" }}>
            © 2024 Legis24. Адвокатское бюро. Все права защищены.
          </p>
          <div className="flex gap-5 font-body text-xs" style={{ color: "var(--text-muted)" }}>
            <span>Политика конфиденциальности</span>
            <span>·</span>
            <span>Соглашение</span>
          </div>
        </div>
      </footer>

      {/* ── MOBILE STICKY CTA ───────────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 md:hidden z-40 p-4"
        style={{
          background: "rgba(255,255,255,0.97)",
          borderTop: "1px solid var(--border-c)",
          backdropFilter: "blur(12px)",
        }}
      >
        <button className="btn-gold w-full py-4 text-xs" onClick={onOpenModal}>
          Отправить документ
        </button>
      </div>
    </>
  );
}