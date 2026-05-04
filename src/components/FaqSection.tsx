import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const FAQS = [
  { q: "В каких регионах вы работаете?",           a: "Мы работаем по всей России без каких-либо географических ограничений. Всё взаимодействие происходит дистанционно: вы отправляете материалы онлайн, мы готовим документы и возвращаем вам готовый результат." },
  { q: "Как проходит взаимодействие с ФНС?",        a: "Мы анализируем запрос налогового органа и готовим все необходимые документы: возражения, пояснения, ответы. Готовые документы передаём вам, а вы самостоятельно направляете их через личный кабинет налогоплательщика на сайте ФНС." },
  { q: "Как быстро вы подготовите документ?",       a: "Стандартный срок — 24 часа с момента получения всех материалов. При экстренной необходимости возможно ускорение, это обсуждается отдельно." },
  { q: "Что входит в «отзыв под ключ»?",            a: "Анализ доказательной базы, подготовка правовой позиции, составление отзыва с учётом актуальной судебной практики и подача в суд. Вы ничего не делаете самостоятельно." },
  { q: "Почему цена зависит от суммы иска?",        a: "Объём работы напрямую связан со ставками: чем выше иск, тем тщательнее анализ, тем сильнее должна быть позиция. Наш гонорар отражает реальную сложность." },
  { q: "Как обеспечивается конфиденциальность?",   a: "Адвокатская тайна защищена законом. Переписка — по зашифрованным каналам. Мы не раскрываем даже сам факт сотрудничества." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button className="w-full flex items-center justify-between py-5 text-left gap-4"
        onClick={() => setOpen(!open)}>
        <span className="font-body text-sm sm:text-base font-medium" style={{ color: open ? "var(--gold)" : "#fff" }}>
          {q}
        </span>
        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded transition-all duration-300"
          style={{
            background: open ? "rgba(212,175,55,0.15)" : "rgba(212,175,55,0.05)",
            border: "1px solid rgba(212,175,55,0.2)",
            color: "var(--gold)",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
          }}>
          <Icon name="Plus" size={14} />
        </span>
      </button>
      {open && (
        <div className="pb-5 animate-fade-in">
          <p className="font-body text-sm leading-7" style={{ color: "var(--text-muted)" }}>{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FaqSection({ onOpenModal }: { onOpenModal: () => void }) {
  const ref1 = useScrollReveal();
  const ref2 = useScrollReveal();

  return (
    <>
      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section ref={ref1 as React.Ref<HTMLElement>} id="faq"
        className="reveal py-24 px-6 md:px-12"
        style={{ background: "var(--dark-card)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-16">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-5 h-px" style={{ background: "var(--gold)" }} />
                <span className="font-body text-xs tracking-widest uppercase" style={{ color: "var(--gold)" }}>Ответы</span>
              </div>
              <h2 className="font-display mb-5" style={{ fontSize: "clamp(1.6rem, 3vw, 2.5rem)", color: "#fff", fontWeight: 700 }}>
                Часто задаваемые вопросы
              </h2>
              <div className="gold-line mb-5" />
              <p className="font-body text-sm leading-7 mb-6" style={{ color: "var(--text-muted)" }}>
                Не нашли ответ? Напишите нам — ответим за 1 час.
              </p>
              <button className="btn-gold px-7 py-3 text-xs" onClick={onOpenModal}>Задать вопрос</button>
            </div>
            <div className="lg:col-span-2">
              {FAQS.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────── */}
      <section ref={ref2 as React.Ref<HTMLElement>}
        className="reveal py-20 px-6 md:px-12 pb-28 md:pb-20 relative overflow-hidden"
        style={{ background: "#050d1a" }}>

        {/* Gold glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(212,175,55,0.08) 0%, transparent 70%)" }} />
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)" }} />

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-8 h-px" style={{ background: "var(--gold)" }} />
              <span className="font-body text-xs tracking-widest uppercase" style={{ color: "var(--gold)" }}>Начать работу</span>
              <div className="w-8 h-px" style={{ background: "var(--gold)" }} />
            </div>
            <h2 className="font-display mb-4"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)", color: "#fff", fontWeight: 700, lineHeight: 1.1 }}>
              Разберём вашу ситуацию{" "}
              <span style={{ color: "var(--gold)", fontStyle: "italic" }}>сегодня</span>
            </h2>
            <p className="font-body text-sm mb-10" style={{ color: "var(--text-muted)" }}>
              Отправьте документ — скажем, как действовать
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://t.me/intelectpro_bot" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 px-10 py-4 font-body font-bold text-xs tracking-widest uppercase rounded transition-all"
                style={{ background: "#229ED9", color: "#fff", letterSpacing: "0.08em" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.9"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
                <Icon name="Send" size={15} />
                Telegram
              </a>
              <a href="mailto:order@advokat-vsem.ru"
                className="flex items-center justify-center gap-3 px-10 py-4 font-body font-bold text-xs tracking-widest uppercase rounded transition-all"
                style={{ background: "transparent", color: "var(--gold)", border: "1px solid rgba(212,175,55,0.4)", letterSpacing: "0.08em" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--gold)"; (e.currentTarget as HTMLElement).style.background = "rgba(212,175,55,0.06)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,175,55,0.4)"; (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
                <Icon name="Mail" size={15} />
                order@advokat-vsem.ru
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="py-8 px-6 md:px-12"
        style={{ background: "#050d1a", borderTop: "1px solid rgba(212,175,55,0.1)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <span className="font-display text-lg font-bold tracking-wider" style={{ color: "var(--gold)" }}>
            LEGIS<span style={{ color: "rgba(232,228,220,0.5)" }}>24</span>
          </span>
          <div className="flex flex-col items-center gap-1">
            <a href="mailto:order@advokat-vsem.ru"
              className="font-body text-sm font-semibold transition-colors"
              style={{ color: "var(--gold)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--gold-light)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--gold)")}>
              order@advokat-vsem.ru
            </a>
            <p className="font-body text-xs" style={{ color: "rgba(232,228,220,0.25)" }}>
              © 2024 Legis24. Адвокатское бюро. Все права защищены.
            </p>
          </div>
          <div className="flex flex-wrap gap-5 font-body text-xs justify-center" style={{ color: "rgba(232,228,220,0.35)" }}>
            <a href="/privacy" className="hover:opacity-70 transition-opacity underline" style={{ color: "rgba(232,228,220,0.35)" }}>Политика конфиденциальности</a>
            <a href="/terms"   className="hover:opacity-70 transition-opacity underline" style={{ color: "rgba(232,228,220,0.35)" }}>Пользовательское соглашение</a>
            <a href="/offer"   className="hover:opacity-70 transition-opacity underline" style={{ color: "rgba(232,228,220,0.35)" }}>Публичная оферта</a>
            <Link to="/login" className="flex items-center gap-1 font-semibold transition-opacity hover:opacity-70" style={{ color: "var(--gold)" }}>
              <Icon name="LayoutDashboard" size={12} />
              Кабинет
            </Link>
          </div>
        </div>
      </footer>

      {/* ── MOBILE STICKY CTA ───────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden px-4 py-3"
        style={{ background: "rgba(5,13,26,0.97)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(212,175,55,0.15)" }}>
        <button className="btn-gold w-full py-3.5 text-xs" onClick={onOpenModal}>
          Отправить документ
        </button>
      </div>
    </>
  );
}
