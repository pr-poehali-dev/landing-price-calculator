import Icon from "@/components/ui/icon";

interface PriceCardsProps {
  onScrollTo: (id: string) => void;
}

export default function PriceCards({ onScrollTo }: PriceCardsProps) {
  return (
    <section id="price" className="py-24 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p
            className="font-body text-xs tracking-widest uppercase mb-3"
            style={{ color: "var(--red)", letterSpacing: "0.2em" }}
          >
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
            style={{ background: "var(--charcoal)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <p
                  className="font-body text-xs tracking-widest uppercase mb-2"
                  style={{ color: "var(--red)", letterSpacing: "0.15em" }}
                >
                  Интеллектуальная собственность
                </p>
                <h3 className="font-display text-2xl" style={{ color: "var(--mist)" }}>
                  Отзыв в суд — под ключ
                </h3>
                <p className="font-body text-xs mt-1" style={{ color: "var(--mist)", opacity: 0.4 }}>
                  анализ · подготовка · подача
                </p>
              </div>
              <div style={{ color: "var(--red)", opacity: 0.7 }}>
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
                  className="flex items-center justify-between p-4"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div>
                    <p className="font-body text-sm" style={{ color: "var(--mist)" }}>{tier.label}</p>
                    <p className="font-body text-xs" style={{ color: "var(--mist)", opacity: 0.4 }}>{tier.sub}</p>
                  </div>
                  <p className="font-display text-2xl" style={{ color: "var(--red)", fontWeight: 300 }}>
                    {tier.val}
                  </p>
                </div>
              ))}
            </div>

            {/* Examples */}
            <div
              className="p-4 mb-6"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p
                className="font-body text-xs tracking-widest uppercase mb-3"
                style={{ color: "var(--mist-dim)" }}
              >
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
                    <span style={{ color: "var(--red)" }}>
                      → {new Intl.NumberFormat("ru-RU").format(fee)} ₽
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              className="w-full py-3.5 font-body text-xs tracking-widest uppercase transition-all duration-200"
              style={{ border: "1px solid rgba(239,68,68,0.4)", color: "var(--red)" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(239,68,68,0.8)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)")}
              onClick={() => onScrollTo("calculator")}
            >
              Рассчитать стоимость →
            </button>
          </div>

          {/* FNS block */}
          <div
            className="p-8 lg:p-10"
            style={{ background: "var(--charcoal)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <p
                  className="font-body text-xs tracking-widest uppercase mb-2"
                  style={{ color: "var(--red)", letterSpacing: "0.15em" }}
                >
                  Взаимодействие с ФНС
                </p>
                <h3 className="font-display text-2xl" style={{ color: "var(--mist)" }}>
                  Налоговые документы
                </h3>
                <p className="font-body text-xs mt-1" style={{ color: "var(--mist)", opacity: 0.4 }}>
                  фиксированная стоимость
                </p>
              </div>
              <div style={{ color: "var(--red)", opacity: 0.7 }}>
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
                  className="flex items-center justify-between p-4 transition-all duration-200"
                  style={{
                    background: item.highlight ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${item.highlight ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.07)"}`,
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
                    style={{ color: item.highlight ? "var(--red)" : "var(--mist)", fontWeight: 300 }}
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
      </div>
    </section>
  );
}
