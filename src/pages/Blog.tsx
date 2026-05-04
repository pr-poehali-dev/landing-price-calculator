import { Link } from "react-router-dom";
import { articles } from "@/data/articles";
import Icon from "@/components/ui/icon";

export default function Blog() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* NAV */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border-c)",
        }}
      >
        <Link to="/">
          <img
            src="https://cdn.poehali.dev/projects/ec09f91e-5c19-456f-a8f1-620fce7cd143/bucket/9f3ffbe2-117b-415c-bd94-81fb0c9183e9.png"
            alt="Legis24"
            style={{ height: 48, width: "auto", borderRadius: 6 }}
          />
        </Link>
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--navy)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <Icon name="ArrowLeft" size={16} />
          На главную
        </Link>
      </nav>

      <div className="pt-28 pb-20 px-6 md:px-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p
            className="text-xs tracking-widest uppercase font-semibold mb-3"
            style={{ color: "var(--blue)" }}
          >
            Блог
          </p>
          <h1
            className="text-4xl md:text-5xl font-bold leading-tight mb-4"
            style={{ fontFamily: "Playfair Display, serif", color: "var(--navy)" }}
          >
            Юридические статьи
          </h1>
          <p className="text-lg" style={{ color: "var(--text-muted)" }}>
            Практические советы для предпринимателей — без воды и на понятном языке.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/blog/${article.slug}`}
              className="group block rounded-2xl overflow-hidden transition-all duration-300"
              style={{
                background: "var(--bg-white)",
                border: "1px solid var(--border-c)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(37,99,235,0.10)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(37,99,235,0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-c)";
              }}
            >
              <div className="p-7">
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{
                      background: "var(--blue-dim)",
                      color: "var(--blue)",
                    }}
                  >
                    {article.category}
                  </span>
                  <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                    <Icon name="Clock" size={13} />
                    {article.readTime}
                  </span>
                </div>

                <h2
                  className="text-xl font-bold mb-3 leading-snug transition-colors"
                  style={{
                    fontFamily: "Playfair Display, serif",
                    color: "var(--navy)",
                  }}
                >
                  {article.title}
                </h2>

                <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-muted)" }}>
                  {article.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {article.date}
                  </span>
                  <span
                    className="flex items-center gap-1 text-sm font-medium transition-colors"
                    style={{ color: "var(--blue)" }}
                  >
                    Читать
                    <Icon name="ArrowRight" size={15} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div
          className="mt-14 rounded-2xl p-8 md:p-10 text-center"
          style={{
            background: "var(--navy)",
          }}
        >
          <h3
            className="text-2xl md:text-3xl font-bold mb-3"
            style={{ fontFamily: "Playfair Display, serif", color: "#fff" }}
          >
            Нужна консультация?
          </h3>
          <p className="mb-6 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
            Разберём вашу ситуацию и предложим решение.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              background: "var(--blue)",
              color: "#fff",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "var(--blue-hover)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "var(--blue)")
            }
          >
            Отправить документ на проверку
            <Icon name="ArrowRight" size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}