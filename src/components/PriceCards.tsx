import Icon from "@/components/ui/icon";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface PriceCardsProps {
  onScrollTo: (id: string) => void;
  onOpenModal: () => void;
}

export default function PriceCards({ onScrollTo, onOpenModal }: PriceCardsProps) {
  const ref = useScrollReveal();
  return (
    <section ref={ref as React.Ref<HTMLElement>} id="price"
      className="reveal py-24 px-6 md:px-12"
      style={{ background: "var(--dark)" }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-px" style={{ background: "var(--gold)" }} />
            <span className="font-body text-xs tracking-widest uppercase" style={{ color: "var(--gold)", letterSpacing: "0.2em" }}>
              Прозрачное ценообразование
            </span>
          </div>
          <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", color: "#fff", fontWeight: 700 }}>
            Стоимость услуг
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">

          {/* IS block */}
          <div className="p-8 lg:p-10 rounded relative overflow-hidden"
            style={{ background: "var(--dark-card)", border: "1px solid rgba(212,175,55,0.15)" }}>
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: "linear-gradient(90deg, var(--gold), transparent)" }} />

            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="font-body text-xs tracking-widest uppercase mb-2" style={{ color: "var(--gold)", letterSpacing: "0.15em" }}>
                  Интеллектуальная собственность
                </p>
                <h3 className="font-display text-2xl" style={{ color: "#fff" }}>
                  Отзыв в суд — под ключ
                </h3>
                <p className="font-body text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  анализ · подготовка · подача
                </p>
              </div>
              <div className="w-10 h-10 flex items-center justify-center rounded flex-shrink-0"
                style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)" }}>
                <Icon name="BookOpen" size={18} style={{ color: "var(--gold)" }} />
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { label: "До 500 000 ₽",    sub: "мин. 20 000 ₽",              val: "10%" },
                { label: "Свыше 500 000 ₽", sub: "+ 2% от суммы превышения",   val: "50 000 ₽" },
              ].map(tier => (
                <div key={tier.label} className="flex items-center justify-between gap-3 p-4 rounded"
                  style={{ background: "var(--dark-card-2)", border: "1px solid rgba(212,175,55,0.08)" }}>
                  <div>
                    <p className="font-body text-sm font-medium" style={{ color: "#fff" }}>{tier.label}</p>
                    <p className="font-body text-xs" style={{ color: "var(--text-muted)" }}>{tier.sub}</p>
                  </div>
                  <p className="font-display text-xl flex-shrink-0 font-bold" style={{ color: "var(--gold)" }}>
                    {tier.val}
                  </p>
                </div>
              ))}
            </div>

            {/* Examples */}
            <div className="p-4 mb-6 rounded" style={{ background: "var(--dark-card-2)", border: "1px solid rgba(212,175,55,0.08)" }}>
              <p className="font-body text-xs tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>Примеры</p>
              <div className="space-y-2">
                {[[300000, 30000], [450000, 45000], [700000, 54000]].map(([sum, fee]) => (
                  <div key={sum} className="flex justify-between gap-2 font-body text-sm">
                    <span style={{ color: "var(--text-muted)" }}>
                      Иск {new Intl.NumberFormat("ru-RU").format(sum)} ₽
                    </span>
                    <span className="flex-shrink-0 font-semibold" style={{ color: "var(--gold)" }}>
                      → {new Intl.NumberFormat("ru-RU").format(fee)} ₽
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn-outline w-full py-3.5 font-body text-xs font-semibold tracking-widest uppercase"
              onClick={() => onScrollTo("calculator")}>
              Рассчитать стоимость →
            </button>
          </div>

          {/* FNS block */}
          <div className="p-8 lg:p-10 rounded relative overflow-hidden"
            style={{ background: "var(--dark-card)", border: "1px solid rgba(212,175,55,0.15)" }}>
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, var(--gold))" }} />

            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="font-body text-xs tracking-widest uppercase mb-2" style={{ color: "var(--gold)", letterSpacing: "0.15em" }}>
                  Взаимодействие с ФНС
                </p>
                <h3 className="font-display text-2xl" style={{ color: "#fff" }}>
                  Налоговые документы
                </h3>
                <p className="font-body text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  фиксированная стоимость
                </p>
              </div>
              <div className="w-10 h-10 flex items-center justify-center rounded flex-shrink-0"
                style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)" }}>
                <Icon name="Landmark" size={18} style={{ color: "var(--gold)" }} />
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {[
                { name: "Правовое заключение", price: "25 000 ₽", desc: "Анализ позиции + рекомендации",  highlight: false },
                { name: "Возражение",          price: "70 000 ₽", desc: "На акт или решение ФНС",         highlight: true  },
                { name: "Ответ на письмо",     price: "10 000 ₽", desc: "Запрос, требование, уведомление", highlight: false },
              ].map(item => (
                <div key={item.name}
                  className="flex items-center justify-between gap-3 p-4 rounded transition-all duration-200"
                  style={{
                    background: item.highlight ? "rgba(212,175,55,0.06)" : "var(--dark-card-2)",
                    border: `1px solid ${item.highlight ? "rgba(212,175,55,0.3)" : "rgba(212,175,55,0.08)"}`,
                  }}>
                  <div>
                    <p className="font-body text-sm font-medium" style={{ color: "#fff" }}>{item.name}</p>
                    <p className="font-body text-xs" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
                  </div>
                  <p className="font-display text-lg flex-shrink-0 font-bold" style={{ color: item.highlight ? "var(--gold)" : "rgba(232,228,220,0.6)" }}>
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
