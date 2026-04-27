import Icon from "@/components/ui/icon";

interface PriceCardsProps {
  onScrollTo: (id: string) => void;
  onOpenModal: () => void;
}

export default function PriceCards({ onScrollTo, onOpenModal }: PriceCardsProps) {
  return (
    <section id="price" className="py-24 px-6 md:px-10" style={{ background: "var(--bg-white)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p
            className="font-body text-xs tracking-widest uppercase mb-3"
            style={{ color: "var(--blue)", letterSpacing: "0.2em" }}
          >
            Прозрачное ценообразование
          </p>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-5xl" style={{ color: "var(--navy)" }}>
            Стоимость услуг
          </h2>
          <div className="gold-line mt-5" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* IS block */}
          <div
            className="p-8 lg:p-10"
            style={{ background: "var(--bg)", border: "1px solid var(--border-c)", borderRadius: 8 }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <p
                  className="font-body text-xs tracking-widest uppercase mb-2"
                  style={{ color: "var(--blue)", letterSpacing: "0.15em" }}
                >
                  Интеллектуальная собственность
                </p>
                <h3 className="font-display text-2xl" style={{ color: "var(--navy)" }}>
                  Отзыв в суд — под ключ
                </h3>
                <p className="font-body text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  анализ · подготовка · подача
                </p>
              </div>
              <div style={{ color: "var(--blue)", opacity: 0.7 }}>
                <Icon name="BookOpen" size={24} />
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { label: "До 500 000 ₽", sub: "мин. 20 000 ₽", val: "10%" },
                { label: "Свыше 500 000 ₽", sub: "+ 2% от суммы превышения", val: "50 000 ₽" },
              ].map((tier) => (
                <div
                  key={tier.label}
                  className="flex items-center justify-between gap-3 p-4"
                  style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)", borderRadius: 6 }}
                >
                  <div className="min-w-0">
                    <p className="font-body text-sm font-medium" style={{ color: "var(--text)" }}>{tier.label}</p>
                    <p className="font-body text-xs" style={{ color: "var(--text-muted)" }}>{tier.sub}</p>
                  </div>
                  <p className="font-display text-xl flex-shrink-0" style={{ color: "var(--navy)", fontWeight: 700 }}>
                    {tier.val}
                  </p>
                </div>
              ))}
            </div>

            {/* Examples */}
            <div
              className="p-4 mb-6"
              style={{ background: "var(--bg-white)", border: "1px solid var(--border-c)", borderRadius: 6 }}
            >
              <p
                className="font-body text-xs tracking-widest uppercase mb-3"
                style={{ color: "var(--text-muted)" }}
              >
                Примеры
              </p>
              <div className="space-y-2">
                {[
                  [300000, 30000],
                  [450000, 45000],
                  [700000, 54000],
                ].map(([sum, fee]) => (
                  <div key={sum} className="flex justify-between gap-2 font-body text-sm">
                    <span style={{ color: "var(--text-muted)" }}>
                      Иск {new Intl.NumberFormat("ru-RU").format(sum)} ₽
                    </span>
                    <span className="flex-shrink-0" style={{ color: "var(--success)", fontWeight: 600 }}>
                      → {new Intl.NumberFormat("ru-RU").format(fee)} ₽
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              className="btn-outline w-full py-3.5 font-body text-xs font-semibold tracking-widest uppercase"
              style={{
                border: "1px solid var(--blue)",
                color: "var(--blue)",
                borderRadius: 6,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--blue)";
                (e.currentTarget as HTMLButtonElement).style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--blue)";
              }}
              onClick={() => onScrollTo("calculator")}
            >
              Рассчитать стоимость →
            </button>
          </div>

          {/* FNS block */}
          <div
            className="p-8 lg:p-10"
            style={{ background: "var(--bg)", border: "1px solid var(--border-c)", borderRadius: 8 }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <p
                  className="font-body text-xs tracking-widest uppercase mb-2"
                  style={{ color: "var(--blue)", letterSpacing: "0.15em" }}
                >
                  Взаимодействие с ФНС
                </p>
                <h3 className="font-display text-2xl" style={{ color: "var(--navy)" }}>
                  Налоговые документы
                </h3>
                <p className="font-body text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  фиксированная стоимость
                </p>
              </div>
              <div style={{ color: "var(--blue)", opacity: 0.7 }}>
                <Icon name="Landmark" size={24} />
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {[
                { name: "Правовое заключение", price: "25 000 ₽", desc: "Анализ позиции + рекомендации", highlight: false },
                { name: "Возражение", price: "70 000 ₽", desc: "На акт или решение ФНС", highlight: true },
                { name: "Ответ на письмо", price: "10 000 ₽", desc: "Запрос, требование, уведомление", highlight: false },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-3 p-4 transition-all duration-200"
                  style={{
                    background: item.highlight ? "rgba(37,99,235,0.06)" : "var(--bg-white)",
                    border: `1px solid ${item.highlight ? "rgba(37,99,235,0.2)" : "var(--border-c)"}`,
                    borderRadius: 6,
                  }}
                >
                  <div>
                    <p className="font-body text-sm font-medium" style={{ color: "var(--text)" }}>
                      {item.name}
                    </p>
                    <p className="font-body text-xs" style={{ color: "var(--text-muted)" }}>
                      {item.desc}
                    </p>
                  </div>
                  <p
                    className="font-display text-lg flex-shrink-0"
                    style={{ color: item.highlight ? "var(--navy)" : "var(--text)", fontWeight: 700 }}
                  >
                    {item.price}
                  </p>
                </div>
              ))}
            </div>

            <button className="btn-gold w-full py-3.5 text-xs" onClick={onOpenModal}>
              Отправить документ
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}