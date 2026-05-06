import Icon from "@/components/ui/icon";

interface LawSectionProps {
  onOpenModal: () => void;
  onScrollTo: (id: string) => void;
}

const DIVIDER = (
  <div className="max-w-6xl mx-auto px-6 md:px-10">
    <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
  </div>
);

/* ── 1. ДЛЯ ЮРИСТОВ И АДВОКАТОВ ──────────────────────────────── */
function LawyersHero({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <section
      id="lawyers"
      style={{ background: "var(--dark)", paddingTop: 96, paddingBottom: 96 }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        {/* Label */}
        <div className="flex items-center gap-3 mb-8">
          <div className="gold-line" />
          <span
            style={{
              color: "var(--gold)",
              fontSize: "0.65rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Для юристов и адвокатов
          </span>
        </div>

        {/* Heading */}
        <h2
          className="font-display mb-4"
          style={{
            color: "var(--text)",
            fontSize: "clamp(1.6rem, 4vw, 2.6rem)",
            fontWeight: 700,
            lineHeight: 1.2,
            maxWidth: 700,
          }}
        >
          Аутсорсинг подготовки юридических документов для юристов и адвокатов
        </h2>
        <p
          className="mb-12"
          style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: 560 }}
        >
          Передавайте подготовку документов — получайте результат за 24 часа
        </p>

        {/* Документы */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { icon: "FileText", label: "Иски" },
            { icon: "FileCheck", label: "Отзывы" },
            { icon: "Landmark", label: "Документы по налоговым спорам (ФНС)" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="service-card flex items-center gap-4"
              style={{ padding: "20px 24px", borderRadius: 6 }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 4,
                  background: "var(--gold-dim)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon name={icon} size={18} style={{ color: "var(--gold)" }} />
              </div>
              <span style={{ color: "var(--text)", fontWeight: 500, fontSize: "0.95rem" }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Преимущества */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "Star", title: "Приоритетное обслуживание", desc: "Ваши заявки берём в работу первыми" },
            { icon: "Clock", title: "Срок от 24 часов", desc: "Документ готов уже на следующий день" },
            { icon: "Zap", title: "Работа под дедлайны", desc: "Знаем цену времени в судебном споре" },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              style={{
                padding: "28px 24px",
                background: "var(--dark-card)",
                border: "1px solid rgba(212,175,55,0.12)",
                borderRadius: 6,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 4,
                  background: "var(--gold-dim)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Icon name={icon} size={20} style={{ color: "var(--gold)" }} />
              </div>
              <div style={{ color: "var(--text)", fontWeight: 600, marginBottom: 6, fontSize: "0.95rem" }}>
                {title}
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>
                {desc}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 mt-10">
          <button className="btn-gold px-8 py-3 text-xs" onClick={onOpenModal}>
            Отправить документы
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── 2. УСЛУГИ И ЦЕНЫ ─────────────────────────────────────────── */
function LawPrices({ onOpenModal, onScrollTo }: LawSectionProps) {
  const services = [
    { title: "Анализ дела", price: "10 000 ₽", desc: "Профессиональная оценка позиции и перспектив" },
    { title: "Отзыв / процессуальный документ", price: "10 000 ₽", desc: "Подготовка правовой позиции по делу" },
    { title: "Иск по налоговому спору", price: "19 900 ₽", desc: "Полноценный иск с правовым обоснованием" },
  ];

  return (
    <section style={{ background: "var(--dark-card)", paddingTop: 96, paddingBottom: 96 }}>
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="gold-line" />
          <span style={{ color: "var(--gold)", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}>
            Услуги и цены
          </span>
        </div>

        <h2
          className="font-display mb-12"
          style={{ color: "var(--text)", fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, lineHeight: 1.2 }}
        >
          Прозрачное ценообразование
        </h2>

        {/* Одиночные услуги */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {services.map(({ title, price, desc }) => (
            <div
              key={title}
              className="service-card"
              style={{ padding: "28px 24px", borderRadius: 6 }}
            >
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
                Услуга
              </div>
              <div style={{ color: "var(--text)", fontWeight: 600, fontSize: "1rem", marginBottom: 16, lineHeight: 1.4 }}>
                {title}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.5 }}>
                {desc}
              </div>
              <div style={{ color: "var(--gold)", fontWeight: 700, fontSize: "1.3rem" }}>
                {price}
              </div>
            </div>
          ))}
        </div>

        {/* Пакет */}
        <div
          style={{
            background: "linear-gradient(135deg, #0d1526 0%, #111d33 100%)",
            border: "1px solid rgba(212,175,55,0.3)",
            borderRadius: 8,
            padding: "40px 36px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 200,
              height: 200,
              background: "radial-gradient(circle at top right, rgba(212,175,55,0.06), transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ display: "inline-block", background: "var(--gold)", color: "#080f1e", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, padding: "4px 12px", borderRadius: 2, marginBottom: 20 }}>
            Пакет
          </div>

          <div className="flex flex-wrap items-start justify-between gap-8">
            <div style={{ flex: 1, minWidth: 240 }}>
              <h3 style={{ color: "var(--text)", fontWeight: 700, fontSize: "1.3rem", marginBottom: 8 }}>
                Акт ФНС + Иск
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 20, lineHeight: 1.6 }}>
                Единая правовая позиция: от анализа акта до подачи иска
              </p>
              <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["Анализ акта ФНС", "Подготовка иска", "Единая правовая позиция"].map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Icon name="Check" size={14} style={{ color: "var(--gold)", flexShrink: 0 }} />
                    <span style={{ color: "var(--text)", fontSize: "0.9rem" }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", textDecoration: "line-through" }}>
                30 000 ₽
              </div>
              <div style={{ color: "var(--gold)", fontWeight: 700, fontSize: "2rem" }}>
                25 000 ₽
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: 16 }}>
                экономия 5 000 ₽
              </div>
              <button className="btn-gold px-8 py-3 text-xs" onClick={onOpenModal}>
                Оформить пакет
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 3. СРАВНЕНИЕ ─────────────────────────────────────────────── */
function LawComparison({ onOpenModal }: { onOpenModal: () => void }) {
  const self = [
    "3–6 часов на подготовку",
    "Отвлекаетесь от клиента",
    "Риск ошибок",
    "Нет второго взгляда",
  ];
  const us = [
    "Документ за 24 часа",
    "Фокус на стратегии",
    "Готовая позиция",
    "Работа под дедлайн",
  ];

  return (
    <section style={{ background: "var(--dark)", paddingTop: 96, paddingBottom: 96 }}>
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="gold-line" />
          <span style={{ color: "var(--gold)", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}>
            Сравнение
          </span>
        </div>

        <h2
          className="font-display mb-12"
          style={{ color: "var(--text)", fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, lineHeight: 1.2 }}
        >
          Готовите документы сами или передаёте нам?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Самостоятельно */}
          <div
            style={{
              background: "var(--dark-card)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 8,
              padding: "32px 28px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="User" size={16} style={{ color: "var(--text-muted)" }} />
              </div>
              <span style={{ color: "var(--text-muted)", fontWeight: 600, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Самостоятельно
              </span>
            </div>
            <ul style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {self.map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Icon name="X" size={14} style={{ color: "rgba(255,80,80,0.7)", flexShrink: 0, marginTop: 2 }} />
                  <span style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.5 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Через нас */}
          <div
            style={{
              background: "var(--dark-card)",
              border: "1px solid rgba(212,175,55,0.25)",
              borderRadius: 8,
              padding: "32px 28px",
              boxShadow: "0 0 40px rgba(212,175,55,0.05)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--gold-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="Briefcase" size={16} style={{ color: "var(--gold)" }} />
              </div>
              <span style={{ color: "var(--gold)", fontWeight: 600, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Через нас
              </span>
            </div>
            <ul style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {us.map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Icon name="Check" size={14} style={{ color: "var(--gold)", flexShrink: 0, marginTop: 2 }} />
                  <span style={{ color: "var(--text)", fontSize: "0.9rem", lineHeight: 1.5 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontStyle: "italic", textAlign: "center" }}>
          Вы ведёте дело — мы готовим документы
        </p>
      </div>
    </section>
  );
}

/* ── 4. КЕЙСЫ ─────────────────────────────────────────────────── */
function LawCases({ onOpenModal }: { onOpenModal: () => void }) {
  const cases = [
    { icon: "FileText", title: "Отзыв на иск", time: "24 часа", desc: "Подготовили развёрнутую правовую позицию для суда" },
    { icon: "Landmark", title: "Иск по ФНС", time: "24 часа", desc: "Оспорили решение налогового органа в арбитраже" },
    { icon: "Edit3", title: "Доработка позиции", time: "24 часа", desc: "Усилили аргументацию накануне заседания" },
    { icon: "Zap", title: "Срочный дедлайн", time: "< 24 часов", desc: "Документ сдан раньше установленного срока" },
  ];

  const triggers = ["Срочно", "Нет времени", "Сложный спор"];

  return (
    <section style={{ background: "var(--dark-card)", paddingTop: 96, paddingBottom: 96 }}>
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="gold-line" />
          <span style={{ color: "var(--gold)", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}>
            Кейсы
          </span>
        </div>

        <h2
          className="font-display mb-12"
          style={{ color: "var(--text)", fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, lineHeight: 1.2 }}
        >
          Примеры задач
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {cases.map(({ icon, title, time, desc }) => (
            <div
              key={title}
              className="service-card"
              style={{ padding: "24px 20px", borderRadius: 6 }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 4,
                  background: "var(--gold-dim)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Icon name={icon} size={18} style={{ color: "var(--gold)" }} />
              </div>
              <div style={{ color: "var(--text)", fontWeight: 600, fontSize: "0.9rem", marginBottom: 6 }}>
                {title}
              </div>
              <div
                style={{
                  display: "inline-block",
                  background: "var(--gold-dim)",
                  color: "var(--gold)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.1em",
                  fontWeight: 600,
                  padding: "2px 10px",
                  borderRadius: 2,
                  marginBottom: 12,
                }}
              >
                {time}
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", lineHeight: 1.6 }}>
                {desc}
              </div>
            </div>
          ))}
        </div>

        {/* Когда обращаются */}
        <div
          style={{
            background: "var(--dark)",
            border: "1px solid rgba(212,175,55,0.1)",
            borderRadius: 6,
            padding: "28px 28px",
          }}
        >
          <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>
            Когда обращаются
          </div>
          <div className="flex flex-wrap gap-3">
            {triggers.map((t) => (
              <span
                key={t}
                style={{
                  border: "1px solid rgba(212,175,55,0.3)",
                  color: "var(--gold)",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  padding: "8px 18px",
                  borderRadius: 4,
                  background: "var(--gold-dim)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 5. ДОЖИМАЮЩИЙ БЛОК ───────────────────────────────────────── */
function LawCTA({ onOpenModal, onScrollTo }: LawSectionProps) {
  return (
    <section style={{ background: "var(--dark)", paddingTop: 96, paddingBottom: 96 }}>
      <div className="max-w-6xl mx-auto px-6 md:px-10 text-center">
        <h2
          className="font-display mb-5"
          style={{
            color: "var(--text)",
            fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          Нет времени готовить документы?
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", marginBottom: 40, maxWidth: 480, margin: "0 auto 40px" }}>
          Передайте задачу — подготовим быстро и по делу
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="btn-gold px-10 py-3 text-xs" onClick={onOpenModal}>
            Отправить документы
          </button>
          <button
            className="btn-outline px-10 py-3 text-xs"
            onClick={() => onScrollTo("lawyers")}
          >
            Рассчитать стоимость
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── EXPORT ───────────────────────────────────────────────────── */
export default function LawSection({ onOpenModal, onScrollTo }: LawSectionProps) {
  return (
    <>
      {DIVIDER}
      <LawyersHero onOpenModal={onOpenModal} />
      {DIVIDER}
      <LawPrices onOpenModal={onOpenModal} onScrollTo={onScrollTo} />
      {DIVIDER}
      <LawComparison onOpenModal={onOpenModal} />
      {DIVIDER}
      <LawCases onOpenModal={onOpenModal} />
      {DIVIDER}
      <LawCTA onOpenModal={onOpenModal} onScrollTo={onScrollTo} />
    </>
  );
}