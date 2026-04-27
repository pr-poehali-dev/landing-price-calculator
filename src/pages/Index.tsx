import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

// ─── CALCULATOR ──────────────────────────────────────────────────────────────

function calcIS(amount: number): number {
  if (amount <= 0) return 0;
  if (amount <= 500000) {
    return Math.max(amount * 0.1, 20000);
  }
  return 50000 + (amount - 500000) * 0.02;
}

function Calculator() {
  const [amount, setAmount] = useState(300000);
  const sliderRef = useRef<HTMLInputElement>(null);

  const fee = calcIS(amount);

  const formatRub = (n: number) =>
    new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(n);

  const formatShort = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(".0", "")} млн`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)} тыс`;
    return String(n);
  };

  const updateFill = () => {
    const el = sliderRef.current;
    if (!el) return;
    const min = 50000, max = 5000000;
    const pct = ((amount - min) / (max - min)) * 100;
    el.style.setProperty("--range-fill", `${pct}%`);
  };

  useEffect(updateFill, [amount]);

  const examples = [
    { sum: 300000, label: "300 тыс" },
    { sum: 450000, label: "450 тыс" },
    { sum: 700000, label: "700 тыс" },
    { sum: 2000000, label: "2 млн" },
  ];

  return (
    <div
      className="p-8 lg:p-10"
      style={{
        background: "rgba(201,168,76,0.04)",
        border: "1px solid rgba(201,168,76,0.2)",
      }}
    >
      <p
        className="font-body text-xs tracking-widest uppercase mb-6"
        style={{ color: "var(--gold)", letterSpacing: "0.2em" }}
      >
        Калькулятор — интеллектуальная собственность
      </p>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Left: slider */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <span className="font-body text-sm" style={{ color: "var(--mist)", opacity: 0.6 }}>
              Сумма иска
            </span>
            <span className="font-display text-3xl" style={{ color: "var(--gold-light)", fontWeight: 300 }}>
              {formatShort(amount)} ₽
            </span>
          </div>

          <input
            ref={sliderRef}
            type="range"
            min={50000}
            max={5000000}
            step={10000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full mb-2"
          />
          <div
            className="flex justify-between font-body text-xs"
            style={{ color: "var(--gold-dim)" }}
          >
            <span>50 тыс</span>
            <span>5 млн</span>
          </div>

          {/* Quick picks */}
          <div className="flex flex-wrap gap-2 mt-5">
            {examples.map((ex) => (
              <button
                key={ex.sum}
                onClick={() => setAmount(ex.sum)}
                className="font-body text-xs px-3 py-1.5 transition-all duration-200"
                style={{
                  border: `1px solid ${
                    amount === ex.sum
                      ? "rgba(201,168,76,0.6)"
                      : "rgba(201,168,76,0.15)"
                  }`,
                  color: amount === ex.sum ? "var(--gold-light)" : "var(--mist)",
                  background:
                    amount === ex.sum ? "rgba(201,168,76,0.1)" : "transparent",
                  opacity: amount === ex.sum ? 1 : 0.6,
                }}
              >
                {ex.label}
              </button>
            ))}
          </div>

          {/* Formula hint */}
          <div
            className="mt-6 p-4 font-body text-xs leading-6"
            style={{
              background: "rgba(201,168,76,0.04)",
              border: "1px solid rgba(201,168,76,0.1)",
              color: "var(--mist)",
              opacity: 0.55,
            }}
          >
            <strong style={{ color: "var(--gold-dim)", opacity: 1 }}>Формула:</strong>
            <br />
            До 500 000 ₽ → 10% (мин. 20 000 ₽)
            <br />
            Свыше 500 000 ₽ → 50 000 ₽ + 2% от превышения
          </div>
        </div>

        {/* Right: result */}
        <div className="flex flex-col justify-between">
          <div>
            <p
              className="font-body text-xs tracking-widest uppercase mb-2"
              style={{ color: "var(--gold-dim)" }}
            >
              Стоимость представительства
            </p>
            <p
              className="font-display mb-1"
              style={{
                fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                fontWeight: 300,
                color: "var(--gold-light)",
                lineHeight: 1,
              }}
            >
              {formatRub(fee)}
            </p>
            <p
              className="font-body text-xs mt-3"
              style={{ color: "var(--mist)", opacity: 0.4 }}
            >
              анализ + подготовка + подача документов · под ключ
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <button className="btn-gold w-full py-4 text-xs">
              Отправить документ
            </button>
            <p
              className="font-body text-xs text-center"
              style={{ color: "var(--mist)", opacity: 0.3 }}
            >
              Точная стоимость — после изучения материалов
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "Как быстро вы подготовите документ?",
    a: "Стандартный срок — 24 часа с момента получения всех материалов. При экстренной необходимости возможно ускорение, это обсуждается отдельно.",
  },
  {
    q: "Что входит в «отзыв под ключ» по ИС?",
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

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button
        className="w-full flex items-center justify-between py-5 text-left gap-4"
        onClick={() => setOpen(!open)}
      >
        <span className="font-display text-lg" style={{ color: "var(--mist)" }}>
          {q}
        </span>
        <span
          className="flex-shrink-0 transition-transform duration-300"
          style={{ color: "var(--gold)", transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          <Icon name="Plus" size={16} />
        </span>
      </button>
      {open && (
        <div className="pb-5 animate-fade-in">
          <p className="font-body text-sm leading-7" style={{ color: "var(--mist)", opacity: 0.6 }}>
            {a}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div style={{ background: "var(--obsidian)", minHeight: "100vh" }}>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4"
        style={{
          background: "rgba(14,12,10,0.9)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(201,168,76,0.08)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-5 h-px" style={{ background: "var(--gold)" }} />
          <span className="font-display text-base tracking-widest" style={{ color: "var(--gold-light)" }}>
            LEGIS
          </span>
          <div className="w-5 h-px" style={{ background: "var(--gold)" }} />
        </div>

        <div className="hidden md:flex items-center gap-8 font-body text-xs tracking-widest uppercase" style={{ color: "var(--mist)", opacity: 0.5 }}>
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
          style={{ color: "var(--gold)" }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Icon name={mobileMenuOpen ? "X" : "Menu"} size={20} />
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed top-14 left-0 right-0 z-40 px-6 py-6 space-y-4"
          style={{ background: "rgba(14,12,10,0.97)", borderBottom: "1px solid rgba(201,168,76,0.1)" }}
        >
          {[["services", "Услуги"], ["price", "Прайс"], ["calculator", "Калькулятор"], ["faq", "FAQ"]].map(
            ([id, label]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="block w-full text-left font-body text-sm py-2"
                style={{ color: "var(--mist)", borderBottom: "1px solid rgba(201,168,76,0.06)" }}
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
            radial-gradient(ellipse 70% 60% at 80% 40%, rgba(201,168,76,0.05) 0%, transparent 70%),
            radial-gradient(ellipse 50% 70% at 10% 90%, rgba(201,168,76,0.03) 0%, transparent 60%),
            var(--obsidian)
          `,
        }}
      >
        {/* Vertical accent lines */}
        {[38, 68].map((pct) => (
          <div
            key={pct}
            className="absolute top-0 bottom-0 w-px hidden lg:block"
            style={{
              left: `${pct}%`,
              background: "linear-gradient(to bottom, transparent 5%, rgba(201,168,76,0.05) 50%, transparent 95%)",
            }}
          />
        ))}

        <div className="max-w-6xl mx-auto px-6 md:px-10 pt-28 pb-20 lg:py-40">
          {/* Badge */}
          <div
            className="animate-fade-up inline-flex items-center gap-3 mb-10 px-4 py-2"
            style={{ border: "1px solid rgba(201,168,76,0.2)", background: "rgba(201,168,76,0.05)" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--gold)", boxShadow: "0 0 8px var(--gold)" }}
            />
            <span className="font-body text-xs tracking-widest uppercase" style={{ color: "var(--gold)" }}>
              Сроки горят? Успеем к дедлайну
            </span>
          </div>

          <h1
            className="animate-fade-up-delay-1 font-display leading-tight mb-6"
            style={{ fontSize: "clamp(2.8rem, 6.5vw, 5.5rem)", fontWeight: 300, color: "var(--mist)" }}
          >
            Любой юридический<br />
            документ за{" "}
            <span style={{ color: "var(--gold-light)", fontStyle: "italic" }}>24 часа</span>
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
              style={{ border: "1px solid rgba(201,168,76,0.25)", color: "var(--gold-light)", background: "transparent" }}
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
            style={{ borderTop: "1px solid rgba(201,168,76,0.1)" }}
          >
            {[
              ["24 ч", "срок подготовки документа"],
              ["20+", "лет практики"],
              ["98%", "успешных дел"],
            ].map(([val, label]) => (
              <div key={label}>
                <p className="font-display text-3xl mb-0.5" style={{ color: "var(--gold-light)", fontWeight: 300 }}>
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

      {/* ── SERVICES ────────────────────────────────────────────────────── */}
      <section id="services" className="py-24 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="font-body text-xs tracking-widest uppercase mb-3" style={{ color: "var(--gold)", letterSpacing: "0.2em" }}>
              Что делаем
            </p>
            <h2 className="font-display text-4xl lg:text-5xl font-light" style={{ color: "var(--mist)" }}>
              Документы под задачи бизнеса
            </h2>
            <div className="gold-line mt-5" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: "rgba(201,168,76,0.08)" }}>
            {[
              {
                icon: "Gavel",
                title: "Отзывы по делам ИС",
                desc: "Правовая позиция + подача в суд. Под ключ.",
              },
              {
                icon: "FileSearch",
                title: "Возражения ФНС",
                desc: "На акты, решения, требования налоговых органов.",
              },
              {
                icon: "Mail",
                title: "Ответы на письма",
                desc: "Любые запросы от контрагентов и ведомств.",
              },
              {
                icon: "Scale",
                title: "Судебные документы",
                desc: "Исковые заявления, ходатайства, жалобы.",
              },
            ].map((s) => (
              <div key={s.title} className="service-card p-7">
                <div className="mb-4" style={{ color: "var(--gold)" }}>
                  <Icon name={s.icon} size={20} />
                </div>
                <p className="font-display text-xl mb-2" style={{ color: "var(--mist)" }}>
                  {s.title}
                </p>
                <p className="font-body text-sm leading-6" style={{ color: "var(--mist)", opacity: 0.45 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button className="btn-gold px-10 py-4">Отправить документ</button>
          </div>
        </div>
      </section>

      {/* ── PRICE ───────────────────────────────────────────────────────── */}
      <section id="price" className="py-24 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="font-body text-xs tracking-widest uppercase mb-3" style={{ color: "var(--gold)", letterSpacing: "0.2em" }}>
              Прозрачное ценообразование
            </p>
            <h2 className="font-display text-4xl lg:text-5xl font-light" style={{ color: "var(--mist)" }}>
              Стоимость услуг
            </h2>
            <div className="gold-line mt-5" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* IS block */}
            <div
              className="p-8 lg:p-10"
              style={{
                background: "var(--charcoal)",
                border: "1px solid rgba(201,168,76,0.18)",
              }}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="font-body text-xs tracking-widest uppercase mb-2" style={{ color: "var(--gold)", letterSpacing: "0.15em" }}>
                    Интеллектуальная собственность
                  </p>
                  <h3 className="font-display text-2xl" style={{ color: "var(--mist)" }}>
                    Отзыв в суд — под ключ
                  </h3>
                  <p className="font-body text-xs mt-1" style={{ color: "var(--mist)", opacity: 0.4 }}>
                    анализ · подготовка · подача
                  </p>
                </div>
                <div style={{ color: "var(--gold)", opacity: 0.6 }}>
                  <Icon name="BookOpen" size={24} />
                </div>
              </div>

              {/* Tiers */}
              <div className="space-y-3 mb-6">
                <div
                  className="flex items-center justify-between p-4"
                  style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.12)" }}
                >
                  <div>
                    <p className="font-body text-sm" style={{ color: "var(--mist)" }}>
                      До 500 000 ₽
                    </p>
                    <p className="font-body text-xs" style={{ color: "var(--mist)", opacity: 0.4 }}>
                      мин. 20 000 ₽
                    </p>
                  </div>
                  <p className="font-display text-2xl" style={{ color: "var(--gold-light)", fontWeight: 300 }}>
                    10%
                  </p>
                </div>
                <div
                  className="flex items-center justify-between p-4"
                  style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.12)" }}
                >
                  <div>
                    <p className="font-body text-sm" style={{ color: "var(--mist)" }}>
                      Свыше 500 000 ₽
                    </p>
                    <p className="font-body text-xs" style={{ color: "var(--mist)", opacity: 0.4 }}>
                      + 2% от суммы превышения
                    </p>
                  </div>
                  <p className="font-display text-2xl" style={{ color: "var(--gold-light)", fontWeight: 300 }}>
                    50 000 ₽
                  </p>
                </div>
              </div>

              {/* Examples */}
              <div
                className="p-4 mb-6"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(201,168,76,0.08)" }}
              >
                <p className="font-body text-xs tracking-widest uppercase mb-3" style={{ color: "var(--gold-dim)" }}>
                  Примеры
                </p>
                <div className="space-y-2">
                  {[
                    [300000, 30000],
                    [450000, 45000],
                    [700000, 54000],
                  ].map(([sum, fee]) => (
                    <div key={sum} className="flex justify-between font-body text-sm">
                      <span style={{ color: "var(--mist)", opacity: 0.5 }}>
                        Иск {new Intl.NumberFormat("ru-RU").format(sum)} ₽
                      </span>
                      <span style={{ color: "var(--gold-light)" }}>
                        → {new Intl.NumberFormat("ru-RU").format(fee)} ₽
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                className="w-full py-3.5 font-body text-xs tracking-widest uppercase transition-all duration-200"
                style={{ border: "1px solid rgba(201,168,76,0.35)", color: "var(--gold-light)" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.7)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)")}
                onClick={() => scrollTo("calculator")}
              >
                Рассчитать стоимость →
              </button>
            </div>

            {/* FNS block */}
            <div
              className="p-8 lg:p-10"
              style={{
                background: "var(--charcoal)",
                border: "1px solid rgba(201,168,76,0.18)",
              }}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="font-body text-xs tracking-widest uppercase mb-2" style={{ color: "var(--gold)", letterSpacing: "0.15em" }}>
                    Взаимодействие с ФНС
                  </p>
                  <h3 className="font-display text-2xl" style={{ color: "var(--mist)" }}>
                    Налоговые документы
                  </h3>
                  <p className="font-body text-xs mt-1" style={{ color: "var(--mist)", opacity: 0.4 }}>
                    фиксированная стоимость
                  </p>
                </div>
                <div style={{ color: "var(--gold)", opacity: 0.6 }}>
                  <Icon name="Landmark" size={24} />
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {[
                  { name: "Правовое заключение", price: "25 000 ₽", desc: "Анализ позиции + рекомендации" },
                  { name: "Возражение", price: "70 000 ₽", desc: "На акт или решение ФНС", highlight: true },
                  { name: "Ответ на письмо", price: "10 000 ₽", desc: "Запрос, требование, уведомление" },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-4 transition-all duration-200"
                    style={{
                      background: item.highlight ? "rgba(201,168,76,0.08)" : "rgba(201,168,76,0.04)",
                      border: `1px solid ${item.highlight ? "rgba(201,168,76,0.2)" : "rgba(201,168,76,0.08)"}`,
                    }}
                  >
                    <div>
                      <p className="font-body text-sm font-medium" style={{ color: "var(--mist)" }}>
                        {item.name}
                      </p>
                      <p className="font-body text-xs" style={{ color: "var(--mist)", opacity: 0.4 }}>
                        {item.desc}
                      </p>
                    </div>
                    <p
                      className="font-display text-xl flex-shrink-0 ml-4"
                      style={{ color: item.highlight ? "var(--gold-light)" : "var(--mist)", fontWeight: 300 }}
                    >
                      {item.price}
                    </p>
                  </div>
                ))}
              </div>

              <button className="btn-gold w-full py-3.5 text-xs">
                Отправить документ
              </button>
            </div>
          </div>

          {/* Estimate CTA */}
          <div
            className="mt-8 p-6 flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.12)" }}
          >
            <div>
              <p className="font-display text-lg" style={{ color: "var(--mist)" }}>
                Точная стоимость зависит от ситуации
              </p>
              <p className="font-body text-sm mt-1" style={{ color: "var(--mist)", opacity: 0.45 }}>
                Пришлите сумму иска или документ — рассчитаем за 1 минуту
              </p>
            </div>
            <button className="btn-gold flex-shrink-0 px-8 py-3.5 text-xs whitespace-nowrap">
              Получить расчёт
            </button>
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.15), transparent)" }} />
      </div>

      {/* ── CALCULATOR ──────────────────────────────────────────────────── */}
      <section id="calculator" className="py-24 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <p className="font-body text-xs tracking-widest uppercase mb-3" style={{ color: "var(--gold)", letterSpacing: "0.2em" }}>
              Интерактивный расчёт
            </p>
            <h2 className="font-display text-4xl lg:text-5xl font-light" style={{ color: "var(--mist)" }}>
              Калькулятор стоимости
            </h2>
            <div className="gold-line mt-5" />
          </div>
          <Calculator />
        </div>
      </section>

      {/* DIVIDER */}
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.15), transparent)" }} />
      </div>

      {/* ── HOW WE WORK ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="font-body text-xs tracking-widest uppercase mb-3" style={{ color: "var(--gold)", letterSpacing: "0.2em" }}>
              Процесс
            </p>
            <h2 className="font-display text-4xl lg:text-5xl font-light" style={{ color: "var(--mist)" }}>
              Как мы работаем
            </h2>
            <div className="gold-line mt-5" />
          </div>

          <div className="grid md:grid-cols-3 gap-px" style={{ background: "rgba(201,168,76,0.08)" }}>
            {[
              {
                num: "01",
                icon: "Upload",
                title: "Отправляете документ",
                desc: "Прикрепляете файл или описываете ситуацию. Принимаем в мессенджерах, email или через форму.",
              },
              {
                num: "02",
                icon: "Search",
                title: "Мы анализируем",
                desc: "Изучаем материалы, проверяем судебную практику, определяем сильную правовую позицию.",
              },
              {
                num: "03",
                icon: "CheckCircle",
                title: "Готово за 24 часа",
                desc: "Передаём готовый документ. При необходимости — подаём в суд или ведомство от вашего имени.",
              },
            ].map((step) => (
              <div key={step.num} className="service-card p-8 lg:p-10">
                <div className="flex items-start justify-between mb-6">
                  <span
                    className="font-display text-5xl"
                    style={{ color: "rgba(201,168,76,0.12)", fontWeight: 300, lineHeight: 1 }}
                  >
                    {step.num}
                  </span>
                  <span style={{ color: "var(--gold)", opacity: 0.7 }}>
                    <Icon name={step.icon} size={20} />
                  </span>
                </div>
                <p className="font-display text-xl mb-3" style={{ color: "var(--mist)" }}>
                  {step.title}
                </p>
                <p className="font-body text-sm leading-6" style={{ color: "var(--mist)", opacity: 0.45 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button className="btn-gold px-10 py-4">Получить решение</button>
          </div>
        </div>
      </section>

      {/* ── RISK BLOCK ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div
            className="p-10 lg:p-14 relative overflow-hidden"
            style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.15)" }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)" }}
            />

            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <p className="font-body text-xs tracking-widest uppercase mb-4" style={{ color: "var(--gold)", letterSpacing: "0.2em" }}>
                  Цена ошибки
                </p>
                <h2 className="font-display text-3xl lg:text-4xl font-light mb-6" style={{ color: "var(--mist)" }}>
                  Ошибка в документе<br />
                  <span style={{ color: "var(--gold-light)", fontStyle: "italic" }}>может стоить дорого</span>
                </h2>
                <button className="btn-gold px-8 py-4">Отправить документ</button>
              </div>

              <div className="space-y-4">
                {[
                  { icon: "TrendingDown", text: "Проигрыш в суде из-за процессуальных ошибок" },
                  { icon: "AlertTriangle", text: "Доначисления и штрафы от налоговых органов" },
                  { icon: "Clock", text: "Пропуск сроков → потеря права на защиту" },
                ].map((r) => (
                  <div key={r.text} className="flex items-start gap-4">
                    <div
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center"
                      style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)" }}
                    >
                      <Icon name={r.icon} size={14} />
                    </div>
                    <p className="font-body text-sm leading-6 pt-1" style={{ color: "var(--mist)", opacity: 0.55 }}>
                      {r.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── IP BLOCK ────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-body text-xs tracking-widest uppercase mb-4" style={{ color: "var(--gold)", letterSpacing: "0.2em" }}>
                Доп. услуга
              </p>
              <h2 className="font-display text-3xl lg:text-4xl font-light mb-4" style={{ color: "var(--mist)" }}>
                Защита интеллектуальной собственности
              </h2>
              <div className="gold-line mb-6" />
              <p className="font-body text-sm leading-7 mb-8" style={{ color: "var(--mist)", opacity: 0.45 }}>
                Споры о нарушении авторских прав, защита товарных знаков, борьба с незаконным копированием. Полное юридическое сопровождение под ключ.
              </p>
              <button
                className="font-body text-xs tracking-widest uppercase px-8 py-3.5 transition-all duration-200"
                style={{ border: "1px solid rgba(201,168,76,0.3)", color: "var(--gold-light)" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.7)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)")}
              >
                Узнать подробнее
              </button>
            </div>

            <div className="space-y-3">
              {[
                { icon: "Copyright", title: "Судебные споры по ИС", desc: "Отзывы, возражения, иски" },
                { icon: "Tag", title: "Товарные знаки", desc: "Регистрация и защита" },
                { icon: "Copy", title: "Незаконное копирование", desc: "Пресечение нарушений" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-5 p-5 transition-all duration-200"
                  style={{ background: "var(--charcoal)", border: "1px solid rgba(201,168,76,0.1)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.1)")}
                >
                  <div className="flex-shrink-0" style={{ color: "var(--gold)", opacity: 0.7 }}>
                    <Icon name={item.icon} size={18} />
                  </div>
                  <div>
                    <p className="font-body text-sm font-medium" style={{ color: "var(--mist)" }}>{item.title}</p>
                    <p className="font-body text-xs" style={{ color: "var(--mist)", opacity: 0.4 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-16">
            <div>
              <p className="font-body text-xs tracking-widest uppercase mb-3" style={{ color: "var(--gold)", letterSpacing: "0.2em" }}>
                Ответы
              </p>
              <h2 className="font-display text-4xl font-light" style={{ color: "var(--mist)" }}>
                Часто задаваемые вопросы
              </h2>
              <div className="gold-line mt-5" />
              <p className="mt-5 font-body text-sm leading-7" style={{ color: "var(--mist)", opacity: 0.4 }}>
                Не нашли ответ? Напишите нам — ответим за 1 час.
              </p>
              <button className="btn-gold mt-6 px-7 py-3 text-xs">Задать вопрос</button>
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
      <section className="py-20 px-6 md:px-10 pb-28 md:pb-20">
        <div className="max-w-6xl mx-auto">
          <div
            className="p-12 lg:p-16 text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(201,168,76,0.07) 0%, rgba(201,168,76,0.03) 100%)",
              border: "1px solid rgba(201,168,76,0.2)",
            }}
          >
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px"
              style={{ background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }}
            />
            <p className="font-body text-xs tracking-widest uppercase mb-4" style={{ color: "var(--gold)", letterSpacing: "0.2em" }}>
              Начать работу
            </p>
            <h2 className="font-display text-4xl lg:text-5xl font-light mb-4" style={{ color: "var(--mist)" }}>
              Разберём вашу ситуацию{" "}
              <span style={{ color: "var(--gold-light)", fontStyle: "italic" }}>сегодня</span>
            </h2>
            <p className="font-body text-sm mb-10 max-w-md mx-auto" style={{ color: "var(--mist)", opacity: 0.45 }}>
              Отправьте документ — скажем, как действовать
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="flex items-center justify-center gap-3 px-10 py-4 font-body font-medium text-xs tracking-widest uppercase transition-all duration-200"
                style={{ background: "#25D366", color: "#fff" }}
              >
                <Icon name="MessageCircle" size={16} />
                WhatsApp
              </button>
              <button
                className="flex items-center justify-center gap-3 px-10 py-4 font-body font-medium text-xs tracking-widest uppercase transition-all duration-200"
                style={{ background: "#229ED9", color: "#fff" }}
              >
                <Icon name="Send" size={16} />
                Telegram
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6 md:px-10" style={{ borderTop: "1px solid rgba(201,168,76,0.07)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="w-5 h-px" style={{ background: "var(--gold-dim)" }} />
            <span className="font-display text-base tracking-widest" style={{ color: "var(--gold-dim)" }}>LEGIS</span>
            <div className="w-5 h-px" style={{ background: "var(--gold-dim)" }} />
          </div>
          <p className="font-body text-xs" style={{ color: "var(--mist)", opacity: 0.25 }}>
            © 2024 LEGIS. Адвокатское бюро. Все права защищены.
          </p>
          <div className="flex gap-5 font-body text-xs" style={{ color: "var(--mist)", opacity: 0.25 }}>
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
          background: "rgba(14,12,10,0.97)",
          borderTop: "1px solid rgba(201,168,76,0.15)",
        }}
      >
        <button className="btn-gold w-full py-4 text-xs">
          Отправить документ
        </button>
      </div>
    </div>
  );
};

export default Index;
