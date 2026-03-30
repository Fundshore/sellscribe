import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

const V1 = "#8B5CF6";
const V2 = "#7C3AED";
const V3 = "#A78BFA";
const DK = "#12102A";   // slightly lighter dark
const CARD = "#1C1830";
const LT = "#F7F5FF";   // light right panel
const LT2 = "#EEEAFF";  // slightly deeper for borders on light

const PLATFORMS = [
  { id: "amazon",      name: "Amazon",      color: "#FF9900", flag: "🇺🇸" },
  { id: "shopify",     name: "Shopify",     color: "#96BF48", flag: "🌐" },
  { id: "etsy",        name: "Etsy",        color: "#F1641E", flag: "🌎" },
  { id: "ebay",        name: "eBay",        color: "#E53238", flag: "🌍" },
  { id: "wildberries", name: "Wildberries", color: "#CB11AB", flag: "🇷🇺" },
  { id: "kaspi",       name: "Kaspi",       color: "#E31E24", flag: "🇰🇿" },
];

const TONES = [
  { id: "professional", label: "Professional" },
  { id: "friendly",     label: "Friendly" },
  { id: "luxury",       label: "Luxury" },
  { id: "casual",       label: "Casual" },
];

const FREE_LIMIT = 10;

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
      <svg viewBox="0 0 80 80" width="28" height="28">
        <defs><linearGradient id="lGg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#A78BFA"/><stop offset="50%" stopColor="#8B5CF6"/><stop offset="100%" stopColor="#7C3AED"/></linearGradient></defs>
        <rect width="80" height="80" rx="18" fill={CARD}/>
        <path d="M24 16 C20 16,18 20,18 24 L18 56 C18 60,20 64,24 64 L48 64 C52 64,54 60,54 56 L54 28" stroke="url(#lGg)" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M54 28 C54 22,51 18,46 18 L24 18" stroke="url(#lGg)" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <line x1="26" y1="30" x2="46" y2="30" stroke="#8B5CF6" strokeWidth="2" opacity="0.6" strokeLinecap="round"/>
        <line x1="26" y1="38" x2="42" y2="38" stroke="#8B5CF6" strokeWidth="2" opacity="0.45" strokeLinecap="round"/>
        <path d="M60 18 L62 14 L64 18 L68 20 L64 22 L62 26 L60 22 L56 20 Z" fill="#A78BFA" opacity="0.85"/>
        <circle cx="64" cy="36" r="1.5" fill="#A78BFA" opacity="0.65"/>
        <path d="M56 58 L57 55 L58 58 L61 59 L58 60 L57 63 L56 60 L53 59 Z" fill="#A78BFA" opacity="0.55"/>
      </svg>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>
        <span style={{ color: "#F5F3FF" }}>Sell</span><span style={{ color: V1 }}>Scribe</span>
      </span>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} style={{
      padding: "6px 14px", borderRadius: 8, border: `1px solid ${V1}30`,
      background: copied ? `${V1}15` : "#fff",
      color: copied ? V2 : "#6D628F", fontSize: 12, fontWeight: 600,
      transition: "all 0.2s",
    }}>
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

export default function Generator() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [product, setProduct] = useState("");
  const [features, setFeatures] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState(["amazon", "wildberries", "kaspi"]);
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [activePlatform, setActivePlatform] = useState(null);
  const [count, setCount] = useState(0);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { navigate("/auth"); return; }
      const u = data.session.user;
      setUser(u);
      const { data: profile } = await supabase
        .from("profiles")
        .select("generations_used, generations_limit")
        .eq("id", u.id)
        .single();
      if (profile) {
        setCount(profile.generations_used || 0);
        setLimit(profile.generations_limit || 10);
      }
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const togglePlatform = (id) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const generate = async () => {
    if (!product.trim()) { setError("Enter a product name"); return; }
    if (selectedPlatforms.length === 0) { setError("Select at least one platform"); return; }
    if (count >= limit) { setError(`Free limit reached (${limit} generations). Upgrade to continue.`); return; }

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, features, platforms: selectedPlatforms, tone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      const newCount = count + 1;
      await supabase.from("profiles").update({ generations_used: newCount }).eq("id", user.id);
      setCount(newCount);
      setResults(data.results);
      setActivePlatform(selectedPlatforms[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const remaining = limit - count;
  const activeResult = results && activePlatform ? results[activePlatform] : null;
  const activePlat = PLATFORMS.find(p => p.id === activePlatform);

  return (
    <div style={{ minHeight: "100vh", background: DK, fontFamily: "var(--font-body)", color: "#E8E5F5" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800;12..96,900&family=DM+Sans:wght@300;400;500;700&display=swap');
        :root { --font-display:'Bricolage Grotesque',sans-serif; --font-body:'DM Sans',sans-serif; }
        * { margin:0; padding:0; box-sizing:border-box; }
        html, body { margin:0; padding:0; background:${DK}; }
        textarea, input { outline:none; font-family:var(--font-body); }
        textarea:focus, input:focus { border-color:${V1}70 !important; }
        button { cursor:pointer; font-family:var(--font-body); transition:transform 0.18s,opacity 0.18s; }
        button:hover { opacity:0.88; transform:translateY(-1px); }
        @keyframes pulse { 0%,100%{opacity:0.2;}50%{opacity:0.5;} }
        ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-thumb{background:${V1}25;border-radius:3px;}
      `}</style>

      {/* NAV — dark */}
      <nav style={{ padding: "0 32px", borderBottom: `1px solid ${V1}12`, position: "sticky", top: 0, background: `${DK}F5`, backdropFilter: "blur(20px)", zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div onClick={() => navigate("/")}><Logo /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {user && <span style={{ fontSize: 13, color: "#9B96B8", fontWeight: 500 }}>{user.email}</span>}
            <div style={{ fontSize: 13, color: remaining <= 3 ? "#F87171" : "#6D628F", fontWeight: 600 }}>
              {remaining} / {limit} left
            </div>
            <button
              onClick={async () => {
                const res = await fetch("/api/checkout", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ plan: "growth", email: user?.email }),
                });
                const data = await res.json();
                if (data.url) window.location.href = data.url;
              }}
              style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: `linear-gradient(135deg, ${V1}, ${V2})`, color: "#fff", fontWeight: 700, fontSize: 13, boxShadow: `0 2px 12px ${V1}30` }}
            >
              Upgrade
            </button>
            <button onClick={logout} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${V1}20`, background: "transparent", color: "#6D628F", fontWeight: 600, fontSize: 13 }}>
              Log out
            </button>
          </div>
        </div>
      </nav>

      {/* SPLIT LAYOUT */}
      <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", minHeight: "calc(100vh - 60px)" }}>

        {/* LEFT — dark input panel */}
        <div style={{ background: DK, padding: "36px 32px", borderRight: `1px solid ${V1}10`, display: "flex", flexDirection: "column", gap: 20, overflowY: "auto" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "#F5F3FF", letterSpacing: "-0.03em", marginBottom: 5 }}>
              Generate listing
            </h1>
            <p style={{ fontSize: 13, color: "#9B96B8" }}>Describe your product, pick platforms, get copy.</p>
          </div>

          {/* Product name */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color: "#9B96B8", display: "block", marginBottom: 7, textTransform: "uppercase" }}>Product name *</label>
            <input
              value={product}
              onChange={e => setProduct(e.target.value)}
              placeholder="e.g. Bamboo Wireless Charging Pad"
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, background: CARD, border: `1px solid ${V1}15`, color: "#E8E5F5", fontSize: 14 }}
            />
          </div>

          {/* Features */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color: "#9B96B8", display: "block", marginBottom: 7, textTransform: "uppercase" }}>
              Key features <span style={{ color: "#3D3A52", fontWeight: 500, textTransform: "none", letterSpacing: 0, fontSize: 12 }}>(optional)</span>
            </label>
            <textarea
              value={features}
              onChange={e => setFeatures(e.target.value)}
              placeholder={"Material: bamboo\nCharging: 15W Qi\nCompatible: iPhone, Samsung\nColor: natural"}
              rows={4}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, background: CARD, border: `1px solid ${V1}15`, color: "#E8E5F5", fontSize: 13, resize: "vertical", lineHeight: 1.6 }}
            />
          </div>

          {/* Platforms */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color: "#9B96B8", display: "block", marginBottom: 10, textTransform: "uppercase" }}>Platforms</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {PLATFORMS.map(p => {
                const selected = selectedPlatforms.includes(p.id);
                return (
                  <div key={p.id} onClick={() => togglePlatform(p.id)} style={{
                    display: "flex", alignItems: "center", gap: 11, padding: "9px 13px",
                    borderRadius: 9, cursor: "pointer",
                    background: selected ? `${p.color}0E` : `${V1}04`,
                    border: `1px solid ${selected ? p.color + "28" : V1 + "0A"}`,
                    transition: "all 0.18s",
                  }}>
                    <div style={{
                      width: 17, height: 17, borderRadius: 5,
                      border: `2px solid ${selected ? p.color : "#3D3A52"}`,
                      background: selected ? p.color : "transparent", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.18s",
                    }}>
                      {selected && <span style={{ color: "#fff", fontSize: 10, fontWeight: 800 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 13 }}>{p.flag}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: selected ? p.color : "#9B96B8", flex: 1 }}>{p.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tone */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color: "#9B96B8", display: "block", marginBottom: 10, textTransform: "uppercase" }}>Tone</label>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {TONES.map(t => (
                <button key={t.id} onClick={() => setTone(t.id)} style={{
                  padding: "7px 15px", borderRadius: 100, border: "none",
                  background: tone === t.id ? `linear-gradient(135deg, ${V1}, ${V2})` : `${V1}08`,
                  color: tone === t.id ? "#fff" : "#6D628F",
                  fontSize: 13, fontWeight: 600,
                  boxShadow: tone === t.id ? `0 2px 10px ${V1}30` : "none",
                }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#FCA5A5", fontSize: 13 }}>
              {error}
            </div>
          )}

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={loading}
            style={{
              width: "100%", padding: "14px", borderRadius: 12, border: "none",
              background: loading ? `${V1}35` : `linear-gradient(135deg, ${V1}, ${V2})`,
              color: "#fff", fontWeight: 700, fontSize: 15,
              boxShadow: loading ? "none" : `0 4px 22px ${V1}35`,
              marginTop: "auto",
            }}
          >
            {loading ? "✦ Generating..." : "✦ Generate listings"}
          </button>
        </div>

        {/* RIGHT — light output panel */}
        <div style={{ background: LT, padding: "36px 40px", overflowY: "auto", display: "flex", flexDirection: "column" }}>

          {!results && !loading && (
            <div style={{
              flex: 1, minHeight: "calc(100vh - 132px)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14,
              textAlign: "center",
            }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: `${V1}12`, border: `1px solid ${V1}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: V1 }}>✦</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "#1A1530" }}>Your listings will appear here</h3>
              <p style={{ color: "#9B96B8", fontSize: 14, maxWidth: 260, lineHeight: 1.65 }}>Fill in the product details on the left and click Generate</p>
            </div>
          )}

          {loading && (
            <div style={{
              flex: 1, minHeight: "calc(100vh - 132px)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20,
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 360 }}>
                {[90, 75, 60, 45, 80, 55].map((w, i) => (
                  <div key={i} style={{ height: 10, width: `${w}%`, borderRadius: 5, background: `${V1}18`, animation: `pulse 1.4s ease-in-out ${i * 0.1}s infinite` }} />
                ))}
              </div>
              <p style={{ color: "#9B96B8", fontSize: 13 }}>✦ Writing your listings...</p>
            </div>
          )}

          {results && (
            <div>
              {/* Platform tabs */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
                {selectedPlatforms.map(id => {
                  const p = PLATFORMS.find(pl => pl.id === id);
                  const active = activePlatform === id;
                  return (
                    <button key={id} onClick={() => setActivePlatform(id)} style={{
                      padding: "8px 18px", borderRadius: 100, border: "none",
                      background: active ? p.color : "#fff",
                      color: active ? "#fff" : "#6B647A",
                      fontWeight: 600, fontSize: 13,
                      boxShadow: active ? `0 2px 12px ${p.color}35` : "0 1px 4px rgba(0,0,0,0.08)",
                      transition: "all 0.2s",
                    }}>
                      {p.flag} {p.name}
                    </button>
                  );
                })}
              </div>

              {/* Result */}
              {activeResult && activePlat && (
                <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${LT2}`, overflow: "hidden", boxShadow: "0 2px 16px rgba(139,92,246,0.06)" }}>
                  <div style={{ padding: "16px 20px", borderBottom: `1px solid ${LT2}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: `${activePlat.color}06` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.09em", color: activePlat.color, textTransform: "uppercase" }}>
                      {activePlat.name} · {activePlat.flag}
                    </div>
                    <CopyButton text={activeResult} />
                  </div>
                  <div style={{
                    padding: "24px", fontFamily: "var(--font-body)", fontSize: 14,
                    color: "#2A2340", lineHeight: 1.8, whiteSpace: "pre-wrap",
                    minHeight: 200,
                  }}>
                    {activeResult}
                  </div>
                  <div style={{ padding: "12px 20px", borderTop: `1px solid ${LT2}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#B0AACC" }}>{selectedPlatforms.length} platforms generated</span>
                    <button onClick={generate} style={{
                      padding: "6px 14px", borderRadius: 8, border: `1px solid ${V1}20`,
                      background: "transparent", color: V2, fontSize: 12, fontWeight: 600,
                    }}>
                      ↻ Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
