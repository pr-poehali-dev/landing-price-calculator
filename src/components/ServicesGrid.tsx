import Icon from "@/components/ui/icon";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function ServicesGrid({ onOpenModal }: { onOpenModal: () => void }) {
  const ref = useScrollReveal();
  return (
    <section ref={ref as React.Ref<HTMLElement>} id="services" className="reveal py-24 px-6 md:px-10" style={{ background: "var(--bg-white)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p
            className="font-body text-xs tracking-widest uppercase mb-3"
            style={{ color: "var(--blue)", letterSpacing: "0.2em" }}
          >
            Что делаем
          </p>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-5xl" style={{ color: "var(--navy)" }}>
            Документы под задачи бизнеса
          </h2>
          <div className="gold-line mt-5" />
        </div>

        <div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-px"
          style={{ background: "var(--border-c)" }}
        >
          {[
            { icon: "Gavel", title: "Отзывы по авторским правам", desc: "Правовая позиция + подача в суд. Под ключ." },
            { icon: "FileSearch", title: "Возражения ФНС", desc: "На акты, решения, требования налоговых органов." },
            { icon: "Mail", title: "Ответы на письма", desc: "Любые запросы от контрагентов и ведомств." },
            { icon: "Scale", title: "Судебные документы", desc: "Исковые заявления, ходатайства, жалобы." },
          ].map((s) => (
            <div key={s.title} className="service-card p-7">
              <div className="mb-4" style={{ color: "var(--blue)" }}>
                <Icon name={s.icon} size={20} />
              </div>
              <p className="font-display text-xl mb-2" style={{ color: "var(--navy)" }}>
                {s.title}
              </p>
              <p className="font-body text-sm leading-6" style={{ color: "var(--text-muted)" }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button className="btn-gold px-10 py-4" onClick={onOpenModal}>Отправить документ</button>
        </div>
      </div>
    </section>
  );
}