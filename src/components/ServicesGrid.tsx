import Icon from "@/components/ui/icon";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const SERVICES = [
  { icon: "Gavel",      title: "Отзывы по авторским правам", desc: "Правовая позиция + подача в суд. Под ключ." },
  { icon: "FileSearch", title: "Возражения ФНС",             desc: "На акты, решения, требования налоговых органов." },
  { icon: "Mail",       title: "Ответы на письма",           desc: "Любые запросы от контрагентов и ведомств." },
  { icon: "Scale",      title: "Судебные документы",         desc: "Исковые заявления, ходатайства, жалобы." },
];

export default function ServicesGrid({ onOpenModal }: { onOpenModal: () => void }) {
  const ref = useScrollReveal();
  return (
    <section ref={ref as React.Ref<HTMLElement>} id="services"
      className="reveal py-24 px-6 md:px-12"
      style={{ background: "var(--dark-card)" }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-px" style={{ background: "var(--gold)" }} />
              <span className="font-body text-xs tracking-widest uppercase" style={{ color: "var(--gold)", letterSpacing: "0.2em" }}>Что делаем</span>
            </div>
            <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", color: "#fff", fontWeight: 700, lineHeight: 1.1 }}>
              Документы под задачи<br />
              <span style={{ color: "var(--gold)", fontStyle: "italic" }}>вашего бизнеса</span>
            </h2>
          </div>
          <button className="btn-gold px-8 py-3.5 self-start md:self-auto flex-shrink-0" onClick={onOpenModal}>
            Отправить документ
          </button>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: "rgba(212,175,55,0.08)" }}>
          {SERVICES.map((s, i) => (
            <div key={s.title}
              className="service-card p-8 group cursor-default"
              style={{ background: "var(--dark-card)" }}>
              <div className="mb-6 w-10 h-10 flex items-center justify-center rounded"
                style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)" }}>
                <Icon name={s.icon as "Gavel"} size={18} style={{ color: "var(--gold)" }} />
              </div>
              <div className="w-5 h-px mb-4" style={{ background: "rgba(212,175,55,0.4)" }} />
              <p className="font-display text-lg mb-3 leading-tight" style={{ color: "#fff" }}>
                {s.title}
              </p>
              <p className="font-body text-sm leading-6" style={{ color: "var(--text-muted)" }}>
                {s.desc}
              </p>
              <div className="mt-6 text-xs font-body font-semibold tracking-widest uppercase transition-colors"
                style={{ color: "rgba(212,175,55,0.4)" }}>
                0{i + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Features strip */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: "rgba(212,175,55,0.08)" }}>
          {[
            { icon: "Clock",      label: "24 часа",           sub: "срок подготовки" },
            { icon: "Building2",  label: "Для бизнеса",       sub: "любой формы" },
            { icon: "Receipt",    label: "Без НДС (УСН)",     sub: "экономия на налогах" },
            { icon: "MapPin",     label: "По всей РФ",        sub: "работаем удалённо" },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-4 px-6 py-5" style={{ background: "#080f1e" }}>
              <Icon name={f.icon as "Clock"} size={16} style={{ color: "var(--gold)", flexShrink: 0 }} />
              <div>
                <p className="font-body text-sm font-semibold" style={{ color: "#fff" }}>{f.label}</p>
                <p className="font-body text-xs" style={{ color: "var(--text-muted)" }}>{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
