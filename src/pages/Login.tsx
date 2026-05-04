import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";

const AUTH_URL = "https://functions.poehali.dev/cf442b6d-1511-4826-a129-d63da8e9dfa0";

const INPUT_BASE = "w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors font-body";

export default function Login() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"client" | "partner">("client");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login.trim() || !password) {
      toast.error("Заполните все поля");
      return;
    }
    if (tab === "register" && password.length < 6) {
      toast.error("Пароль должен быть не менее 6 символов");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: tab, login: login.trim().toLowerCase(), password, role: tab === "register" ? role : undefined }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Ошибка авторизации");
        return;
      }

      localStorage.setItem("session_id", data.session_id);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success(tab === "login" ? "Добро пожаловать!" : "Аккаунт создан!");
      navigate("/cabinet");
    } catch {
      toast.error("Ошибка соединения. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "var(--bg)" }}
    >
      {/* Logo */}
      <Link to="/" className="mb-8">
        <img
          src="https://cdn.poehali.dev/projects/ec09f91e-5c19-456f-a8f1-620fce7cd143/bucket/269a5714-3147-42ee-9d3a-43b1f31ad3e8.jpeg"
          alt="Legis24"
          style={{ height: 48, width: "auto", mixBlendMode: "multiply" }}
        />
      </Link>

      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{
          background: "#fff",
          border: "1px solid var(--border-c)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
        }}
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <h1
            className="text-2xl font-bold mb-1"
            style={{ fontFamily: "Playfair Display, serif", color: "var(--navy)" }}
          >
            {tab === "login" ? "Вход в кабинет" : "Регистрация"}
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {tab === "login" ? "Введите логин и пароль" : "Создайте аккаунт"}
          </p>
        </div>

        {/* Tabs */}
        <div
          className="flex rounded-lg p-1 mb-6"
          style={{ background: "var(--bg)" }}
        >
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="flex-1 py-2 rounded-md text-xs font-semibold transition-all duration-200"
              style={{
                background: tab === t ? "#fff" : "transparent",
                color: tab === t ? "var(--navy)" : "var(--text-muted)",
                boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {t === "login" ? "Войти" : "Зарегистрироваться"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
              Логин
            </label>
            <input
              className={INPUT_BASE}
              style={{ background: "var(--bg)", border: "1px solid var(--border-c)", color: "var(--text)" }}
              placeholder="Ваш логин"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
              Пароль
            </label>
            <div className="relative">
              <input
                className={INPUT_BASE}
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border-c)",
                  color: "var(--text)",
                  paddingRight: "2.75rem",
                }}
                placeholder={tab === "register" ? "Минимум 6 символов" : "Пароль"}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete={tab === "login" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                style={{ color: "var(--text-muted)" }}
              >
                <Icon name={showPassword ? "EyeOff" : "Eye"} size={16} />
              </button>
            </div>
          </div>

          {tab === "register" && (
            <div className="flex gap-3">
              {([
                { value: "client", label: "Заказчик", icon: "User" },
                { value: "partner", label: "Партнёр", icon: "Handshake" },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-lg text-xs font-medium transition-all border"
                  style={{
                    background: role === opt.value ? "var(--navy)" : "var(--bg)",
                    color: role === opt.value ? "#fff" : "var(--text-muted)",
                    borderColor: role === opt.value ? "var(--navy)" : "var(--border-c)",
                  }}
                >
                  <Icon name={opt.icon} size={18} />
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-sm font-semibold transition-all duration-200 mt-2"
            style={{
              background: loading ? "var(--border-c)" : "var(--navy)",
              color: "#fff",
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) (e.currentTarget as HTMLElement).style.background = "var(--navy-hover)";
            }}
            onMouseLeave={(e) => {
              if (!loading) (e.currentTarget as HTMLElement).style.background = "var(--navy)";
            }}
          >
            {loading
              ? "Загрузка..."
              : tab === "login"
              ? "Войти"
              : "Создать аккаунт"}
          </button>
        </form>
      </div>

      <Link
        to="/"
        className="mt-6 flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70"
        style={{ color: "var(--text-muted)" }}
      >
        <Icon name="ArrowLeft" size={14} />
        На главную
      </Link>
    </div>
  );
}