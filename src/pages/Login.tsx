import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";
import { useVkAuth } from "@/components/extensions/vk-auth/useVkAuth";
import VkLoginButton from "@/components/extensions/vk-auth/VkLoginButton";
import { useAuth } from "@/components/extensions/auth-email/useAuth";

const VK_AUTH_URL = "https://functions.poehali.dev/86f3f05d-2e0a-462a-aa06-2c00d428c502";
const AUTH_URL = "https://functions.poehali.dev/cf442b6d-1511-4826-a129-d63da8e9dfa0";
const EMAIL_AUTH_URL = "https://functions.poehali.dev/99e239ab-92c4-4a98-9d7d-a594f763195d";

const INPUT_BASE = "w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors font-body";
const inputStyle = { background: "var(--bg)", border: "1px solid var(--border-c)", color: "var(--text)" };

export default function Login() {
  const navigate = useNavigate();

  // Способ входа: логин или email
  const [authMode, setAuthMode] = useState<"login" | "email">("login");

  // === Логин/пароль ===
  const [tab, setTab] = useState<"login" | "register">("login");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"client" | "partner">("client");
  const [lawyerTypeRequested, setLawyerTypeRequested] = useState<"" | "lawyer" | "advocate">("");
  const [consent, setConsent] = useState(false);

  // === Email auth ===
  const [emailTab, setEmailTab] = useState<"login" | "register" | "reset">("login");
  const [emailField, setEmailField] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailName, setEmailName] = useState("");
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [needVerify, setNeedVerify] = useState(false);
  const [resetStep, setResetStep] = useState<"email" | "code">("email");
  const [resetCode, setResetCode] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");

  const emailAuth = useAuth({
    apiUrls: {
      login: `${EMAIL_AUTH_URL}?action=login`,
      register: `${EMAIL_AUTH_URL}?action=register`,
      verifyEmail: `${EMAIL_AUTH_URL}?action=verify-email`,
      refresh: `${EMAIL_AUTH_URL}?action=refresh`,
      logout: `${EMAIL_AUTH_URL}?action=logout`,
      resetPassword: `${EMAIL_AUTH_URL}?action=reset-password`,
    },
    onAuthChange: (user) => {
      if (user) navigate("/cabinet");
    },
  });

  const vkAuth = useVkAuth({
    apiUrls: {
      authUrl: `${VK_AUTH_URL}?action=auth-url`,
      callback: `${VK_AUTH_URL}?action=callback`,
      refresh: `${VK_AUTH_URL}?action=refresh`,
      logout: `${VK_AUTH_URL}?action=logout`,
    },
  });

  // === Обработчик логин/пароль ===
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login.trim() || !password) { toast.error("Заполните все поля"); return; }
    if (tab === "register" && password.length < 6) { toast.error("Пароль должен быть не менее 6 символов"); return; }
    if (tab === "register" && !consent) { toast.error("Необходимо принять условия соглашения"); return; }

    setLoading(true);
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: tab, login: login.trim().toLowerCase(), password, role: tab === "register" ? role : undefined, lawyer_type_requested: tab === "register" && role === "partner" && lawyerTypeRequested ? lawyerTypeRequested : undefined, ref_code: tab === "register" && role === "partner" ? (localStorage.getItem("ref_code") || undefined) : undefined }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Ошибка авторизации"); return; }
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

  // === Обработчики email auth ===
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailField.trim() || !emailPassword) { toast.error("Заполните все поля"); return; }
    const ok = await emailAuth.login({ email: emailField.trim(), password: emailPassword });
    if (!ok && emailAuth.error) toast.error(emailAuth.error);
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailField.trim() || !emailPassword) { toast.error("Заполните все поля"); return; }
    if (emailPassword.length < 6) { toast.error("Пароль должен быть не менее 6 символов"); return; }
    const result = await emailAuth.register({ email: emailField.trim(), password: emailPassword, name: emailName || undefined });
    if (!result.success && emailAuth.error) { toast.error(emailAuth.error); return; }
    if (result.emailVerificationRequired) {
      setNeedVerify(true);
      toast.success("Код подтверждения отправлен на почту");
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode.trim()) { toast.error("Введите код из письма"); return; }
    const ok = await emailAuth.verifyEmail(emailField.trim(), verifyCode.trim());
    if (!ok) { toast.error(emailAuth.error || "Неверный код"); return; }
    toast.success("Email подтверждён!");
    navigate("/cabinet");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetStep === "email") {
      if (!emailField.trim()) { toast.error("Введите email"); return; }
      await emailAuth.requestPasswordReset(emailField.trim());
      setResetStep("code");
      toast.success("Код отправлен на почту");
    } else {
      if (!resetCode || !resetNewPassword) { toast.error("Заполните все поля"); return; }
      const ok = await emailAuth.resetPassword(emailField.trim(), resetCode.trim(), resetNewPassword);
      if (!ok) { toast.error(emailAuth.error || "Ошибка сброса пароля"); return; }
      toast.success("Пароль изменён! Войдите с новым паролем.");
      setEmailTab("login");
      setResetStep("email");
    }
  };

  return (
    <div className="theme-light min-h-screen flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <Link to="/" className="mb-8">
        <img
          src="https://cdn.poehali.dev/projects/ec09f91e-5c19-456f-a8f1-620fce7cd143/bucket/2dd31743-a0a9-4408-8122-638fc7c5235a.jpeg"
          alt="Legis24"
          style={{ height: 48, width: "auto", borderRadius: 8 }}
        />
      </Link>

      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ background: "#fff", border: "1px solid var(--border-c)", boxShadow: "0 8px 40px rgba(0,0,0,0.06)" }}
      >
        {/* Переключатель способа входа */}
        <div className="flex rounded-lg p-1 mb-6" style={{ background: "var(--bg)" }}>
          {([
            { key: "login", label: "По логину" },
            { key: "email", label: "По email" },
          ] as const).map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setAuthMode(m.key)}
              className="flex-1 py-2 rounded-md text-xs font-semibold transition-all duration-200"
              style={{
                background: authMode === m.key ? "#fff" : "transparent",
                color: authMode === m.key ? "var(--navy)" : "var(--text-muted)",
                boxShadow: authMode === m.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* ── БЛОК: ЛОГИН/ПАРОЛЬ ── */}
        {authMode === "login" && (
          <>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Playfair Display, serif", color: "var(--navy)" }}>
                {tab === "login" ? "Вход в кабинет" : "Регистрация"}
              </h1>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {tab === "login" ? "Введите логин и пароль" : "Создайте аккаунт"}
              </p>
            </div>

            <div className="flex rounded-lg p-1 mb-6" style={{ background: "var(--bg)" }}>
              {(["login", "register"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setTab(t)}
                  className="flex-1 py-2 rounded-md text-xs font-semibold transition-all duration-200"
                  style={{ background: tab === t ? "#fff" : "transparent", color: tab === t ? "var(--navy)" : "var(--text-muted)", boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
                  {t === "login" ? "Войти" : "Зарегистрироваться"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Логин</label>
                <input className={INPUT_BASE} style={inputStyle} placeholder="Ваш логин"
                  value={login} onChange={(e) => setLogin(e.target.value)} disabled={loading} autoComplete="username" />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Пароль</label>
                <div className="relative">
                  <input className={INPUT_BASE} style={{ ...inputStyle, paddingRight: "2.75rem" }}
                    placeholder={tab === "register" ? "Минимум 6 символов" : "Пароль"}
                    type={showPassword ? "text" : "password"}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    disabled={loading} autoComplete={tab === "login" ? "current-password" : "new-password"} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                    style={{ color: "var(--text-muted)" }}>
                    <Icon name={showPassword ? "EyeOff" : "Eye"} size={16} />
                  </button>
                </div>
              </div>

              {tab === "register" && (
                <div className="flex gap-3">
                  {([{ value: "client", label: "Заказчик", icon: "User" }, { value: "partner", label: "Партнёр", icon: "Handshake" }] as const).map((opt) => (
                    <button key={opt.value} type="button" onClick={() => setRole(opt.value)}
                      className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-lg text-xs font-medium transition-all border"
                      style={{ background: role === opt.value ? "var(--navy)" : "var(--bg)", color: role === opt.value ? "#fff" : "var(--text-muted)", borderColor: role === opt.value ? "var(--navy)" : "var(--border-c)" }}>
                      <Icon name={opt.icon} size={18} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {tab === "register" && role === "partner" && (
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>Я являюсь (необязательно)</p>
                  <div className="flex gap-2">
                    {([{ value: "lawyer", label: "Юристом" }, { value: "advocate", label: "Адвокатом" }] as const).map((opt) => (
                      <button key={opt.value} type="button"
                        onClick={() => setLawyerTypeRequested(v => v === opt.value ? "" : opt.value)}
                        className="flex-1 py-2 rounded-lg text-xs font-medium transition-all border"
                        style={{ background: lawyerTypeRequested === opt.value ? "var(--gold)" : "var(--bg)", color: lawyerTypeRequested === opt.value ? "var(--navy)" : "var(--text-muted)", borderColor: lawyerTypeRequested === opt.value ? "var(--gold)" : "var(--border-c)" }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {lawyerTypeRequested && (
                    <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
                      Доступ к тарифам для юристов/адвокатов будет открыт после подтверждения администратором
                    </p>
                  )}
                </div>
              )}

              {tab === "register" && (
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <div
                    onClick={() => setConsent(!consent)}
                    className="w-4 h-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-all cursor-pointer"
                    style={{ background: consent ? "var(--navy)" : "transparent", borderColor: consent ? "var(--navy)" : "var(--border-c)" }}>
                    {consent && <Icon name="Check" size={10} style={{ color: "#fff" }} />}
                  </div>
                  <span className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    Я принимаю условия{" "}
                    <Link to="/offer" className="underline" style={{ color: "var(--navy)" }}>пользовательского соглашения</Link>
                  </span>
                </label>
              )}

              <button type="submit" disabled={loading || (tab === "register" && !consent)}
                className="w-full py-3 rounded-lg text-sm font-semibold transition-all duration-200 mt-2"
                style={{ background: loading ? "var(--border-c)" : "var(--navy)", color: "#fff", opacity: loading ? 0.7 : 1 }}
                onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = "var(--navy-hover)"; }}
                onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = "var(--navy)"; }}>
                {loading ? "Загрузка..." : tab === "login" ? "Войти" : "Создать аккаунт"}
              </button>
            </form>
          </>
        )}

        {/* ── БЛОК: EMAIL AUTH ── */}
        {authMode === "email" && (
          <>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Playfair Display, serif", color: "var(--navy)" }}>
                {emailTab === "login" ? "Вход по email" : emailTab === "register" ? "Регистрация" : "Сброс пароля"}
              </h1>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {emailTab === "login" ? "Введите email и пароль" : emailTab === "register" ? "Создайте аккаунт" : "Восстановление доступа"}
              </p>
            </div>

            {/* Табы email */}
            {!needVerify && (
              <div className="flex rounded-lg p-1 mb-6" style={{ background: "var(--bg)" }}>
                {([
                  { key: "login", label: "Войти" },
                  { key: "register", label: "Регистрация" },
                  { key: "reset", label: "Забыл пароль" },
                ] as const).map((t) => (
                  <button key={t.key} type="button" onClick={() => { setEmailTab(t.key); setNeedVerify(false); setResetStep("email"); }}
                    className="flex-1 py-2 rounded-md text-xs font-semibold transition-all duration-200"
                    style={{ background: emailTab === t.key ? "#fff" : "transparent", color: emailTab === t.key ? "var(--navy)" : "var(--text-muted)", boxShadow: emailTab === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            {/* Форма входа по email */}
            {emailTab === "login" && !needVerify && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Email</label>
                  <input className={INPUT_BASE} style={inputStyle} type="email" placeholder="you@example.com"
                    value={emailField} onChange={(e) => setEmailField(e.target.value)} autoComplete="email" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Пароль</label>
                  <div className="relative">
                    <input className={INPUT_BASE} style={{ ...inputStyle, paddingRight: "2.75rem" }}
                      type={showEmailPassword ? "text" : "password"} placeholder="Пароль"
                      value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} autoComplete="current-password" />
                    <button type="button" onClick={() => setShowEmailPassword(!showEmailPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                      style={{ color: "var(--text-muted)" }}>
                      <Icon name={showEmailPassword ? "EyeOff" : "Eye"} size={16} />
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={emailAuth.isLoading}
                  className="w-full py-3 rounded-lg text-sm font-semibold transition-all duration-200 mt-2"
                  style={{ background: emailAuth.isLoading ? "var(--border-c)" : "var(--navy)", color: "#fff", opacity: emailAuth.isLoading ? 0.7 : 1 }}>
                  {emailAuth.isLoading ? "Загрузка..." : "Войти"}
                </button>
              </form>
            )}

            {/* Форма регистрации по email */}
            {emailTab === "register" && !needVerify && (
              <form onSubmit={handleEmailRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Имя (необязательно)</label>
                  <input className={INPUT_BASE} style={inputStyle} placeholder="Ваше имя"
                    value={emailName} onChange={(e) => setEmailName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Email</label>
                  <input className={INPUT_BASE} style={inputStyle} type="email" placeholder="you@example.com"
                    value={emailField} onChange={(e) => setEmailField(e.target.value)} autoComplete="email" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Пароль</label>
                  <div className="relative">
                    <input className={INPUT_BASE} style={{ ...inputStyle, paddingRight: "2.75rem" }}
                      type={showEmailPassword ? "text" : "password"} placeholder="Минимум 6 символов"
                      value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} autoComplete="new-password" />
                    <button type="button" onClick={() => setShowEmailPassword(!showEmailPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                      style={{ color: "var(--text-muted)" }}>
                      <Icon name={showEmailPassword ? "EyeOff" : "Eye"} size={16} />
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={emailAuth.isLoading}
                  className="w-full py-3 rounded-lg text-sm font-semibold transition-all duration-200 mt-2"
                  style={{ background: emailAuth.isLoading ? "var(--border-c)" : "var(--navy)", color: "#fff", opacity: emailAuth.isLoading ? 0.7 : 1 }}>
                  {emailAuth.isLoading ? "Загрузка..." : "Создать аккаунт"}
                </button>
              </form>
            )}

            {/* Подтверждение email */}
            {needVerify && (
              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "var(--blue-dim)", color: "var(--navy)" }}>
                  Код подтверждения отправлен на <b>{emailField}</b>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Код из письма</label>
                  <input className={INPUT_BASE} style={inputStyle} placeholder="6-значный код"
                    value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} maxLength={6} />
                </div>
                <button type="submit" disabled={emailAuth.isLoading}
                  className="w-full py-3 rounded-lg text-sm font-semibold transition-all"
                  style={{ background: "var(--navy)", color: "#fff", opacity: emailAuth.isLoading ? 0.7 : 1 }}>
                  {emailAuth.isLoading ? "Проверяем..." : "Подтвердить email"}
                </button>
              </form>
            )}

            {/* Сброс пароля */}
            {emailTab === "reset" && !needVerify && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Email</label>
                  <input className={INPUT_BASE} style={inputStyle} type="email" placeholder="you@example.com"
                    value={emailField} onChange={(e) => setEmailField(e.target.value)} disabled={resetStep === "code"} />
                </div>
                {resetStep === "code" && (
                  <>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Код из письма</label>
                      <input className={INPUT_BASE} style={inputStyle} placeholder="6-значный код"
                        value={resetCode} onChange={(e) => setResetCode(e.target.value)} maxLength={6} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Новый пароль</label>
                      <input className={INPUT_BASE} style={inputStyle} type="password" placeholder="Минимум 6 символов"
                        value={resetNewPassword} onChange={(e) => setResetNewPassword(e.target.value)} />
                    </div>
                  </>
                )}
                <button type="submit" disabled={emailAuth.isLoading}
                  className="w-full py-3 rounded-lg text-sm font-semibold transition-all"
                  style={{ background: "var(--navy)", color: "#fff", opacity: emailAuth.isLoading ? 0.7 : 1 }}>
                  {emailAuth.isLoading ? "Загрузка..." : resetStep === "email" ? "Отправить код" : "Сменить пароль"}
                </button>
              </form>
            )}
          </>
        )}

        {/* Разделитель + VK */}
        <div className="flex items-center gap-3 mt-4">
          <div className="flex-1 h-px" style={{ background: "var(--border-c)" }} />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>или</span>
          <div className="flex-1 h-px" style={{ background: "var(--border-c)" }} />
        </div>
        <div className="mt-3">
          <VkLoginButton onClick={vkAuth.login} isLoading={vkAuth.isLoading} className="w-full" />
        </div>
      </div>

      <Link to="/" className="mt-6 flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70" style={{ color: "var(--text-muted)" }}>
        <Icon name="ArrowLeft" size={14} />
        На главную
      </Link>
    </div>
  );
}
