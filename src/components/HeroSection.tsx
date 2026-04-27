import { useState } from "react";
import Icon from "@/components/ui/icon";

interface HeroSectionProps {
  onScrollTo: (id: string) => void;
}

export default function HeroSection({ onScrollTo }: HeroSectionProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    onScrollTo(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4"
        style={{
          background: "rgba(15,23,42,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center">
          <img
            src="https://cdn.poehali.dev/projects/ec09f91e-5c19-456f-a8f1-620fce7cd143/bucket/c0d749e6-eaf1-416b-8494-64a20cd79d7a.png"
            alt="Legis 24"
            className="h-10 w-auto"
          />
        </div>

        <div
          className="hidden md:flex items-center gap-8 font-body text-xs tracking-widest uppercase"
          style={{ color: "var(--mist)", opacity: 0.5 }}
        >
          {[["services", "Услуги"], ["price", "Прайс"], ["calculator", "Калькулятор"], ["faq", "FAQ"]].map(
            ([id, label]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="hover:opacity-100 transition-opacity"
              >
                {label}
              </button>
            )
          )}
        </div>

        <button className="btn-gold px-5 py-2.5 text-xs hidden md:block">
          Отправить документ
        </button>

        <button
          className="md:hidden"
          style={{ color: "var(--red)" }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Icon name={mobileMenuOpen ? "X" : "Menu"} size={20} />
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed top-14 left-0 right-0 z-40 px-6 py-6 space-y-4"
          style={{
            background: "rgba(15,23,42,0.98)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {[["services", "Услуги"], ["price", "Прайс"], ["calculator", "Калькулятор"], ["faq", "FAQ"]].map(
            ([id, label]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="block w-full text-left font-body text-sm py-2"
                style={{ color: "var(--mist)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                {label}
              </button>
            )
          )}
          <button className="btn-gold w-full py-3 text-xs mt-2">Отправить документ</button>
        </div>
      )}

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 75% 40%, rgba(239,68,68,0.07) 0%, transparent 65%),
            radial-gradient(ellipse 40% 50% at 15% 85%, rgba(37,99,235,0.05) 0%, transparent 55%),
            var(--obsidian)
          `,
        }}
      >
        {[38, 68].map((pct) => (
          <div
            key={pct}
            className="absolute top-0 bottom-0 w-px hidden lg:block"
            style={{
              left: `${pct}%`,
              background: "linear-gradient(to bottom, transparent 5%, rgba(255,255,255,0.04) 50%, transparent 95%)",
            }}
          />
        ))}

        <div className="max-w-6xl mx-auto px-6 md:px-10 pt-28 pb-20 lg:py-40">
          {/* Badge */}
          <div
            className="animate-fade-up inline-flex items-center gap-3 mb-10 px-4 py-2"
            style={{ border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.07)" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--red)", boxShadow: "0 0 8px var(--red)" }}
            />
            <span
              className="font-body text-xs tracking-widest uppercase"
              style={{ color: "var(--red)" }}
            >
              Сроки горят? Успеем к дедлайну
            </span>
          </div>

          <h1
            className="animate-fade-up-delay-1 font-display mb-6"
            style={{ fontWeight: 300, color: "var(--mist)", lineHeight: 1.0 }}
          >
            <span
              style={{
                fontSize: "clamp(2rem, 4vw, 3.2rem)",
                display: "block",
                opacity: 0.7,
                letterSpacing: "0.02em",
              }}
            >
              Любой юридический документ за
            </span>
            <span
              style={{
                fontSize: "clamp(5rem, 13vw, 11rem)",
                color: "var(--red)",
                fontStyle: "italic",
                display: "block",
                lineHeight: 0.95,
              }}
            >
              24 часа
            </span>
          </h1>

          <p
            className="animate-fade-up-delay-2 font-body text-base mb-3"
            style={{ color: "var(--mist)", opacity: 0.45, letterSpacing: "0.08em" }}
          >
            Претензии · ФНС · Суд · Интеллектуальная собственность
          </p>
          <p
            className="animate-fade-up-delay-2 font-body text-sm mb-10 max-w-lg"
            style={{ color: "var(--mist)", opacity: 0.4 }}
          >
            Работаем с бизнесом. Без ошибок. С учётом актуальной судебной практики.
          </p>

          <div className="animate-fade-up-delay-3 flex flex-col sm:flex-row gap-4">
            <button className="btn-gold px-10 py-4">
              Отправить документ
            </button>
            <button
              className="px-10 py-4 font-body font-medium text-xs tracking-widest uppercase transition-all duration-200"
              style={{
                border: "1px solid rgba(201,168,76,0.25)",
                color: "var(--gold-light)",
                background: "transparent",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.6)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.25)")}
              onClick={() => scrollTo("calculator")}
            >
              Рассчитать стоимость
            </button>
          </div>

          {/* Stats row */}
          <div
            className="animate-fade-up-delay-3 mt-16 pt-10 flex flex-wrap gap-10"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            {[
              ["24 ч", "срок подготовки документа"],
              ["20+", "лет практики"],
              ["98%", "успешных дел"],
            ].map(([val, label]) => (
              <div key={label}>
                <p
                  className="font-display text-3xl mb-0.5"
                  style={{ color: "var(--red)", fontWeight: 300 }}
                >
                  {val}
                </p>
                <p className="font-body text-xs" style={{ color: "var(--mist)", opacity: 0.4 }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}