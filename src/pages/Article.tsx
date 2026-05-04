import { Link, useParams, Navigate } from "react-router-dom";
import { articles } from "@/data/articles";
import Icon from "@/components/ui/icon";

export default function Article() {
  const { slug } = useParams<{ slug: string }>();
  const article = articles.find((a) => a.slug === slug);

  if (!article) return <Navigate to="/blog" replace />;

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
          to="/blog"
          className="flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--navy)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <Icon name="ArrowLeft" size={16} />
          Все статьи
        </Link>
      </nav>

      <div className="pt-28 pb-20 px-6 md:px-10 max-w-3xl mx-auto">
        {/* Meta */}
        <div className="mb-6 flex items-center gap-4">
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: "var(--blue-dim)", color: "var(--blue)" }}
          >
            {article.category}
          </span>
          <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
            <Icon name="Clock" size={13} />
            {article.readTime}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {article.date}
          </span>
        </div>

        {/* Title */}
        <h1
          className="text-3xl md:text-4xl font-bold leading-tight mb-6"
          style={{ fontFamily: "Playfair Display, serif", color: "var(--navy)" }}
        >
          {article.title}
        </h1>

        {/* Excerpt */}
        <p
          className="text-lg leading-relaxed mb-10 pb-8"
          style={{
            color: "var(--text-muted)",
            borderBottom: "1px solid var(--border-c)",
          }}
        >
          {article.excerpt}
        </p>

        {/* Content */}
        <div className="space-y-8">
          {article.sections.map((section, i) => (
            <div key={i}>
              {section.heading && (
                <h2
                  className="text-xl md:text-2xl font-bold mb-3"
                  style={{ fontFamily: "Playfair Display, serif", color: "var(--navy)" }}
                >
                  {section.heading}
                </h2>
              )}
              {section.text && (
                <p className="leading-relaxed mb-4" style={{ color: "var(--text)" }}>
                  {section.text}
                </p>
              )}
              {section.list && (
                <ul className="space-y-2 mb-4">
                  {section.list.map((item, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <span
                        className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full"
                        style={{ background: "var(--blue)" }}
                      />
                      <span className="leading-relaxed" style={{ color: "var(--text)" }}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {section.tip && (
                <div
                  className="flex gap-3 rounded-xl px-5 py-4"
                  style={{
                    background: "var(--success-dim)",
                    border: "1px solid rgba(21,128,61,0.15)",
                  }}
                >
                  <Icon name="Lightbulb" size={18} className="flex-shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
                  <p className="text-sm leading-relaxed" style={{ color: "var(--success)" }}>
                    {section.tip}
                  </p>
                </div>
              )}
              {section.warning && (
                <div
                  className="flex gap-3 rounded-xl px-5 py-4"
                  style={{
                    background: "rgba(239,68,68,0.07)",
                    border: "1px solid rgba(239,68,68,0.15)",
                  }}
                >
                  <Icon name="TriangleAlert" size={18} className="flex-shrink-0 mt-0.5" style={{ color: "#dc2626" }} />
                  <p className="text-sm leading-relaxed" style={{ color: "#b91c1c" }}>
                    {section.warning}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Other Articles */}
        <div
          className="mt-14 pt-10"
          style={{ borderTop: "1px solid var(--border-c)" }}
        >
          <h3
            className="text-xl font-bold mb-6"
            style={{ fontFamily: "Playfair Display, serif", color: "var(--navy)" }}
          >
            Другие статьи
          </h3>
          <div className="space-y-3">
            {articles
              .filter((a) => a.id !== article.id)
              .map((a) => (
                <Link
                  key={a.id}
                  to={`/blog/${a.slug}`}
                  className="flex items-center justify-between rounded-xl px-5 py-4 transition-all duration-200 group"
                  style={{
                    background: "var(--bg-white)",
                    border: "1px solid var(--border-c)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(37,99,235,0.3)";
                    (e.currentTarget as HTMLElement).style.background = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-c)";
                    (e.currentTarget as HTMLElement).style.background = "var(--bg-white)";
                  }}
                >
                  <div>
                    <p className="text-xs mb-1" style={{ color: "var(--blue)" }}>
                      {a.category}
                    </p>
                    <p className="font-semibold text-sm" style={{ color: "var(--navy)" }}>
                      {a.title}
                    </p>
                  </div>
                  <Icon name="ArrowRight" size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                </Link>
              ))}
          </div>
        </div>

        {/* CTA */}
        <div
          className="mt-10 rounded-2xl p-7 md:p-9 text-center"
          style={{ background: "var(--navy)" }}
        >
          <h3
            className="text-xl md:text-2xl font-bold mb-2"
            style={{ fontFamily: "Playfair Display, serif", color: "#fff" }}
          >
            Остались вопросы?
          </h3>
          <p className="mb-5 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
            Получите консультацию по вашей ситуации.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{ background: "var(--blue)", color: "#fff" }}
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