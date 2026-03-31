import { useState } from "react";
import { useLang } from "./useLang";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

const V1 = "#8B5CF6";
const V2 = "#7C3AED";
const V3 = "#A78BFA";
const CARD = "#1C1830";
const LT = "#F0ECFF";   // light lavender background

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
  const T = {
    en: {
      welcomeBack: "Welcome back", createAccount: "Create account", resetPwd: "Reset password",
      loginSub: "Log in to your SellScribe account",
      signupSub: "Start generating listings for free",
      resetSub: "We\'ll send you a reset link",
      emailLabel: T.emailLabel, pwdLabel: T.pwdLabel,
      loginBtn: "Log in", signupBtn: "Create account", resetBtn: "Send reset link",
      waiting: "Please wait...",
      noAccount: "Don\'t have an account? Sign up",
      haveAccount: T.haveAccount,
      backToLogin: T.backToLogin,
      forgotPwd: T.forgotPwd,
      terms: T.terms,
      checkEmail: T.checkEmail,
      resetSent: T.resetSent,
      fillFields: T.fillFields,
    },
    ru: {
      welcomeBack: "С возвращением", createAccount: "Создать аккаунт", resetPwd: "Сброс пароля",
      loginSub: "Войдите в свой аккаунт SellScribe",
      signupSub: "Начните создавать листинги бесплатно",
      resetSub: "Отправим ссылку для сброса пароля",
      emailLabel: "Электронная почта", pwdLabel: "Пароль",
      loginBtn: "Войти", signupBtn: "Создать аккаунт", resetBtn: "Отправить ссылку",
      waiting: "Пожалуйста, подождите...",
      noAccount: "Нет аккаунта? Зарегистрируйтесь",
      haveAccount: "Уже есть аккаунт? Войти",
      backToLogin: "Назад к входу",
      forgotPwd: "Забыли пароль?",
      terms: "Продолжая, вы соглашаетесь с нашими Условиями использования",
      checkEmail: "Проверьте почту для подтверждения аккаунта, затем войдите.",
      resetSent: "Ссылка для сброса пароля отправлена на вашу почту.",
      fillFields: "Пожалуйста, заполните все поля",
    },
  }[lang];
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    if (!email || (!password && mode !== "reset")) { setError("Please fill in all fields"); return; }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess("Check your email to confirm your account, then log in.");
        setMode("login");
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/generate");
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setSuccess("Password reset link sent to your email.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: LT, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "var(--font-body)", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800;12..96,900&family=DM+Sans:wght@300;400;500;700&display=swap');
        :root { --font-display:'Bricolage Grotesque',sans-serif; --font-body:'DM Sans',sans-serif; }
        * { margin:0; padding:0; box-sizing:border-box; }
        input { outline:none; font-family:var(--font-body); }
        input:focus { border-color:${V1}70 !important; }
        button { cursor:pointer; font-family:var(--font-body); transition:transform 0.18s,opacity 0.18s; }
        button:hover { opacity:0.88; transform:translateY(-1px); }
      `}</style>

      {/* Background orbs */}
      <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${V1}15, transparent 65%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-15%", left: "-5%", width: 450, height: 450, borderRadius: "50%", background: `radial-gradient(circle, ${V2}10, transparent 65%)`, pointerEvents: "none" }} />

      {/* Logo */}
      <div onClick={() => navigate("/")} style={{ marginBottom: 36, cursor: "pointer", position: "relative" }}>
        <Logo />
      </div>

      {/* Lang toggle */}
      <div style={{ display: "flex", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 8, overflow: "hidden", marginBottom: 20, position: "relative" }}>
        {["en", "ru"].map(l => (
          <button key={l} onClick={() => setLang(l)} style={{ padding: "6px 16px", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, background: lang === l ? "rgba(139,92,246,0.2)" : "transparent", color: lang === l ? "#A78BFA" : "#9B96B8", letterSpacing: "0.04em", transition: "all 0.2s" }}>{l.toUpperCase()}</button>
        ))}
      </div>

      {/* Dark card on light bg */}
      <div style={{ width: "100%", maxWidth: 400, background: CARD, borderRadius: 24, padding: 36, borderTop: `2px solid ${V1}`, border: `1px solid ${V1}18`, position: "relative", boxShadow: "0 24px 80px rgba(139,92,246,0.15)" }}>

        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "#F5F3FF", marginBottom: 6, letterSpacing: "-0.02em" }}>
          {mode === "login" ? T.welcomeBack : mode === "signup" ? T.createAccount : T.resetPwd}
        </h1>
        <p style={{ fontSize: 14, color: "#9B96B8", marginBottom: 28 }}>
          {mode === "login" ? T.loginSub : mode === "signup" ? T.signupSub : T.resetSub}
        </p>

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color: "#9B96B8", display: "block", marginBottom: 7, textTransform: "uppercase" }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="you@example.com"
            style={{ width: "100%", padding: "11px 14px", borderRadius: 10, background: `${V1}06`, border: `1px solid ${V1}18`, color: "#E8E5F5", fontSize: 14 }}
          />
        </div>

        {/* Password */}
        {mode !== "reset" && (
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color: "#9B96B8", display: "block", marginBottom: 7, textTransform: "uppercase" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="••••••••"
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, background: `${V1}06`, border: `1px solid ${V1}18`, color: "#E8E5F5", fontSize: 14 }}
            />
          </div>
        )}

        {/* Messages */}
        {error && (
          <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#FCA5A5", fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#86EFAC", fontSize: 13, marginBottom: 16 }}>
            {success}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%", padding: "13px", borderRadius: 12, border: "none",
            background: loading ? `${V1}40` : `linear-gradient(135deg, ${V1}, ${V2})`,
            color: "#fff", fontWeight: 700, fontSize: 15,
            boxShadow: loading ? "none" : `0 4px 20px ${V1}35`,
            marginBottom: 20,
          }}
        >
          {loading ? T.waiting : mode === "login" ? T.loginBtn : mode === "signup" ? T.signupBtn : T.resetBtn}
        </button>

        {/* Links */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
          {mode === "login" && (
            <>
              <button onClick={() => { setMode("signup"); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", color: V3, fontSize: 13, fontWeight: 600 }}>
                Don't have an account? Sign up
              </button>
              <button onClick={() => { setMode("reset"); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", color: "#9B96B8", fontSize: 13 }}>
                Forgot password?
              </button>
            </>
          )}
          {mode === "signup" && (
            <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", color: V3, fontSize: 13, fontWeight: 600 }}>
              Already have an account? Log in
            </button>
          )}
          {mode === "reset" && (
            <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", color: V3, fontSize: 13, fontWeight: 600 }}>
              Back to login
            </button>
          )}
        </div>
      </div>

      <p style={{ marginTop: 24, color: "#B0AACC", fontSize: 12, position: "relative" }}>
        By continuing you agree to our Terms of Service
      </p>
    </div>
  );
}
