import Icon from "@/components/ui/icon";

interface LawComparisonCasesProps {
  onOpenModal: () => void;
}

function LawComparison({ onOpenModal }: LawComparisonCasesProps) {
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

function LawCases({ onOpenModal }: LawComparisonCasesProps) {
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

export { LawComparison, LawCases };
