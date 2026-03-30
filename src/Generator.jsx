import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

const V1 = "#8B5CF6";
const V2 = "#7C3AED";
const V3 = "#A78BFA";
const DK = "#0A0814";
const CARD = "#110E1D";

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
const STORAGE_KEY = "ss_gen_count";

function getCount() {
  return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
}
function incrementCount() {
  const n = getCount() + 1;
  localStorage.setItem(STORAGE_KEY, n);
  return n;
}

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
      padding: "6px 14px", borderRadius: 8, border: `1px solid ${V1}25`,
      background: copied ? `${V1}20` : "transparent",
      color: copied ? V3 : "#6D628F", fontSize: 12, fontWeight: 600,
      fontFamily: "var(--font-body)", cursor: "pointer", transition: "all 0.2s",
    }}>
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

export default function Generator() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    if (!data.session) navigate("/auth");
    else setUser(data.session.user);
  });
}, []);
  const [product, setProduct] = useState("");
  const [features, setFeatures] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState(["amazon", "wildberries", "kaspi"]);
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [activePlatform, setActivePlatform] = useState(null);
  const [count, setCount] = useState(getCount());

  const togglePlatform = (id) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const generate = async () => {
    if (!product.trim()) { setError("Enter a product name"); return; }
    if (selectedPlatforms.length === 0) { setError("Select at least one platform"); return; }
    if (count >= FREE_LIMIT) { setError(`Free limit reached (${FREE_LIMIT} generations). Upgrade to continue.`); return; }

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

      const newCount = incrementCount();
      setCount(newCount);
      setResults(data.results);
      setActivePlatform(selectedPlatforms[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const remaining = FREE_LIMIT - count;
  const activeResult = results && activePlatform ? results[activePlatform] : null;
  const activePlat = PLATFORMS.find(p => p.id === activePlatform);

  return (
    <div style={{ minHeight: "100vh", background: DK, fontFamily: "var(--font-body)", color: "#E8E5F5" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800;12..96,900&family=DM+Sans:wght@300;400;500;700&display=swap');
        :root { --font-display:'Bricolage Grotesque',sans-serif; --font-body:'DM Sans',sans-serif; }
        * { margin:0; padding:0; box-sizing:border-box; }
        textarea, input { outline:none; font-family:var(--font-body); }
        textarea:focus, input:focus { border-color: ${V1}60 !important; }
        button { cursor:pointer; font-family:var(--font-body); transition: transform 0.18s, opacity 0.18s; }
        button:hover { opacity: 0.88; }
        ::-webkit-scrollbar { width:6px; } ::-webkit-scrollbar-track { background:transparent; } ::-webkit-scrollbar-thumb { background:${V1}30; border-radius:3px; }
      `}</style>

      {/* NAV */}
      <nav style={{ padding: "0 32px", borderBottom: `1px solid ${V1}0A`, position: "sticky", top: 0, background: `${DK}F0`, backdropFilter: "blur(20px)", zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div onClick={() => navigate("/")}><Logo /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 13, color: remaining <= 3 ? "#F87171" : "#6D628F", fontWeight: 500 }}>
              {remaining} free {remaining === 1 ? "generation" : "generations"} left
            </div>
            <button style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: `linear-gradient(135deg, ${V1}, ${V2})`, color: "#fff", fontWeight: 700, fontSize: 13, boxShadow: `0 2px 12px ${V1}30` }}>
              Upgrade
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 32px", display: "grid", gridTemplateColumns: "380px 1fr", gap: 32, alignItems: "start" }}>

        {/* LEFT — Input panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "#F5F3FF", letterSpacing: "-0.03em", marginBottom: 6 }}>
              Generate listing
            </h1>
            <p style={{ fontSize: 14, color: "#6D628F" }}>Describe your product, pick platforms, get copy.</p>
          </div>

          {/* Product name */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#6D628F", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Product name *</label>
            <input
              value={product}
              onChange={e => setProduct(e.target.value)}
              placeholder="e.g. Bamboo Wireless Charging Pad"
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 10,
                background: CARD, border: `1px solid ${V1}15`,
                color: "#E8E5F5", fontSize: 14,
              }}
            />
          </div>

          {/* Features */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#6D628F", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Key features <span style={{ color: "#4A4768", fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
            <textarea
              value={features}
              onChange={e => setFeatures(e.target.value)}
              placeholder="Material: bamboo&#10;Charging: 15W Qi&#10;Compatible: iPhone, Samsung&#10;Color: natural"
              rows={5}
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 10,
                background: CARD, border: `1px solid ${V1}15`,
                color: "#E8E5F5", fontSize: 14, resize: "vertical", lineHeight: 1.6,
              }}
            />
          </div>

          {/* Platforms */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#6D628F", display: "block", marginBottom: 10, textTransform: "uppercase" }}>Platforms</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PLATFORMS.map(p => {
                const selected = selectedPlatforms.includes(p.id);
                return (
                  <div key={p.id} onClick={() => togglePlatform(p.id)} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                    borderRadius: 10, cursor: "pointer",
                    background: selected ? `${p.color}10` : `${V1}04`,
                    border: `1px solid ${selected ? p.color + "30" : V1 + "0A"}`,
                    transition: "all 0.2s",
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 5, border: `2px solid ${selected ? p.color : "#4A4768"}`,
                      background: selected ? p.color : "transparent", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s",
                    }}>
                      {selected && <span style={{ color: "#fff", fontSize: 11, fontWeight: 800 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 13 }}>{p.flag}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: selected ? p.color : "#9B96B8", flex: 1 }}>{p.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tone */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#6D628F", display: "block", marginBottom: 10, textTransform: "uppercase" }}>Tone</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {TONES.map(t => (
                <button key={t.id} onClick={() => setTone(t.id)} style={{
                  padding: "7px 16px", borderRadius: 100, border: "none",
                  background: tone === t.id ? `linear-gradient(135deg, ${V1}, ${V2})` : `${V1}08`,
                  color: tone === t.id ? "#fff" : "#6D628F",
                  fontSize: 13, fontWeight: 600,
                  boxShadow: tone === t.id ? `0 2px 12px ${V1}30` : "none",
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
              background: loading ? `${V1}40` : `linear-gradient(135deg, ${V1}, ${V2})`,
              color: "#fff", fontWeight: 700, fontSize: 15,
              boxShadow: loading ? "none" : `0 4px 24px ${V1}35`,
            }}
          >
            {loading ? "✦ Generating..." : "✦ Generate listings"}
          </button>
        </div>

        {/* RIGHT — Output */}
        <div style={{ position: "sticky", top: 80 }}>
          {!results && !loading && (
            <div style={{
              background: CARD, borderRadius: 20, padding: "60px 40px",
              border: `1px solid ${V1}0A`, textAlign: "center",
              minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
            }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>✦</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "#F5F3FF" }}>Your listings will appear here</h3>
              <p style={{ color: "#4A4768", fontSize: 14, maxWidth: 280, lineHeight: 1.65 }}>Fill in the product details on the left and click Generate</p>
            </div>
          )}

          {loading && (
            <div style={{
              background: CARD, borderRadius: 20, padding: "60px 40px",
              border: `1px solid ${V1}0A`, textAlign: "center",
              minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16,
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 340 }}>
                {[90, 75, 60, 45, 80, 55].map((w, i) => (
                  <div key={i} style={{ height: 10, width: `${w}%`, borderRadius: 5, background: `${V1}15`, animation: `pulse 1.4s ease-in-out ${i * 0.1}s infinite` }} />
                ))}
              </div>
              <p style={{ color: "#6D628F", fontSize: 13 }}>✦ Writing your listings...</p>
            </div>
          )}

          {results && (
            <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${V1}0A`, overflow: "hidden" }}>
              {/* Platform tabs */}
              <div style={{ display: "flex", borderBottom: `1px solid ${V1}0A`, overflowX: "auto" }}>
                {selectedPlatforms.map(id => {
                  const p = PLATFORMS.find(pl => pl.id === id);
                  const active = activePlatform === id;
                  return (
                    <button key={id} onClick={() => setActivePlatform(id)} style={{
                      padding: "14px 20px", border: "none", borderBottom: active ? `2px solid ${p.color}` : "2px solid transparent",
                      background: active ? `${p.color}08` : "transparent",
                      color: active ? p.color : "#6D628F", fontWeight: 600, fontSize: 13,
                      whiteSpace: "nowrap", flexShrink: 0,
                    }}>
                      {p.flag} {p.name}
                    </button>
                  );
                })}
              </div>

              {/* Result content */}
              {activeResult && activePlat && (
                <div style={{ padding: 28 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: activePlat.color, textTransform: "uppercase" }}>
                      {activePlat.name} · {activePlat.flag}
                    </div>
                    <CopyButton text={activeResult} />
                  </div>
                  <div style={{
                    fontFamily: "var(--font-body)", fontSize: 14, color: "#D6D3E8",
                    lineHeight: 1.75, whiteSpace: "pre-wrap",
                    padding: "20px", background: `${DK}80`, borderRadius: 12,
                    border: `1px solid ${V1}08`, minHeight: 200,
                  }}>
                    {activeResult}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div style={{ padding: "14px 28px", borderTop: `1px solid ${V1}08`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#4A4768" }}>{selectedPlatforms.length} platforms generated</span>
                <button onClick={generate} style={{
                  padding: "7px 16px", borderRadius: 8, border: `1px solid ${V1}20`,
                  background: "transparent", color: V3, fontSize: 12, fontWeight: 600,
                }}>
                  ↻ Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
