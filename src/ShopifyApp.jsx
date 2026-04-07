import { useState, useEffect } from "react";

const V1 = "#8B5CF6";
const V2 = "#7C3AED";
const V3 = "#A78BFA";
const LT = "#F7F5FF";

function getShopFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("shop") || "";
}

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <svg viewBox="0 0 80 80" width="28" height="28">
        <defs><linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#A78BFA"/><stop offset="100%" stopColor="#7C3AED"/></linearGradient></defs>
        <rect width="80" height="80" rx="18" fill="#110E1D"/>
        <path d="M24 16 C20 16,18 20,18 24 L18 56 C18 60,20 64,24 64 L48 64 C52 64,54 60,54 56 L54 28" stroke="url(#sg)" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M54 28 C54 22,51 18,46 18 L24 18" stroke="url(#sg)" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <line x1="26" y1="30" x2="46" y2="30" stroke="#8B5CF6" strokeWidth="2" opacity="0.6" strokeLinecap="round"/>
        <line x1="26" y1="38" x2="42" y2="38" stroke="#8B5CF6" strokeWidth="2" opacity="0.45" strokeLinecap="round"/>
        <path d="M60 18 L62 14 L64 18 L68 20 L64 22 L62 26 L60 22 L56 20 Z" fill="#A78BFA" opacity="0.85"/>
      </svg>
      <span style={{ fontFamily: "system-ui, sans-serif", fontWeight: 800, fontSize: 17, letterSpacing: "-0.02em" }}>
        <span style={{ color: "#1A1330" }}>Sell</span><span style={{ color: V1 }}>Scribe</span>
      </span>
    </div>
  );
}

export default function ShopifyApp() {
  const shop = getShopFromUrl();

  // Products
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productSearch, setProductSearch] = useState("");

  // Tab
  const [tab, setTab] = useState("analyze"); // analyze | fix

  // Analyze
  const [myName, setMyName] = useState("");
  const [myListing, setMyListing] = useState("");
  const [competitorName, setCompetitorName] = useState("");
  const [competitorText, setCompetitorText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState("");
  const [analyzeResult, setAnalyzeResult] = useState(null);
  const [analyzeError, setAnalyzeError] = useState("");

  // Fix
  const [fixing, setFixing] = useState(false);
  const [fixStatus, setFixStatus] = useState("");
  const [fixResult, setFixResult] = useState(null);
  const [fixError, setFixError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem("ss_welcomed"));

  useEffect(() => {
    if (!shop) return;
    fetch(`/api/shopify/products?shop=${shop}`)
      .then(r => r.json())
      .then(data => { setProducts(data.products || []); setLoadingProducts(false); })
      .catch(() => setLoadingProducts(false));
  }, [shop]);

  const selectProduct = (product) => {
    setSelectedProduct(product);
    setMyName(product.title);
    const body = product.body_html?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || "";
    setMyListing(body);
    setAnalyzeResult(null);
    setFixResult(null);
    setSaved(false);
  };

  const runAnalyze = async () => {
    if (!myListing.trim()) { setAnalyzeError("Paste your listing first"); return; }
    const comps = competitorText.trim()
      ? [competitorName ? `${competitorName}\n${competitorText}` : competitorText]
      : [];

    setAnalyzing(true); setAnalyzeError(""); setAnalyzeResult(null); setFixResult(null);
    const steps = ["Reading your listing...", "Analyzing structure...", "Checking keywords...", "Building score..."];
    let si = 0; setAnalyzeStatus(steps[0]);
    const timer = setInterval(() => { si = Math.min(si+1, steps.length-1); setAnalyzeStatus(steps[si]); }, 1800);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ myListing, myName, competitors: comps, lang: "en" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setAnalyzeResult(data);
    } catch (err) {
      setAnalyzeError(err.message);
    } finally {
      clearInterval(timer); setAnalyzeStatus(""); setAnalyzing(false);
    }
  };

  const runFix = async () => {
    if (!analyzeResult) return;
    setFixing(true); setFixError(""); setFixResult(null); setSaved(false);
    const steps = ["Reviewing analysis...", "Rewriting title...", "Improving description...", "Adding keywords...", "Final polish..."];
    let si = 0; setFixStatus(steps[0]);
    const timer = setInterval(() => { si = Math.min(si+1, steps.length-1); setFixStatus(steps[si]); }, 1800);
    try {
      const res = await fetch("/api/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ myListing, myName, analyzeResult, lang: "en" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fix failed");
      setFixResult(data);
      setTab("fix");
    } catch (err) {
      setFixError(err.message);
    } finally {
      clearInterval(timer); setFixStatus(""); setFixing(false);
    }
  };

  const saveToShopify = async () => {
    if (!fixResult) return;
    if (!selectedProduct) { setFixError("Select a product from the list on the left first."); return; }
    setSaving(true); setFixError("");
    // Build description from sections or fallback to fixedBody
    let description = fixResult.fixedBody || "";
    if (!description && fixResult.fixedSections?.length) {
      description = fixResult.fixedSections.map(s => {
        if (s.type === "bullets") return s.items?.map(i => `• ${i}`).join("\n") || "";
        if (s.type === "specs") return s.items?.join("\n") || "";
        return s.content || "";
      }).join("\n\n");
    }
    try {
      const res = await fetch("/api/shopify/save-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop,
          productId: selectedProduct.id,
          title: fixResult.fixedTitle || selectedProduct.title,
          description: description || myListing,
        }),
      });
      const data = await res.json();
      if (res.ok) setSaved(true);
      else throw new Error(data.error || "Failed to save");
    } catch (err) {
      setFixError("Save failed: " + err.message + ". Try copying manually.");
    } finally {
      setSaving(false);
    }
  };

  const copyFixed = () => {
    if (!fixResult) return;
    navigator.clipboard.writeText(`${fixResult.fixedTitle || ""}\n\n${fixResult.fixedBody || ""}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(productSearch.toLowerCase())
  );

  const myCol = analyzeResult ? (analyzeResult.score >= 60 ? "#22C55E" : analyzeResult.score >= 40 ? "#F59E0B" : "#FF4D6D") : V1;
  const compCol = analyzeResult ? ((analyzeResult.competitorScore||0) >= 60 ? "#22C55E" : (analyzeResult.competitorScore||0) >= 40 ? "#F59E0B" : "#FF4D6D") : "#9B96B8";

  return (
    <div style={{ minHeight: "100vh", background: "#F7F5FF", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        textarea, input { outline: none; font-family: inherit; }
        textarea:focus, input:focus { border-color: ${V1}80 !important; }
        button { cursor: pointer; font-family: inherit; transition: opacity 0.18s, transform 0.18s; }
        button:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        button:disabled { cursor: not-allowed; opacity: 0.5; }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${V1}25; border-radius: 2px; }
      `}</style>

      {/* Welcome screen */}
      {showWelcome && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,19,48,0.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "#fff", borderRadius: 24, padding: 40, maxWidth: 520, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ marginBottom: 24 }}><Logo /></div>
            <h2 style={{ fontFamily: "system-ui", fontSize: 22, fontWeight: 800, color: "#1A1330", letterSpacing: "-0.02em", marginBottom: 10 }}>
              Find out why your listings aren't converting — and fix them in one click.
            </h2>
            <p style={{ fontSize: 14, color: "#1A1330", lineHeight: 1.65, marginBottom: 28 }}>
              SellScribe analyzes your Shopify listings against top competitors, shows you exactly what's costing you sales, and rewrites them to beat the competition.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
              {[
                { n: "1", icon: "◉", color: V1, title: "Select a product", desc: "Pick any product from your store — the listing loads automatically." },
                { n: "2", icon: "⚡", color: "#CB11AB", title: "Add a competitor listing", desc: "Open a top competitor's page, copy their title and description — paste it in." },
                { n: "3", icon: "✦", color: "#22C55E", title: "Analyze & Fix", desc: "See your score vs theirs, find weak spots, and get a rewritten listing in seconds." },
              ].map(step => (
                <div key={step.n} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${step.color}12`, border: `1px solid ${step.color}25`, display: "flex", alignItems: "center", justifyContent: "center", color: step.color, fontSize: 16, flexShrink: 0 }}>{step.icon}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1330", marginBottom: 2 }}>{step.title}</div>
                    <div style={{ fontSize: 13, color: "#1A1330", lineHeight: 1.5 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "12px 16px", borderRadius: 12, background: "#F7F5FF", border: `1px solid ${V1}15`, fontSize: 12, color: "#2A2340", marginBottom: 24, lineHeight: 1.6 }}>
              💡 <strong style={{ color: "#1A1330" }}>Tip:</strong> Open a competitor's product page, select all text, copy and paste into the Competitor listing field. That's it — no URLs needed.
            </div>
            <button onClick={() => { setShowWelcome(false); localStorage.setItem("ss_welcomed", "1"); }} style={{
              width: "100%", padding: "14px", borderRadius: 14, border: "none",
              background: `linear-gradient(135deg, ${V1}, ${V2})`,
              color: "#fff", fontWeight: 700, fontSize: 16,
              boxShadow: `0 4px 20px ${V1}35`,
            }}>
              Get started →
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #EDE9F8", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo />
        <div style={{ fontSize: 12, color: "#2A2340" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {shop && <span>Connected to <strong style={{ color: "#1A1330" }}>{shop}</strong></span>}
            <button onClick={() => setShowWelcome(true)} style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${V1}25`, background: `${V1}08`, color: V1, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>?</button>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", minHeight: "calc(100vh - 57px)" }}>

        {/* LEFT — Product selector */}
        <div style={{ background: "#fff", borderRight: "1px solid #EDE9F8", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "16px", borderBottom: "1px solid #EDE9F8" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#2A2340", letterSpacing: "0.08em", marginBottom: 8 }}>YOUR PRODUCTS</div>
            <input
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              placeholder="Search products..."
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #EDE9F8", background: "#F7F5FF", fontSize: 13, color: "#1A1330" }}
            />
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            {loadingProducts && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 16, color: "#2A2340", fontSize: 13 }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${V1}30`, borderTop: `2px solid ${V1}`, animation: "spin 0.8s linear infinite" }} />
                Loading products...
              </div>
            )}
            {!loadingProducts && filteredProducts.length === 0 && (
              <div style={{ padding: 16, color: "#2A2340", fontSize: 13, textAlign: "center" }}>No products found</div>
            )}
            {filteredProducts.map(product => {
              const isSelected = selectedProduct?.id === product.id;
              return (
                <div key={product.id} onClick={() => selectProduct(product)} style={{
                  padding: "10px 12px", borderRadius: 10, marginBottom: 4, cursor: "pointer",
                  background: isSelected ? `${V1}10` : "transparent",
                  border: `1px solid ${isSelected ? V1 + "30" : "transparent"}`,
                  transition: "all 0.15s",
                }}>
                  <div style={{ fontSize: 13, fontWeight: isSelected ? 600 : 400, color: isSelected ? V2 : "#1A1330", lineHeight: 1.4 }}>{product.title}</div>
                  {product.variants?.[0]?.price && (
                    <div style={{ fontSize: 11, color: "#2A2340", marginTop: 3 }}>${product.variants[0].price}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT — Main content */}
        <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", overflow: "hidden" }}>

          {/* Middle — Input panel */}
          <div style={{ background: "#fff", borderRight: "1px solid #EDE9F8", display: "flex", flexDirection: "column", overflowY: "auto" }}>
            {/* Tabs */}
            <div style={{ padding: "16px 20px 0", borderBottom: "1px solid #EDE9F8" }}>
              <div style={{ display: "flex", gap: 4 }}>
                {["analyze", "fix"].map(t => {
                  const active = tab === t;
                  return (
                    <button key={t} onClick={() => setTab(t)} style={{
                      padding: "8px 20px", borderRadius: "8px 8px 0 0",
                      border: `1.5px solid ${active ? V1 : V1 + "25"}`,
                      borderBottom: "none",
                      background: active ? `linear-gradient(135deg, ${V1}, ${V2})` : "transparent",
                      color: active ? "#fff" : "#9B96B8", fontWeight: 700, fontSize: 14,
                    }}>
                      {t === "analyze" ? "Analyze" : "Fix"}
                    </button>
                  );
                })}
              </div>
              <div style={{ height: 1.5, background: `linear-gradient(90deg, ${V1}, ${V2})` }} />
            </div>

            <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>

              {tab === "analyze" && <>
                {/* My listing */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#2A2340", display: "block", marginBottom: 6 }}>MY PRODUCT NAME</label>
                  <input value={myName} onChange={e => setMyName(e.target.value)}
                    placeholder="e.g. Bamboo Wireless Charging Pad"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${V1}20`, background: "#F7F5FF", color: "#1A1330", fontSize: 13, marginBottom: 10, fontFamily: "inherit" }} />
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#2A2340", display: "block", marginBottom: 6 }}>MY LISTING</label>
                  <textarea value={myListing} onChange={e => setMyListing(e.target.value)}
                    placeholder={selectedProduct ? "Description loaded from Shopify — edit if needed" : "Select a product or paste your listing here"}
                    rows={6}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, background: "#F7F5FF", border: `1px solid ${V1}20`, color: "#1A1330", fontSize: 13, resize: "vertical", lineHeight: 1.6 }} />
                </div>

                {/* Competitor */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#CB11AB", display: "block", marginBottom: 6 }}>
                    COMPETITOR LISTING <span style={{ color: "#2A2340", fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input value={competitorName} onChange={e => setCompetitorName(e.target.value)}
                    placeholder="Competitor product name"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(203,17,171,0.2)", background: "#F7F5FF", color: "#1A1330", fontSize: 13, marginBottom: 8 }} />
                  <textarea value={competitorText} onChange={e => setCompetitorText(e.target.value)}
                    placeholder="Paste competitor's listing text here..."
                    rows={5}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, background: "#F7F5FF", border: "1px solid rgba(203,17,171,0.25)", color: "#1A1330", fontSize: 13, resize: "vertical", lineHeight: 1.6 }} />
                  <div style={{ fontSize: 11, color: "#2A2340", marginTop: 4 }}>
                    Add a competitor for score comparison and deeper analysis
                  </div>
                </div>

                {analyzeError && (
                  <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", fontSize: 13 }}>
                    {analyzeError}
                  </div>
                )}

                <button onClick={runAnalyze} disabled={analyzing || !myListing.trim()} style={{
                  padding: "13px", borderRadius: 12, border: "none",
                  background: (analyzing || !myListing.trim()) ? `${V1}25` : `linear-gradient(135deg, ${V1}, ${V2})`,
                  color: (analyzing || !myListing.trim()) ? "#9B96B8" : "#fff",
                  fontWeight: 700, fontSize: 15,
                  boxShadow: (analyzing || !myListing.trim()) ? "none" : `0 4px 20px ${V1}35`,
                  marginTop: "auto",
                }}>
                  {analyzing ? analyzeStatus || "Analyzing..." : "✦ Analyze listing"}
                </button>
              </>}

              {tab === "fix" && <>
                {!analyzeResult ? (
                  <div style={{ padding: 20, borderRadius: 12, background: `${V1}06`, border: `1px solid ${V1}15`, textAlign: "center", color: "#2A2340", fontSize: 13, lineHeight: 1.6 }}>
                    Run an analysis first, then come back here to fix your listing.
                  </div>
                ) : (
                  <div style={{ background: `${V1}06`, borderRadius: 12, padding: "14px 16px", border: `1px solid ${V1}15` }}>
                    <div style={{ fontSize: 12, color: "#2A2340", marginBottom: 4 }}>
                      Issues found: <strong style={{ color: "#1A1330" }}>{analyzeResult.issues?.length || 0}</strong>
                    </div>
                    <div style={{ fontSize: 12, color: "#2A2340" }}>
                      Your score: <strong style={{ color: myCol }}>{analyzeResult.score}/100</strong>
                    </div>
                  </div>
                )}

                {fixError && (
                  <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", fontSize: 13 }}>
                    {fixError}
                  </div>
                )}

                <button onClick={runFix} disabled={fixing || !analyzeResult} style={{
                  padding: "13px", borderRadius: 12, border: "none",
                  background: (fixing || !analyzeResult) ? `${V1}25` : `linear-gradient(135deg, ${V1}, ${V2})`,
                  color: (fixing || !analyzeResult) ? "#9B96B8" : "#fff",
                  fontWeight: 700, fontSize: 15,
                  boxShadow: (fixing || !analyzeResult) ? "none" : `0 4px 20px ${V1}35`,
                  marginTop: "auto",
                }}>
                  {fixing ? fixStatus || "Fixing..." : "✦ Fix my listing"}
                </button>

                {fixResult && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={copyFixed} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #EDE9F8", background: "#F7F5FF", color: "#1A1330", fontWeight: 600, fontSize: 13 }}>
                      {copied ? "✓ Copied" : "Copy text"}
                    </button>
                    <button onClick={saveToShopify} disabled={saving || saved} style={{
                      flex: 1, padding: "10px", borderRadius: 8, border: "none",
                      background: saved ? "#22C55E" : `linear-gradient(135deg, ${V1}, ${V2})`,
                      color: "#fff", fontWeight: 700, fontSize: 13,
                    }}>
                      {saved ? "✓ Saved!" : saving ? "Saving..." : "Save to Shopify"}
                    </button>
                  </div>
                )}
              </>}
            </div>
          </div>

          {/* Results panel */}
          <div style={{ background: "#F7F5FF", overflowY: "auto", padding: 24 }}>

            {/* ANALYZE RESULTS */}
            {tab === "analyze" && !analyzeResult && !analyzing && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 14, textAlign: "center" }}>
                <div style={{ width: 60, height: 60, borderRadius: 18, background: `${V1}10`, border: `1px solid ${V1}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: V1 }}>◉</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1A1330" }}>Analysis will appear here</h3>
                <p style={{ color: "#2A2340", fontSize: 13, maxWidth: 260, lineHeight: 1.6 }}>Select a product, add a competitor listing, and click Analyze</p>
              </div>
            )}

            {tab === "analyze" && analyzing && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", border: `4px solid ${V1}20`, borderTop: `4px solid ${V1}`, animation: "spin 1s linear infinite" }} />
                <p style={{ color: "#2A2340", fontSize: 13 }}>{analyzeStatus}</p>
              </div>
            )}

            {tab === "analyze" && analyzeResult && (() => {
              const a = analyzeResult;
              const gap = (a.competitorScore || 0) - (a.score || 0);
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Scores */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ background: "#fff", borderRadius: 14, padding: "18px 16px", border: `2px solid ${myCol}25`, textAlign: "center" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#2A2340", letterSpacing: "0.08em", marginBottom: 8 }}>MY LISTING</div>
                      <div style={{ fontSize: 46, fontWeight: 900, color: myCol, lineHeight: 1, fontFamily: "system-ui" }}>{a.score ?? 0}</div>
                      <div style={{ fontSize: 11, color: myCol, fontWeight: 600, marginTop: 5 }}>{a.scoreLabel}</div>
                    </div>
                    <div style={{ background: "#fff", borderRadius: 14, padding: "18px 16px", border: `2px solid ${compCol}25`, textAlign: "center" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#2A2340", letterSpacing: "0.08em", marginBottom: 8 }}>COMPETITOR</div>
                      <div style={{ fontSize: 46, fontWeight: 900, color: compCol, lineHeight: 1, fontFamily: "system-ui" }}>{a.competitorScore ?? "—"}</div>
                    </div>
                  </div>

                  <p style={{ fontSize: 11, color: "#2A2340", textAlign: "center" }}>
                    Score reflects keyword density & marketplace fit — not writing quality
                  </p>

                  {/* Summary */}
                  {a.summary && (
                    <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: `1px solid ${gap > 15 ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)"}` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: gap > 0 ? "#EF4444" : "#22C55E", letterSpacing: "0.06em", marginBottom: 8 }}>
                        {gap > 0 ? `GAP: −${gap}` : "YOU'RE AHEAD"}
                      </div>
                      <p style={{ fontSize: 13, color: "#2A2340", lineHeight: 1.65 }}>{a.summary}</p>
                    </div>
                  )}

                  {/* Winning scenario */}
                  {a.score > (a.competitorScore || 0) && (
                    <div style={{ background: "rgba(34,197,94,0.05)", borderRadius: 14, padding: 16, border: "1px solid rgba(34,197,94,0.2)" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#22C55E", marginBottom: 6 }}>🏆 Your listing is stronger</div>
                      <p style={{ fontSize: 12, color: "#2A2340", lineHeight: 1.6 }}>If your competitor outsells you with a weaker listing, the gap is likely in photos, review count, or price — not the text. Focus there next.</p>
                    </div>
                  )}

                  {/* Issues */}
                  {a.issues && a.issues.length > 0 && (
                    <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1px solid rgba(239,68,68,0.15)" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#EF4444", letterSpacing: "0.06em", marginBottom: 12 }}>
                        {a.issues.length} ISSUES FOUND
                      </div>
                      {a.issues.map((issue, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                          <span style={{ width: 18, height: 18, borderRadius: 5, background: issue.severity === "high" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: issue.severity === "high" ? "#EF4444" : "#F59E0B", fontWeight: 700, flexShrink: 0, marginTop: 2 }}>!</span>
                          <span style={{ fontSize: 13, color: "#2A2340", lineHeight: 1.55 }}>{issue.problem}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Competitor strengths */}
                  {a.competitorStrengths && a.competitorStrengths.length > 0 && (
                    <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1px solid #EDE9F8" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#2A2340", letterSpacing: "0.06em", marginBottom: 12 }}>WHAT COMPETITORS DO BETTER</div>
                      {a.competitorStrengths.map((s, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                          <span style={{ color: "#FF4D6D", fontWeight: 700, flexShrink: 0 }}>→</span>
                          <span style={{ fontSize: 13, color: "#2A2340", lineHeight: 1.55 }}>{typeof s === "string" ? s : s.point}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA to Fix */}
                  <div style={{ background: `linear-gradient(135deg, ${V1}10, ${V2}06)`, borderRadius: 14, padding: 18, border: `1px solid ${V1}20`, textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1330", marginBottom: 6 }}>Ready to fix this?</div>
                    <div style={{ fontSize: 12, color: "#2A2340", marginBottom: 14 }}>We'll rewrite your listing based on this analysis.</div>
                    <button onClick={() => { setTab("fix"); runFix(); }} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${V1}, ${V2})`, color: "#fff", fontWeight: 700, fontSize: 14, boxShadow: `0 2px 12px ${V1}35` }}>
                      ✦ Fix my listing →
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* FIX RESULTS */}
            {tab === "fix" && !fixResult && !fixing && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 14, textAlign: "center" }}>
                <div style={{ width: 60, height: 60, borderRadius: 18, background: `${V1}10`, border: `1px solid ${V1}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: V1 }}>✦</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1A1330" }}>Fixed listing will appear here</h3>
                <p style={{ color: "#2A2340", fontSize: 13, maxWidth: 260, lineHeight: 1.6 }}>Run an analysis first, then click Fix my listing</p>
              </div>
            )}

            {tab === "fix" && fixing && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", border: `4px solid ${V1}20`, borderTop: `4px solid ${V1}`, animation: "spin 1s linear infinite" }} />
                <p style={{ color: "#2A2340", fontSize: 13 }}>{fixStatus}</p>
              </div>
            )}

            {tab === "fix" && fixResult && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Summary */}
                {fixResult.summary && (
                  <div style={{ background: "rgba(34,197,94,0.04)", borderRadius: 14, padding: 16, border: "1px solid rgba(34,197,94,0.2)" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#22C55E", letterSpacing: "0.06em", marginBottom: 8 }}>WHAT WE FIXED</div>
                    <p style={{ fontSize: 13, color: "#2A2340", lineHeight: 1.65 }}>{fixResult.summary}</p>
                  </div>
                )}

                {/* Before */}
                <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <div style={{ padding: "10px 16px", background: "rgba(239,68,68,0.05)", borderBottom: "1px solid rgba(239,68,68,0.12)" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#EF4444", letterSpacing: "0.08em" }}>BEFORE — YOUR LISTING</span>
                  </div>
                  <div style={{ padding: 16, fontSize: 13, color: "#1A1330", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{myListing}</div>
                </div>

                <div style={{ textAlign: "center", fontSize: 20, color: V1 }}>↓</div>

                {/* After */}
                <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <div style={{ padding: "10px 16px", background: "rgba(34,197,94,0.05)", borderBottom: "1px solid rgba(34,197,94,0.12)" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#22C55E", letterSpacing: "0.08em" }}>AFTER — FIXED LISTING</span>
                  </div>
                  <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                    {fixResult.fixedTitle && (
                      <div style={{ paddingBottom: 12, borderBottom: "1px solid #EDE9F8" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#2A2340", letterSpacing: "0.06em", marginBottom: 5 }}>TITLE</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1330", lineHeight: 1.4 }}>{fixResult.fixedTitle}</div>
                      </div>
                    )}
                    {fixResult.fixedSections?.map((section, si) => (
                      <div key={si} style={{ paddingBottom: 12, borderBottom: si < fixResult.fixedSections.length - 1 ? "1px solid #EDE9F8" : "none" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#2A2340", letterSpacing: "0.06em", marginBottom: 8 }}>{section.label.toUpperCase()}</div>
                        {section.type === "bullets" && section.items?.map((item, ii) => (
                          <div key={ii} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                            <span style={{ color: "#22C55E", fontWeight: 700, flexShrink: 0 }}>•</span>
                            <span style={{ fontSize: 13, color: "#2A2340", lineHeight: 1.6 }}>{item}</span>
                          </div>
                        ))}
                        {section.type === "description" && (
                          <p style={{ fontSize: 13, color: "#2A2340", lineHeight: 1.7 }}>{section.content}</p>
                        )}
                        {section.type === "specs" && (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
                            {section.items?.map((item, ii) => {
                              const [key, ...val] = item.split(":");
                              return (
                                <div key={ii} style={{ fontSize: 12, color: "#2A2340", padding: "3px 0", borderBottom: "1px solid #F0EDF8" }}>
                                  <span style={{ fontWeight: 600, color: "#1A1330" }}>{key}:</span>
                                  <span style={{ marginLeft: 4 }}>{val.join(":")}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {!["bullets","description","specs"].includes(section.type) && (
                          <p style={{ fontSize: 13, color: "#2A2340", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{section.content}</p>
                        )}
                      </div>
                    ))}
                    {!fixResult.fixedSections?.length && (
                      <div style={{ fontSize: 13, color: "#2A2340", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{fixResult.fixedBody}</div>
                    )}
                  </div>
                </div>

                {/* Why we changed */}
                {fixResult.fixes?.length > 0 && (
                  <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1px solid #EDE9F8" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#2A2340", letterSpacing: "0.06em", marginBottom: 12 }}>WHY WE CHANGED THIS</div>
                    {fixResult.fixes.map((fix, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <span style={{ color: "#22C55E", fontWeight: 700, flexShrink: 0 }}>✓</span>
                        <span style={{ fontSize: 13, color: "#2A2340", lineHeight: 1.55 }}>{fix.reason}</span>
                      </div>
                    ))}
                  </div>
                )}

                {saved && (
                  <div style={{ background: "rgba(34,197,94,0.08)", borderRadius: 12, padding: "12px 16px", border: "1px solid rgba(34,197,94,0.25)", fontSize: 13, fontWeight: 600, color: "#22C55E", textAlign: "center" }}>
                    ✓ Listing updated in Shopify successfully!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
