import Icon from "@/components/ui/icon";

interface LawPricesProps {
  onOpenModal: () => void;
  onScrollTo: (id: string) => void;
}

export default function LawPrices({ onOpenModal }: LawPricesProps) {
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
