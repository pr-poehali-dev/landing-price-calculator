import Icon from "@/components/ui/icon";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function ProcessSection({ onOpenModal }: { onOpenModal: () => void }) {
  const ref1 = useScrollReveal();
  const ref2 = useScrollReveal();
  const ref3 = useScrollReveal();
  return (
    <>
      {/* ── HOW WE WORK ─────────────────────────────────────────────────── */}
      <section ref={ref1 as React.Ref<HTMLElement>} className="reveal py-24 px-6 md:px-10" style={{ background: "var(--bg)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p
              className="font-body text-xs tracking-widest uppercase mb-3"
              style={{ color: "var(--blue)", letterSpacing: "0.2em" }}
            >
              Процесс
            </p>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-5xl" style={{ color: "var(--navy)" }}>
              Как мы работаем
            </h2>
            <div className="gold-line mt-5" />
          </div>

          <div className="grid md:grid-cols-3 gap-px" style={{ background: "var(--border-c)" }}>
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
                    style={{ color: "var(--border-c)", fontWeight: 700, lineHeight: 1 }}
                  >
                    {step.num}
                  </span>
                  <span style={{ color: "var(--blue)", opacity: 0.7 }}>
                    <Icon name={step.icon} size={20} />
                  </span>
                </div>
                <p className="font-display text-xl mb-3" style={{ color: "var(--navy)" }}>
                  {step.title}
                </p>
                <p className="font-body text-sm leading-6" style={{ color: "var(--text-muted)" }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button className="btn-gold px-10 py-4" onClick={onOpenModal}>Получить решение</button>
          </div>
        </div>
      </section>

      {/* ── RISK BLOCK ──────────────────────────────────────────────────── */}
      <section ref={ref2 as React.Ref<HTMLElement>} className="reveal py-20 px-6 md:px-10" style={{ background: "var(--bg-white)" }}>
        <div className="max-w-6xl mx-auto">
          <div
            className="p-10 lg:p-14 relative overflow-hidden"
            style={{ background: "rgba(37,99,235,0.04)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 8 }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(37,99,235,0.4), transparent)" }}
            />

            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <p
                  className="font-body text-xs tracking-widest uppercase mb-4"
                  style={{ color: "var(--blue)", letterSpacing: "0.2em" }}
                >
                  Цена ошибки
                </p>
                <h2
                  className="font-display text-2xl sm:text-3xl lg:text-4xl mb-6"
                  style={{ color: "var(--navy)" }}
                >
                  Ошибка в документе{" "}
                  <span style={{ color: "var(--blue)", fontStyle: "italic" }}>может стоить дорого</span>
                </h2>
                <button className="btn-gold px-8 py-4" onClick={onOpenModal}>Отправить документ</button>
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
                      style={{
                        background: "rgba(37,99,235,0.08)",
                        border: "1px solid rgba(37,99,235,0.2)",
                        borderRadius: 6,
                        color: "var(--blue)",
                      }}
                    >
                      <Icon name={r.icon} size={14} />
                    </div>
                    <p
                      className="font-body text-sm leading-6 pt-1"
                      style={{ color: "var(--text)" }}
                    >
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
      <section ref={ref3 as React.Ref<HTMLElement>} className="reveal py-20 px-6 md:px-10" style={{ background: "var(--bg)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p
                className="font-body text-xs tracking-widest uppercase mb-4"
                style={{ color: "var(--blue)", letterSpacing: "0.2em" }}
              >
                Доп. услуга
              </p>
              <h2
                className="font-display text-xl sm:text-2xl lg:text-4xl mb-4"
                style={{ color: "var(--navy)" }}
              >
                Защита интеллектуальной собственности
              </h2>
              <div className="gold-line mb-6" />
              <p className="font-body text-sm leading-7 mb-8" style={{ color: "var(--text-muted)" }}>
                Споры о нарушении авторских прав, защита товарных знаков, борьба с незаконным копированием.
                Полное юридическое сопровождение под ключ.
              </p>
              <button
                className="btn-outline font-body text-xs tracking-widest uppercase px-8 py-3.5"
                style={{
                  border: "1px solid rgba(37,99,235,0.35)",
                  color: "var(--blue)",
                  borderRadius: 6,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--blue)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(37,99,235,0.35)")}
              >
                Узнать подробнее
              </button>
            </div>

            <div className="space-y-3">
              {[
                { icon: "Copyright", title: "Судебные споры по авторским правам", desc: "Отзывы, возражения, иски" },
                { icon: "Tag", title: "Товарные знаки", desc: "Регистрация и защита" },
                { icon: "Copy", title: "Незаконное копирование", desc: "Пресечение нарушений" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-5 p-5 transition-all duration-200"
                  style={{
                    background: "var(--bg-white)",
                    border: "1px solid var(--border-c)",
                    borderRadius: 8,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(37,99,235,0.3)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-c)")}
                >
                  <div className="flex-shrink-0" style={{ color: "var(--blue)", opacity: 0.8 }}>
                    <Icon name={item.icon} size={18} />
                  </div>
                  <div>
                    <p className="font-body text-sm font-semibold" style={{ color: "var(--text)" }}>
                      {item.title}
                    </p>
                    <p className="font-body text-xs" style={{ color: "var(--text-muted)" }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}