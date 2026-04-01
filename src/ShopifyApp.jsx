import { useState, useEffect } from "react";

const V1 = "#8B5CF6";
const V2 = "#7C3AED";
const V3 = "#A78BFA";

const PLATFORMS_SHOPIFY = [
  { id: "shopify",     name: "Shopify",     color: "#96BF48" },
  { id: "amazon",      name: "Amazon",      color: "#FF9900" },
  { id: "etsy",        name: "Etsy",        color: "#F1641E" },
  { id: "ebay",        name: "eBay",        color: "#E53238" },
  { id: "wildberries", name: "Wildberries", color: "#CB11AB" },
  { id: "kaspi",       name: "Kaspi",       color: "#E31E24" },
];

const TONES = [
  { id: "professional", label: "Professional" },
  { id: "friendly",     label: "Friendly" },
  { id: "luxury",       label: "Luxury" },
  { id: "casual",       label: "Casual" },
];

function getShopFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("shop") || "";
}

export default function ShopifyApp() {
  const shop = getShopFromUrl();

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [features, setFeatures] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState(["shopify"]);
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [results, setResults] = useState(null);
  const [activePlatform, setActivePlatform] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load products from Shopify store
  useEffect(() => {
    if (!shop) return;
    fetch(`/api/shopify/products?shop=${shop}`)
      .then(r => r.json())
      .then(data => {
        setProducts(data.products || []);
        setLoadingProducts(false);
      })
      .catch(() => setLoadingProducts(false));
  }, [shop]);

  const togglePlatform = (id) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const generate = async () => {
    if (!selectedProduct) { setError("Select a product first"); return; }
    if (selectedPlatforms.length === 0) { setError("Select at least one platform"); return; }

    setLoading(true);
    setError("");
    setResults(null);
    setSaved(false);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: selectedProduct.title,
          features,
          platforms: selectedPlatforms,
          tone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResults(data.results);
      setActivePlatform(selectedPlatforms[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveToShopify = async () => {
    if (!results?.shopify || !selectedProduct) return;
    setSaving(true);
    try {
      const res = await fetch("/api/shopify/save-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop,
          productId: selectedProduct.id,
          description: results.shopify,
        }),
      });
      if (res.ok) setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const activeResult = results && activePlatform ? results[activePlatform] : null;
  const activePlat = PLATFORMS_SHOPIFY.find(p => p.id === activePlatform);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#F7F5FF", minHeight: "100vh", padding: "24px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        button { cursor:pointer; font-family:'DM Sans',sans-serif; }
        select, textarea { font-family:'DM Sans',sans-serif; outline:none; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1A1330", marginBottom: 4 }}>
          Sell<span style={{ color: V1 }}>Scribe</span>
        </h1>
        <p style={{ fontSize: 14, color: "#9B96B8" }}>Generate AI listings for all your marketplaces</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 1000 }}>

        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Product selector */}
          <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #EDE9F8" }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#9B96B8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
              Select Product
            </label>
            {loadingProducts ? (
              <div style={{ color: "#9B96B8", fontSize: 14 }}>Loading products...</div>
            ) : (
              <select
                value={selectedProduct?.id || ""}
                onChange={e => {
                  const p = products.find(p => String(p.id) === e.target.value);
                  setSelectedProduct(p || null);
                  setResults(null);
                  setSaved(false);
                }}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #EDE9F8", background: "#F7F5FF", fontSize: 14, color: "#1A1330" }}
              >
                <option value="">— Choose a product —</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            )}
          </div>

          {/* Extra features */}
          <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #EDE9F8" }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#9B96B8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
              Key Features <span style={{ color: "#C4C0DA", fontWeight: 400, textTransform: "none" }}>(optional)</span>
            </label>
            <textarea
              value={features}
              onChange={e => setFeatures(e.target.value)}
              placeholder={"Material: bamboo\nCharging: 15W Qi\nColor: natural"}
              rows={3}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #EDE9F8", background: "#F7F5FF", fontSize: 13, resize: "vertical", lineHeight: 1.6, color: "#1A1330" }}
            />
          </div>

          {/* Platforms */}
          <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #EDE9F8" }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#9B96B8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
              Platforms
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {PLATFORMS_SHOPIFY.map(p => {
                const sel = selectedPlatforms.includes(p.id);
                return (
                  <div key={p.id} onClick={() => togglePlatform(p.id)} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
                    borderRadius: 8, cursor: "pointer",
                    background: sel ? `${p.color}0E` : "#F7F5FF",
                    border: `1px solid ${sel ? p.color + "28" : "#EDE9F8"}`,
                    transition: "all 0.15s",
                  }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: 4,
                      border: `2px solid ${sel ? p.color : "#C4C0DA"}`,
                      background: sel ? p.color : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      {sel && <span style={{ color: "#fff", fontSize: 9, fontWeight: 800 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: sel ? p.color : "#6B647A" }}>{p.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tone */}
          <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #EDE9F8" }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#9B96B8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
              Tone
            </label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {TONES.map(t => (
                <button key={t.id} onClick={() => setTone(t.id)} style={{
                  padding: "6px 14px", borderRadius: 100, border: "none",
                  background: tone === t.id ? `linear-gradient(135deg, ${V1}, ${V2})` : "#F7F5FF",
                  color: tone === t.id ? "#fff" : "#6B647A",
                  fontSize: 13, fontWeight: 600,
                  border: tone === t.id ? "none" : "1px solid #EDE9F8",
                }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", fontSize: 13 }}>
              {error}
            </div>
          )}

          <button onClick={generate} disabled={loading} style={{
            width: "100%", padding: "13px", borderRadius: 12, border: "none",
            background: loading ? `${V1}40` : `linear-gradient(135deg, ${V1}, ${V2})`,
            color: "#fff", fontWeight: 700, fontSize: 15,
            boxShadow: loading ? "none" : `0 4px 20px ${V1}30`,
          }}>
            {loading ? "✦ Generating..." : "✦ Generate listings"}
          </button>
        </div>

        {/* RIGHT */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #EDE9F8", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {!results && !loading && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center", gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: `${V1}10`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: V1 }}>✦</div>
              <p style={{ fontWeight: 700, color: "#1A1330", fontSize: 16 }}>Listings will appear here</p>
              <p style={{ color: "#9B96B8", fontSize: 13, maxWidth: 220, lineHeight: 1.6 }}>Select a product and click Generate</p>
            </div>
          )}

          {loading && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, gap: 14 }}>
              {[85, 70, 55, 40, 60].map((w, i) => (
                <div key={i} style={{ height: 9, width: `${w}%`, borderRadius: 4, background: `${V1}15`, animation: `pulse 1.4s ${i * 0.1}s ease-in-out infinite` }} />
              ))}
              <p style={{ color: "#9B96B8", fontSize: 13 }}>Writing your listings...</p>
            </div>
          )}

          {results && (
            <>
              {/* Tabs */}
              <div style={{ display: "flex", borderBottom: "1px solid #EDE9F8", overflowX: "auto" }}>
                {selectedPlatforms.map(id => {
                  const p = PLATFORMS_SHOPIFY.find(pl => pl.id === id);
                  const active = activePlatform === id;
                  return (
                    <button key={id} onClick={() => setActivePlatform(id)} style={{
                      padding: "12px 18px", border: "none",
                      borderBottom: active ? `2px solid ${p.color}` : "2px solid transparent",
                      background: active ? `${p.color}08` : "transparent",
                      color: active ? p.color : "#9B96B8", fontWeight: 600, fontSize: 13,
                      whiteSpace: "nowrap", flexShrink: 0,
                    }}>
                      {p.name}
                    </button>
                  );
                })}
              </div>

              {/* Content */}
              {activeResult && activePlat && (
                <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: 13, color: "#2A2340", lineHeight: 1.8, whiteSpace: "pre-wrap", flex: 1 }}>
                    {activeResult}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: "1px solid #EDE9F8" }}>
                    <button
                      onClick={() => navigator.clipboard.writeText(activeResult)}
                      style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #EDE9F8", background: "#F7F5FF", color: "#6B647A", fontWeight: 600, fontSize: 13 }}
                    >
                      Copy
                    </button>
                    {activePlatform === "shopify" && (
                      <button
                        onClick={saveToShopify}
                        disabled={saving || saved}
                        style={{
                          flex: 1, padding: "10px", borderRadius: 8, border: "none",
                          background: saved ? "#22C55E" : `linear-gradient(135deg, ${V1}, ${V2})`,
                          color: "#fff", fontWeight: 700, fontSize: 13,
                        }}
                      >
                        {saved ? "✓ Saved to Shopify" : saving ? "Saving..." : "Save to Shopify"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
