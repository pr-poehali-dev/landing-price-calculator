import Icon from "@/components/ui/icon";

interface LawyersHeroProps {
  onOpenModal: () => void;
}

export default function LawyersHero({ onOpenModal }: LawyersHeroProps) {
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
