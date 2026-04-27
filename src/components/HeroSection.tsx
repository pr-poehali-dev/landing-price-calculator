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
          background: "rgba(10,20,50,0.6)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
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
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          {[["services", "Услуги"], ["price", "Прайс"], ["calculator", "Калькулятор"], ["faq", "FAQ"]].map(
            ([id, label]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="hover:text-navy transition-colors"
                style={{ color: "rgba(255,255,255,0.6)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
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
          style={{ color: "#ffffff" }}
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
            background: "rgba(10,20,50,0.92)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {[["services", "Услуги"], ["price", "Прайс"], ["calculator", "Калькулятор"], ["faq", "FAQ"]].map(
            ([id, label]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="block w-full text-left font-body text-sm py-2"
                style={{ color: "rgba(255,255,255,0.8)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
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
          backgroundImage: `
            linear-gradient(to bottom, rgba(10,20,50,0.55) 0%, rgba(10,20,50,0.4) 100%),
            url('https://cdn.poehali.dev/projects/ec09f91e-5c19-456f-a8f1-620fce7cd143/bucket/41d43ad1-6edb-499e-abc6-7222dfa6852c.jpg')
          `,
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
              background: "linear-gradient(to bottom, transparent 5%, rgba(255,255,255,0.12) 50%, transparent 95%)",
            }}
          />
        ))}

        <div className="max-w-6xl mx-auto px-6 md:px-10 pt-28 pb-20 lg:py-40">
          {/* Badge */}
          <div
            className="animate-fade-up inline-flex items-center gap-3 mb-10 px-4 py-2"
            style={{ border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.08)", borderRadius: 4 }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#7eb8ff", boxShadow: "0 0 8px #7eb8ff" }}
            />
            <span
              className="font-body text-xs tracking-widest uppercase"
              style={{ color: "#a8d0ff" }}
            >
              Сроки горят? Успеем к дедлайну
            </span>
          </div>

          <h1
            className="animate-fade-up-delay-1 font-display mb-6"
            style={{ fontWeight: 700, lineHeight: 1.0 }}
          >
            <span
              style={{
                fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)",
                display: "block",
                color: "rgba(255,255,255,0.7)",
                letterSpacing: "0.02em",
                fontWeight: 400,
              }}
            >
              Любой юридический документ за
            </span>
            <span
              style={{
                fontSize: "clamp(5rem, 13vw, 11rem)",
                color: "#ffffff",
                fontStyle: "italic",
                display: "block",
                lineHeight: 0.95,
              }}
            >
              24 часа
            </span>
          </h1>

          <p
            className="animate-fade-up-delay-2 font-body text-sm md:text-base mb-3"
            style={{ color: "rgba(255,255,255,0.65)", letterSpacing: "0.04em" }}
          >
            Претензии · ФНС · Суд · Интеллектуальная собственность
          </p>
          <p
            className="animate-fade-up-delay-2 font-body text-sm mb-10 max-w-lg"
            style={{ color: "rgba(255,255,255,0.55)" }}
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
                border: "1px solid rgba(255,255,255,0.35)",
                color: "#ffffff",
                background: "transparent",
                borderRadius: 6,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)")}
              onClick={() => scrollTo("calculator")}
            >
              Рассчитать стоимость
            </button>
          </div>

          {/* Stats row */}
          <div
            className="animate-fade-up-delay-3 mt-16 pt-10 flex flex-wrap gap-6 md:gap-10"
            style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}
          >
            {[
              ["24 ч", "срок подготовки документа"],
              ["20+", "лет практики"],
              ["98%", "успешных дел"],
            ].map(([val, label]) => (
              <div key={label}>
                <p
                  className="font-display text-3xl mb-0.5"
                  style={{ color: "#ffffff", fontWeight: 700 }}
                >
                  {val}
                </p>
                <p className="font-body text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
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