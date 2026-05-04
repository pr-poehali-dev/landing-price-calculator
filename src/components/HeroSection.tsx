import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const HERO_BG = "https://cdn.poehali.dev/projects/ec09f91e-5c19-456f-a8f1-620fce7cd143/files/3d7b8420-e3b6-453a-9a26-41ba2b4770cb.jpg";

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

  const NAV_LINKS = [
    ["services", "Услуги"],
    ["price", "Прайс"],
    ["calculator", "Калькулятор"],
    ["faq", "FAQ"],
  ];

  return (
    <>
      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
        style={{ background: "rgba(8,15,30,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(212,175,55,0.1)" }}>

        {/* Logo */}
        <div className="flex items-center">
          <img src="https://cdn.poehali.dev/projects/ec09f91e-5c19-456f-a8f1-620fce7cd143/bucket/9f3ffbe2-117b-415c-bd94-81fb0c9183e9.png"
            alt="Legis24" style={{ height: 112, width: "auto", borderRadius: 6 }} />
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 font-body text-xs tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
          {NAV_LINKS.map(([id, label]) => (
            <button key={id} onClick={() => scrollTo(id)}
              className="transition-colors"
              style={{ color: "var(--text-muted)", letterSpacing: "0.12em" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
              {label}
            </button>
          ))}
          <Link to="/blog" className="transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--gold)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"}>
            Блог
          </Link>
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-5">
          <a href="mailto:order@advokat-vsem.ru"
            className="font-body text-xs transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
            order@advokat-vsem.ru
          </a>
          <Link to="/login"
            className="flex items-center gap-1.5 font-body text-xs font-semibold tracking-widest uppercase transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--gold)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"}>
            <Icon name="LayoutDashboard" size={13} />
            Кабинет
          </Link>
          <button className="btn-gold px-5 py-2.5 text-xs" onClick={onOpenModal}>
            Отправить документ
          </button>
        </div>

        {/* Burger */}
        <button className="md:hidden" style={{ color: "var(--gold)" }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Icon name={mobileMenuOpen ? "X" : "Menu"} size={20} />
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed top-[60px] left-0 right-0 z-40 px-6 py-6 space-y-1"
          style={{ background: "#080f1e", borderBottom: "1px solid rgba(212,175,55,0.15)" }}>
          {NAV_LINKS.map(([id, label]) => (
            <button key={id} onClick={() => scrollTo(id)}
              className="block w-full text-left font-body text-sm py-3"
              style={{ color: "var(--text)", borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
              {label}
            </button>
          ))}
          <Link to="/blog" onClick={() => setMobileMenuOpen(false)}
            className="block w-full text-left font-body text-sm py-3"
            style={{ color: "var(--text)", borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
            Блог
          </Link>
          <a href="mailto:order@advokat-vsem.ru"
            className="block w-full text-left font-body text-sm py-3"
            style={{ color: "var(--gold)", borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
            order@advokat-vsem.ru
          </a>
          <Link to="/login" onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 w-full font-body text-sm py-3"
            style={{ color: "#ffffff", borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
            <Icon name="LayoutDashboard" size={15} />
            Личный кабинет
          </Link>
          <button className="btn-gold w-full py-3.5 text-xs mt-4" onClick={onOpenModal}>
            Отправить документ
          </button>
        </div>
      )}

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden"
        style={{ background: "#080f1e" }}>

        {/* Background image with overlay */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: `url('${HERO_BG}')`,
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
            opacity: 1,
          }} />

        {/* Gradient overlays — лёгкое затемнение для читаемости текста */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(8,15,30,0.65) 30%, rgba(8,15,30,0.2) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,15,30,0.7) 0%, transparent 50%)" }} />

        {/* Gold glow top-right */}
        <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top right, rgba(212,175,55,0.08) 0%, transparent 70%)" }} />

        {/* Vertical decorative lines */}
        {[33, 66].map(pct => (
          <div key={pct} className="absolute top-0 bottom-0 w-px hidden lg:block pointer-events-none"
            style={{ left: `${pct}%`, background: "linear-gradient(to bottom, transparent 5%, rgba(212,175,55,0.06) 50%, transparent 95%)" }} />
        ))}

        <div className="relative max-w-6xl mx-auto px-6 md:px-12 pt-32 pb-24 lg:py-44 w-full">

          {/* Badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-px" style={{ background: "var(--gold)" }} />
            <span className="font-body text-xs tracking-widest uppercase" style={{ color: "var(--gold)", letterSpacing: "0.2em" }}>
              Юридическая защита бизнеса
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up-delay-1 mb-6 max-w-3xl">
            <span className="font-display block"
              style={{
                fontSize: "clamp(2.8rem, 7vw, 6rem)",
                lineHeight: 1.05,
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-0.01em",
              }}>
              Подготовка документов
            </span>
            <span className="font-display block"
              style={{
                fontSize: "clamp(2.8rem, 7vw, 6rem)",
                lineHeight: 1.05,
                fontWeight: 700,
                fontStyle: "italic",
                color: "var(--gold)",
                letterSpacing: "-0.01em",
              }}>
              за 24 часа
            </span>
          </h1>

          {/* Sub */}
          <p className="animate-fade-up-delay-2 font-body text-base md:text-lg mb-2 max-w-xl"
            style={{ color: "rgba(232,228,220,0.65)", letterSpacing: "0.01em", fontWeight: 300 }}>
            Претензии · ФНС · Суд · Интеллектуальная собственность
          </p>
          <p className="animate-fade-up-delay-2 font-body text-sm mb-10 max-w-lg"
            style={{ color: "rgba(232,228,220,0.4)" }}>
            Работаем с бизнесом. Без ошибок. С учётом актуальной судебной практики.
          </p>

          {/* CTA buttons */}
          <div className="animate-fade-up-delay-3 flex flex-col sm:flex-row gap-4 mb-16">
            <button className="btn-gold px-10 py-4 text-sm" onClick={onOpenModal}>
              Отправить документы
            </button>
            <button className="btn-outline px-10 py-4 text-sm" onClick={() => scrollTo("calculator")}>
              Рассчитать стоимость
            </button>
          </div>

          {/* Stats */}
          <div className="animate-fade-up-delay-3 flex flex-wrap gap-8 md:gap-14 pt-8"
            style={{ borderTop: "1px solid rgba(212,175,55,0.15)" }}>
            {[
              ["24 ч", "срок подготовки"],
              ["20+", "лет практики"],
              ["98%", "успешных дел"],
              ["по РФ", "работаем удалённо"],
            ].map(([val, label]) => (
              <div key={label}>
                <p className="font-display text-2xl md:text-3xl mb-1 font-bold" style={{ color: "var(--gold)" }}>
                  {val}
                </p>
                <p className="font-body text-xs" style={{ color: "rgba(232,228,220,0.4)", letterSpacing: "0.05em" }}>
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