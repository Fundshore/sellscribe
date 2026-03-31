import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";
import { useLang } from "./useLang";

const V1 = "#8B5CF6";
const V2 = "#7C3AED";
const V3 = "#A78BFA";
const CARD = "#1C1830";
const LT = "#F0ECFF";

const AUTH_STRINGS = {
  en: {
    welcomeBack: "Welcome back",
    createAccount: "Create account",
    resetPwd: "Reset password",
    loginSub: "Log in to your SellScribe account",
    signupSub: "Start generating listings for free",
    resetSub: "We'll send you a reset link",
    emailLabel: "Email",
    pwdLabel: "Password",
    loginBtn: "Log in",
    signupBtn: "Create account",
    resetBtn: "Send reset link",
    waiting: "Please wait...",
    noAccount: "Don't have an account? Sign up",
    haveAccount: "Already have an account? Log in",
    backToLogin: "Back to login",
    forgotPwd: "Forgot password?",
    terms: "I agree to the",
    termsLink: "Terms of Service",
    termsNote: "By registering you agree to our",
    checkEmail: "Check your email to confirm your account, then log in.",
    resetSent: "Password reset link sent to your email.",
    fillFields: "Please fill in all fields",
    agreeTerms: "Please agree to the Terms of Service",
    pwdWeak: "Password must be at least 8 characters with uppercase, lowercase and a number",
    pwdRequirements: "Min 8 characters · Uppercase · Lowercase · Number",
  },
  ru: {
    welcomeBack: "С возвращением",
    createAccount: "Создать аккаунт",
    resetPwd: "Сброс пароля",
    loginSub: "Войдите в свой аккаунт SellScribe",
    signupSub: "Начните создавать листинги бесплатно",
    resetSub: "Отправим ссылку для сброса пароля",
    emailLabel: "Электронная почта",
    pwdLabel: "Пароль",
    loginBtn: "Войти",
    signupBtn: "Создать аккаунт",
    resetBtn: "Отправить ссылку",
    waiting: "Пожалуйста, подождите...",
    noAccount: "Нет аккаунта? Зарегистрируйтесь",
    haveAccount: "Уже есть аккаунт? Войти",
    backToLogin: "Назад к входу",
    forgotPwd: "Забыли пароль?",
    terms: "Я принимаю",
    termsLink: "Условия использования",
    termsNote: "Регистрируясь, вы принимаете наши",
    checkEmail: "Проверьте почту для подтверждения аккаунта, затем войдите.",
    resetSent: "Ссылка для сброса пароля отправлена на вашу почту.",
    fillFields: "Пожалуйста, заполните все поля",
    agreeTerms: "Пожалуйста, примите Условия использования",
    pwdWeak: "Пароль должен содержать минимум 8 символов, заглавную букву, строчную и цифру",
    pwdRequirements: "Мин. 8 символов · Заглавная · Строчная · Цифра",
  },
};

function validatePassword(pwd) {
  if (pwd.length < 8) return false;
  if (!/[A-Z]/.test(pwd)) return false;
  if (!/[a-z]/.test(pwd)) return false;
  if (!/[0-9]/.test(pwd)) return false;
  return true;
}

function PasswordStrength({ password, lang }) {
  if (!password) return null;
  const checks = [
    { label: lang === "ru" ? "8+ символов" : "8+ chars", ok: password.length >= 8 },
    { label: lang === "ru" ? "Заглавная" : "Uppercase", ok: /[A-Z]/.test(password) },
    { label: lang === "ru" ? "Строчная" : "Lowercase", ok: /[a-z]/.test(password) },
    { label: lang === "ru" ? "Цифра" : "Number", ok: /[0-9]/.test(password) },
  ];
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
      {checks.map(c => (
        <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: c.ok ? "#4ADE80" : "#6D628F" }}>
          <span>{c.ok ? "✓" : "○"}</span>
          <span>{c.label}</span>
        </div>
      ))}
    </div>
  );
}

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <svg viewBox="0 0 80 80" width="32" height="32">
        <defs><linearGradient id="lGa" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#A78BFA"/><stop offset="50%" stopColor="#8B5CF6"/><stop offset="100%" stopColor="#7C3AED"/></linearGradient></defs>
        <rect width="80" height="80" rx="18" fill={CARD}/>
        <path d="M24 16 C20 16,18 20,18 24 L18 56 C18 60,20 64,24 64 L48 64 C52 64,54 60,54 56 L54 28" stroke="url(#lGa)" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M54 28 C54 22,51 18,46 18 L24 18" stroke="url(#lGa)" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <line x1="26" y1="30" x2="46" y2="30" stroke="#8B5CF6" strokeWidth="2" opacity="0.6" strokeLinecap="round"/>
        <line x1="26" y1="38" x2="42" y2="38" stroke="#8B5CF6" strokeWidth="2" opacity="0.45" strokeLinecap="round"/>
        <path d="M60 18 L62 14 L64 18 L68 20 L64 22 L62 26 L60 22 L56 20 Z" fill="#A78BFA" opacity="0.85"/>
      </svg>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em" }}>
        <span style={{ color: "#1A1330" }}>Sell</span><span style={{ color: V1 }}>Scribe</span>
      </span>
    </div>
  );
}

export default function Auth() {
  const navigate = useNavigate();
  const [lang, setLang] = useLang();
  const T = AUTH_STRINGS[lang];

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    if (!email || (!password && mode !== "reset")) { setError(T.fillFields); return; }
    if (mode === "signup") {
      if (!validatePassword(password)) { setError(T.pwdWeak); return; }
      if (!agreedToTerms) { setError(T.agreeTerms); return; }
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess(T.checkEmail);
        setMode("login");
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/generate");
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setSuccess(T.resetSent);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => { setMode(m); setError(""); setSuccess(""); };

  const signupDisabled = loading || (mode === "signup" && !agreedToTerms);

  return (
    <div style={{ minHeight: "100vh", background: LT, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "var(--font-body)", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800;12..96,900&family=DM+Sans:wght@300;400;500;700&display=swap');
        :root { --font-display:'Bricolage Grotesque',sans-serif; --font-body:'DM Sans',sans-serif; }
        * { margin:0; padding:0; box-sizing:border-box; }
        input[type="text"], input[type="email"], input[type="password"] { outline:none; font-family:var(--font-body); }
        input:focus { border-color:${V1}70 !important; }
        button { cursor:pointer; font-family:var(--font-body); transition:transform 0.18s,opacity 0.18s; }
        button:hover:not(:disabled) { opacity:0.88; transform:translateY(-1px); }
        button:disabled { cursor:not-allowed; opacity:0.5; }
        input[type="checkbox"] { cursor:pointer; accent-color:${V1}; }
      `}</style>

      <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${V1}15, transparent 65%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-15%", left: "-5%", width: 450, height: 450, borderRadius: "50%", background: `radial-gradient(circle, ${V2}10, transparent 65%)`, pointerEvents: "none" }} />

      <div onClick={() => navigate("/")} style={{ marginBottom: 24, cursor: "pointer", position: "relative" }}>
        <Logo />
      </div>

      {/* Lang toggle */}
      <div style={{ display: "flex", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 8, overflow: "hidden", marginBottom: 24, position: "relative" }}>
        {["en", "ru"].map(l => (
          <button key={l} onClick={() => setLang(l)} style={{ padding: "6px 16px", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, background: lang === l ? "rgba(139,92,246,0.2)" : "transparent", color: lang === l ? V1 : "#9B96B8", letterSpacing: "0.04em", transition: "all 0.2s" }}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ width: "100%", maxWidth: 400, background: CARD, borderRadius: 24, padding: 36, borderTop: `2px solid ${V1}`, border: `1px solid ${V1}18`, position: "relative", boxShadow: "0 24px 80px rgba(139,92,246,0.15)" }}>

        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "#F5F3FF", marginBottom: 6, letterSpacing: "-0.02em" }}>
          {mode === "login" ? T.welcomeBack : mode === "signup" ? T.createAccount : T.resetPwd}
        </h1>
        <p style={{ fontSize: 14, color: "#9B96B8", marginBottom: 28 }}>
          {mode === "login" ? T.loginSub : mode === "signup" ? T.signupSub : T.resetSub}
        </p>

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color: "#9B96B8", display: "block", marginBottom: 7, textTransform: "uppercase" }}>{T.emailLabel}</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} placeholder="you@example.com"
            style={{ width: "100%", padding: "11px 14px", borderRadius: 10, background: `${V1}06`, border: `1px solid ${V1}18`, color: "#E8E5F5", fontSize: 14 }} />
        </div>

        {/* Password */}
        {mode !== "reset" && (
          <div style={{ marginBottom: mode === "signup" ? 8 : 24 }}>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color: "#9B96B8", display: "block", marginBottom: 7, textTransform: "uppercase" }}>{T.pwdLabel}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} placeholder="••••••••"
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, background: `${V1}06`, border: `1px solid ${V1}18`, color: "#E8E5F5", fontSize: 14 }} />
            {mode === "signup" && <PasswordStrength password={password} lang={lang} />}
          </div>
        )}

        {/* Terms checkbox — signup only */}
        {mode === "signup" && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 24, marginTop: 16 }}>
            <input type="checkbox" id="terms" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)}
              style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0 }} />
            <label htmlFor="terms" style={{ fontSize: 13, color: "#9B96B8", lineHeight: 1.5, cursor: "pointer" }}>
              {T.terms}{" "}
              <span onClick={() => navigate("/terms")} style={{ color: V3, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
                {T.termsLink}
              </span>
            </label>
          </div>
        )}

        {/* Messages */}
        {error && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#FCA5A5", fontSize: 13, marginBottom: 16 }}>{error}</div>}
        {success && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#86EFAC", fontSize: 13, marginBottom: 16 }}>{success}</div>}

        {/* Submit */}
        <button onClick={handleSubmit} disabled={signupDisabled}
          style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: signupDisabled ? `${V1}35` : `linear-gradient(135deg, ${V1}, ${V2})`, color: "#fff", fontWeight: 700, fontSize: 15, boxShadow: signupDisabled ? "none" : `0 4px 20px ${V1}35`, marginBottom: 20 }}>
          {loading ? T.waiting : mode === "login" ? T.loginBtn : mode === "signup" ? T.signupBtn : T.resetBtn}
        </button>

        {/* Links */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
          {mode === "login" && (
            <>
              <button onClick={() => switchMode("signup")} style={{ background: "none", border: "none", color: V3, fontSize: 13, fontWeight: 600 }}>{T.noAccount}</button>
              <button onClick={() => switchMode("reset")} style={{ background: "none", border: "none", color: "#6D628F", fontSize: 13 }}>{T.forgotPwd}</button>
            </>
          )}
          {mode === "signup" && <button onClick={() => switchMode("login")} style={{ background: "none", border: "none", color: V3, fontSize: 13, fontWeight: 600 }}>{T.haveAccount}</button>}
          {mode === "reset" && <button onClick={() => switchMode("login")} style={{ background: "none", border: "none", color: V3, fontSize: 13, fontWeight: 600 }}>{T.backToLogin}</button>}
        </div>
      </div>
    </div>
  );
}
