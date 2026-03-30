import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

const V1 = "#8B5CF6";
const V2 = "#7C3AED";
const V3 = "#A78BFA";
const DK = "#0A0814";
const CARD = "#110E1D";

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
        <span style={{ color: "#F5F3FF" }}>Sell</span><span style={{ color: V1 }}>Scribe</span>
      </span>
    </div>
  );
}

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // login | signup | reset
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    if (!email || (!password && mode !== "reset")) {
      setError("Please fill in all fields");
      return;
    }
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div style={{ minHeight: "100vh", background: DK, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "var(--font-body)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800;12..96,900&family=DM+Sans:wght@300;400;500;700&display=swap');
        :root { --font-display:'Bricolage Grotesque',sans-serif; --font-body:'DM Sans',sans-serif; }
        * { margin:0; padding:0; box-sizing:border-box; }
        input { outline:none; font-family:var(--font-body); }
        input:focus { border-color: ${V1}80 !important; }
        button { cursor:pointer; font-family:var(--font-body); transition: transform 0.18s, opacity 0.18s; }
        button:hover { opacity: 0.88; transform: translateY(-1px); }
      `}</style>

      {/* Ambient orbs */}
      <div style={{ position: "fixed", top: "10%", left: "5%", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${V2}0A, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "10%", right: "5%", width: 350, height: 350, borderRadius: "50%", background: `radial-gradient(circle, ${V1}08, transparent 70%)`, pointerEvents: "none" }} />

      {/* Logo */}
      <div onClick={() => navigate("/")} style={{ marginBottom: 40, cursor: "pointer" }}>
        <Logo />
      </div>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: 400, background: CARD, borderRadius: 20, padding: 36, border: `1px solid ${V1}12`, position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${V2}, ${V1}, ${V3})`, borderRadius: "20px 20px 0 0" }} />

        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "#F5F3FF", marginBottom: 6, letterSpacing: "-0.02em" }}>
          {mode === "login" ? "Welcome back" : mode === "signup" ? "Create account" : "Reset password"}
        </h1>
        <p style={{ fontSize: 14, color: "#6D628F", marginBottom: 28 }}>
          {mode === "login" ? "Log in to your SellScribe account" : mode === "signup" ? "Start generating listings for free" : "We'll send you a reset link"}
        </p>

        {/* Email */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#6D628F", display: "block", marginBottom: 7, textTransform: "uppercase" }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="you@example.com"
            style={{ width: "100%", padding: "11px 14px", borderRadius: 10, background: `${V1}06`, border: `1px solid ${V1}15`, color: "#E8E5F5", fontSize: 14 }}
          />
        </div>

        {/* Password */}
        {mode !== "reset" && (
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#6D628F", display: "block", marginBottom: 7, textTransform: "uppercase" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="••••••••"
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, background: `${V1}06`, border: `1px solid ${V1}15`, color: "#E8E5F5", fontSize: 14 }}
            />
          </div>
        )}

        {/* Error / Success */}
        {error && (
          <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#FCA5A5", fontSize: 13, marginBottom: 16 }}>
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
          {loading ? "Please wait..." : mode === "login" ? "Log in" : mode === "signup" ? "Create account" : "Send reset link"}
        </button>

        {/* Links */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
          {mode === "login" && (
            <>
              <button onClick={() => { setMode("signup"); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", color: V3, fontSize: 13, fontWeight: 600 }}>
                Don't have an account? Sign up
              </button>
              <button onClick={() => { setMode("reset"); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", color: "#4A4768", fontSize: 13 }}>
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

      <p style={{ marginTop: 24, color: "#3D3A52", fontSize: 12 }}>
        By continuing you agree to our Terms of Service
      </p>
    </div>
  );
}
