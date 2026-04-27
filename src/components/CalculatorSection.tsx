import { useState, useEffect, useRef } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

function calcIS(amount: number): number {
  if (amount <= 0) return 0;
  if (amount <= 500000) {
    return Math.max(amount * 0.1, 20000);
  }
  return 50000 + (amount - 500000) * 0.02;
}

function Calculator({ onOpenModal }: { onOpenModal: () => void }) {
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
        background: "var(--bg-white)",
        border: "1px solid var(--border-c)",
        borderRadius: 8,
      }}
    >
      <p
        className="font-body text-xs tracking-widest uppercase mb-6"
        style={{ color: "var(--blue)", letterSpacing: "0.2em" }}
      >
        Калькулятор — интеллектуальная собственность
      </p>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Left: slider */}
        <div>
          <div className="flex justify-between items-end mb-4 gap-3">
            <span className="font-body text-sm" style={{ color: "var(--text-muted)" }}>
              Сумма иска
            </span>
            <span className="font-display text-2xl font-bold flex-shrink-0" style={{ color: "var(--navy)" }}>
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
          <div className="flex justify-between font-body text-xs" style={{ color: "var(--text-muted)" }}>
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
                  border: `1px solid ${amount === ex.sum ? "var(--blue)" : "var(--border-c)"}`,
                  color: amount === ex.sum ? "#fff" : "var(--text)",
                  background: amount === ex.sum ? "var(--blue)" : "transparent",
                  borderRadius: 4,
                  fontWeight: amount === ex.sum ? 600 : 400,
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
              background: "var(--bg)",
              border: "1px solid var(--border-c)",
              color: "var(--text-muted)",
              borderRadius: 6,
            }}
          >
            <strong style={{ color: "var(--navy)" }}>Формула:</strong>
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
              style={{ color: "var(--text-muted)" }}
            >
              Стоимость представительства
            </p>
            <p
              className="font-display mb-1"
              style={{
                fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                fontWeight: 700,
                color: "var(--success)",
                lineHeight: 1,
              }}
            >
              {formatRub(fee)}
            </p>
            <p className="font-body text-xs mt-3" style={{ color: "var(--text-muted)" }}>
              анализ + подготовка + подача документов · под ключ
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <button className="btn-gold w-full py-4 text-xs" onClick={onOpenModal}>
              Отправить документ
            </button>
            <p
              className="font-body text-xs text-center"
              style={{ color: "var(--text-muted)" }}
            >
              Точная стоимость — после изучения материалов
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CalculatorSection({ onOpenModal }: { onOpenModal: () => void }) {
  const ref = useScrollReveal();
  return (
    <section ref={ref as React.Ref<HTMLElement>} id="calculator" className="reveal py-24 px-6 md:px-10" style={{ background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <p
            className="font-body text-xs tracking-widest uppercase mb-3"
            style={{ color: "var(--blue)", letterSpacing: "0.2em" }}
          >
            Интерактивный расчёт
          </p>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-5xl" style={{ color: "var(--navy)" }}>
            Калькулятор стоимости
          </h2>
          <div className="gold-line mt-5" />
        </div>
        <Calculator onOpenModal={onOpenModal} />
      </div>
    </section>
  );
}