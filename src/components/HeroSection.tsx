import { useState } from "react";
import Icon from "@/components/ui/icon";

interface HeroSectionProps {
  onScrollTo: (id: string) => void;
  onOpenModal: () => void;
}

export default function HeroSection({ onScrollTo, onOpenModal }: HeroSectionProps) {
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
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border-c)",
        }}
      >
        <div className="flex items-center">
          <img
            src="https://cdn.poehali.dev/projects/ec09f91e-5c19-456f-a8f1-620fce7cd143/bucket/0d841fe0-d0b2-4ea0-a768-cbe3dfe8d052.jpeg"
            alt="Legis24"
            style={{ height: 48, width: "auto", mixBlendMode: "multiply" }}
          />
        </div>

        <div
          className="hidden md:flex items-center gap-8 font-body text-xs tracking-widest uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          {[["services", "Услуги"], ["price", "Прайс"], ["calculator", "Калькулятор"], ["faq", "FAQ"]].map(
            ([id, label]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="hover:text-navy transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--navy)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                {label}
              </button>
            )
          )}
        </div>

        <button className="btn-gold px-5 py-2.5 text-xs hidden md:block" onClick={onOpenModal}>
          Отправить документ
        </button>

        <button
          className="md:hidden"
          style={{ color: "var(--navy)" }}
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
            background: "#ffffff",
            borderBottom: "1px solid var(--border-c)",
          }}
        >
          {[["services", "Услуги"], ["price", "Прайс"], ["calculator", "Калькулятор"], ["faq", "FAQ"]].map(
            ([id, label]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="block w-full text-left font-body text-sm py-2"
                style={{ color: "var(--text)", borderBottom: "1px solid var(--border-c)" }}
              >
                {label}
              </button>
            )
          )}
          <button className="btn-gold w-full py-3 text-xs mt-2" onClick={onOpenModal}>Отправить документ</button>
        </div>
      )}

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center"
        style={{
          backgroundImage: `url('https://cdn.poehali.dev/projects/ec09f91e-5c19-456f-a8f1-620fce7cd143/bucket/638bfb96-6919-449f-b82d-039a0507d1c6.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {[38, 68].map((pct) => (
          <div
            key={pct}
            className="absolute top-0 bottom-0 w-px hidden lg:block"
            style={{
              left: `${pct}%`,
              background: "linear-gradient(to bottom, transparent 5%, rgba(15,44,90,0.1) 50%, transparent 95%)",
            }}
          />
        ))}

        <div className="max-w-6xl mx-auto px-6 md:px-10 pt-28 pb-20 lg:py-40">
          {/* Badge */}
          <p
            className="animate-fade-up font-body text-xs tracking-widest uppercase mb-4"
            style={{ color: "var(--blue)", letterSpacing: "0.2em" }}
          >
            Сроки горят? Успеем к дедлайну
          </p>

          <h1 className="animate-fade-up-delay-1 mb-6">
            <span
              className="font-body"
              style={{
                fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
                display: "block",
                color: "var(--text-muted)",
                letterSpacing: "0.15em",
                fontWeight: 400,
                textTransform: "uppercase",
                marginBottom: "0.5rem",
              }}
            >
              Любой юридический документ за
            </span>
            <span
              className="font-display"
              style={{
                fontSize: "clamp(3.8rem, 13vw, 11rem)",
                color: "var(--blue)",
                fontStyle: "italic",
                display: "block",
                lineHeight: 0.95,
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              24 часа
            </span>
          </h1>

          <p
            className="animate-fade-up-delay-2 font-body text-sm md:text-base mb-3"
            style={{ color: "var(--text-muted)", letterSpacing: "0.04em" }}
          >
            Претензии · ФНС · Суд · Интеллектуальная собственность
          </p>
          <p
            className="animate-fade-up-delay-2 font-body text-sm mb-10 max-w-lg"
            style={{ color: "var(--text-muted)" }}
          >
            Работаем с бизнесом. Без ошибок. С учётом актуальной судебной практики.
          </p>

          <div className="animate-fade-up-delay-3 flex flex-col sm:flex-row gap-4">
            <button className="btn-gold px-10 py-4" onClick={onOpenModal}>
              Отправить документ
            </button>
            <button
              className="btn-outline px-10 py-4 font-body font-semibold text-xs tracking-widest uppercase"
              style={{
                border: "1px solid rgba(15,44,90,0.3)",
                color: "var(--navy)",
                background: "transparent",
                borderRadius: 6,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--navy)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(15,44,90,0.3)")}
              onClick={() => scrollTo("calculator")}
            >
              Рассчитать стоимость
            </button>
          </div>

          {/* Stats row */}
          <div
            className="animate-fade-up-delay-3 mt-16 pt-10 flex flex-wrap gap-6 md:gap-10"
            style={{ borderTop: "1px solid var(--border-c)" }}
          >
            {[
              ["24 ч", "срок подготовки документа"],
              ["20+", "лет практики"],
              ["98%", "успешных дел"],
            ].map(([val, label]) => (
              <div key={label}>
                <p
                  className="font-display text-3xl mb-0.5"
                  style={{ color: "var(--blue)", fontWeight: 700 }}
                >
                  {val}
                </p>
                <p className="font-body text-xs" style={{ color: "var(--text-muted)" }}>
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