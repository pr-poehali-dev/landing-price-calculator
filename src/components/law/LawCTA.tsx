interface LawCTAProps {
  onOpenModal: () => void;
  onScrollTo: (id: string) => void;
}

export default function LawCTA({ onOpenModal, onScrollTo }: LawCTAProps) {
  return (
    <section style={{ background: "var(--dark)", paddingTop: 96, paddingBottom: 96 }}>
      <div className="max-w-6xl mx-auto px-6 md:px-10 text-center">
        <h2
          className="font-display mb-5"
          style={{
            color: "var(--text)",
            fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          Нет времени готовить документы?
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", marginBottom: 40, maxWidth: 480, margin: "0 auto 40px" }}>
          Передайте задачу — подготовим быстро и по делу
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="btn-gold px-10 py-3 text-xs" onClick={onOpenModal}>
            Отправить документы
          </button>
          <button
            className="btn-outline px-10 py-3 text-xs"
            onClick={() => onScrollTo("lawyers")}
          >
            Рассчитать стоимость
          </button>
        </div>
      </div>
    </section>
  );
}
