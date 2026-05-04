import Icon from "@/components/ui/icon";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function ProcessSection({ onOpenModal }: { onOpenModal: () => void }) {
  const ref1 = useScrollReveal();
  const ref2 = useScrollReveal();
  const ref3 = useScrollReveal();

  return (
    <>
      {/* ── HOW WE WORK ─────────────────────────────────────────────────── */}
      <section ref={ref1 as React.Ref<HTMLElement>} className="reveal py-24 px-6 md:px-12" style={{ background: "var(--dark)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-px" style={{ background: "var(--gold)" }} />
              <span className="font-body text-xs tracking-widest uppercase" style={{ color: "var(--gold)", letterSpacing: "0.2em" }}>Процесс</span>
            </div>
            <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", color: "#fff", fontWeight: 700 }}>
              Как мы работаем
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px" style={{ background: "rgba(212,175,55,0.08)" }}>
            {[
              { num: "01", icon: "Upload",      title: "Отправляете документ",  desc: "Прикрепляете файл или описываете ситуацию. Принимаем в мессенджерах, email или через форму." },
              { num: "02", icon: "Search",       title: "Мы анализируем",        desc: "Изучаем материалы, проверяем судебную практику, определяем сильную правовую позицию." },
              { num: "03", icon: "CheckCircle",  title: "Готово за 24 часа",     desc: "Передаём готовый документ. При необходимости — подаём в суд или ведомство от вашего имени." },
            ].map(step => (
              <div key={step.num} className="service-card p-8 lg:p-10" style={{ background: "var(--dark-card)" }}>
                <div className="flex items-start justify-between mb-8">
                  <span className="font-display" style={{ fontSize: "4rem", color: "rgba(212,175,55,0.12)", fontWeight: 700, lineHeight: 1 }}>
                    {step.num}
                  </span>
                  <div className="w-9 h-9 flex items-center justify-center rounded"
                    style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.15)" }}>
                    <Icon name={step.icon as "Upload"} size={16} style={{ color: "var(--gold)" }} />
                  </div>
                </div>
                <p className="font-display text-xl mb-3 leading-tight" style={{ color: "#fff" }}>{step.title}</p>
                <p className="font-body text-sm leading-6" style={{ color: "var(--text-muted)" }}>{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button className="btn-gold px-10 py-4" onClick={onOpenModal}>Получить решение</button>
          </div>
        </div>
      </section>

      {/* ── RISK BLOCK ──────────────────────────────────────────────────── */}
      <section ref={ref2 as React.Ref<HTMLElement>} className="reveal py-20 px-6 md:px-12" style={{ background: "var(--dark-card)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="p-10 lg:p-14 relative overflow-hidden rounded"
            style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.06) 0%, rgba(212,175,55,0.02) 100%)", border: "1px solid rgba(212,175,55,0.2)" }}>

            {/* Gold top line */}
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)" }} />

            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-5 h-px" style={{ background: "var(--gold)" }} />
                  <span className="font-body text-xs tracking-widest uppercase" style={{ color: "var(--gold)" }}>Цена ошибки</span>
                </div>
                <h2 className="font-display mb-6" style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)", color: "#fff", fontWeight: 700 }}>
                  Ошибка в документе{" "}
                  <span style={{ color: "var(--gold)", fontStyle: "italic" }}>может стоить дорого</span>
                </h2>
                <button className="btn-gold px-8 py-4" onClick={onOpenModal}>Отправить документ</button>
              </div>

              <div className="space-y-4">
                {[
                  { icon: "TrendingDown",  text: "Проигрыш в суде из-за процессуальных ошибок" },
                  { icon: "AlertTriangle", text: "Доначисления и штрафы от налоговых органов" },
                  { icon: "Clock",         text: "Пропуск сроков → потеря права на защиту" },
                ].map(r => (
                  <div key={r.text} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded"
                      style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)" }}>
                      <Icon name={r.icon as "Clock"} size={14} style={{ color: "var(--gold)" }} />
                    </div>
                    <p className="font-body text-sm leading-6 pt-1" style={{ color: "var(--text-muted)" }}>{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── IP BLOCK ────────────────────────────────────────────────────── */}
      <section ref={ref3 as React.Ref<HTMLElement>} className="reveal py-20 px-6 md:px-12" style={{ background: "var(--dark)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-5 h-px" style={{ background: "var(--gold)" }} />
                <span className="font-body text-xs tracking-widest uppercase" style={{ color: "var(--gold)" }}>Доп. услуга</span>
              </div>
              <h2 className="font-display mb-5" style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)", color: "#fff", fontWeight: 700 }}>
                Защита интеллектуальной собственности
              </h2>
              <div className="gold-line mb-6" />
              <p className="font-body text-sm leading-7 mb-8" style={{ color: "var(--text-muted)" }}>
                Споры о нарушении авторских прав, защита товарных знаков, борьба с незаконным копированием.
                Полное юридическое сопровождение под ключ.
              </p>
              <button className="btn-outline px-8 py-3.5" onClick={onOpenModal}>
                Узнать подробнее
              </button>
            </div>

            <div className="space-y-3">
              {[
                { icon: "Copyright", title: "Судебные споры по авторским правам",   desc: "Отзывы, возражения, иски" },
                { icon: "Tag",       title: "Товарные знаки",                       desc: "Регистрация и защита" },
                { icon: "Shield",    title: "Незаконное копирование",               desc: "Пресечение нарушений" },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-4 p-5 rounded"
                  style={{ background: "var(--dark-card)", border: "1px solid rgba(212,175,55,0.1)" }}>
                  <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded"
                    style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.15)" }}>
                    <Icon name={item.icon as "Copyright"} size={15} style={{ color: "var(--gold)" }} />
                  </div>
                  <div>
                    <p className="font-body text-sm font-semibold mb-0.5" style={{ color: "#fff" }}>{item.title}</p>
                    <p className="font-body text-xs" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
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
