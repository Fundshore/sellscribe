import { useState, useRef, useEffect } from "react";
import { useLang } from "./useLang";
import { useNavigate } from "react-router-dom";

const V1 = "#8B5CF6";
const V2 = "#7C3AED";
const V3 = "#A78BFA";
const DK = "#0A0814";
const CARD = "#110E1D";
const LT = "#F7F5FF";

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function AnimDiv({ children, delay = 0, direction = "up", style = {}, ...props }) {
  const [ref, visible] = useInView();
  const dirs = { up: "translateY(48px)", left: "translateX(40px)", right: "translateX(-40px)" };
  return (
    <div ref={ref} style={{ ...style, opacity: visible ? 1 : 0, transform: visible ? "translate(0)" : dirs[direction], transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s` }} {...props}>
      {children}
    </div>
  );
}

function Logo({ light = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <svg viewBox="0 0 80 80" width="28" height="28">
        <defs><linearGradient id="lG2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={V3}/><stop offset="50%" stopColor={V1}/><stop offset="100%" stopColor={V2}/></linearGradient></defs>
        <rect width="80" height="80" rx="18" fill={light ? "#E8E4F8" : CARD}/>
        <path d="M24 16 C20 16,18 20,18 24 L18 56 C18 60,20 64,24 64 L48 64 C52 64,54 60,54 56 L54 28" stroke="url(#lG2)" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M54 28 C54 22,51 18,46 18 L24 18" stroke="url(#lG2)" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <line x1="26" y1="30" x2="46" y2="30" stroke={V1} strokeWidth="2" opacity="0.6" strokeLinecap="round"/>
        <line x1="26" y1="38" x2="42" y2="38" stroke={V1} strokeWidth="2" opacity="0.45" strokeLinecap="round"/>
        <path d="M60 18 L62 14 L64 18 L68 20 L64 22 L62 26 L60 22 L56 20 Z" fill={V3} opacity="0.85"/>
      </svg>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 19, letterSpacing: "-0.02em" }}>
        <span style={{ color: light ? "#1A1330" : "#F5F3FF" }}>Sell</span><span style={{ color: V1 }}>Scribe</span>
      </span>
    </div>
  );
}

const MARKETPLACES = [
  { name: "Wildberries", color: "#CB11AB", abbr: "WB" },
  { name: "Kaspi",       color: "#E31E24", abbr: "K" },
  { name: "Amazon",      color: "#FF9900", abbr: "A" },
  { name: "Etsy",        color: "#F1641E", abbr: "E" },
  { name: "eBay",        color: "#E53238", abbr: "eB" },
  { name: "Shopify",     color: "#96BF48", abbr: "S" },
];

const S = {
  en: {
    nav: { features: "How it works", pricing: "Pricing", contact: "Contact", try: "Try free" },
    hero: {
      h1a: "You're not losing to a better product.",
      h1b: "You're losing to a better listing.",
      sub: "Find exactly why you're losing sales — and fix it in seconds.",
      cta: "Analyze & fix my listings — free →",
      demo: "Try it right now",
      demoPlaceholder: "Paste any product listing here — title, description, bullet points. Any marketplace.",
      demoCompPlaceholder: "Paste a competitor's listing here. Any marketplace, any format.",
      demoBtn: "✦ Analyze now",
      demoLoading: "Analyzing...",
      demoNote: "No sign-up needed for the demo",
      demoAddComp: "+ Add competitor listing",
    },
    how: {
      tag: "HOW IT WORKS",
      title: "Two steps. Real results.",
      steps: [
        { n: "01", icon: "◉", color: V1, title: "Analyze", sub: "You vs top sellers — data, not opinions", desc: "Paste your listing and a competitor's. SellScribe scores both based on analysis of top-ranked listings across marketplaces, shows exactly which parts are weak, what keywords competitors use that you don't, and what top sellers do that you've never noticed." },
        { n: "02", icon: "✦", color: "#22C55E", title: "Fix", sub: "Fixed. Improved. Ready to sell.", desc: "One click. We fix exactly what's costing you sales — based on competitor patterns and top-ranked listings in your category. Every change is explained. You see Before and After side by side. Users improve their listing score by +30 points on average." },
      ],
    },
    markets: {
      tag: "WORKS WITH ANY MARKETPLACE",
      title: "Just paste your listing. We handle the rest.",
      sub: "SellScribe works with any marketplace — Wildberries, Kaspi, Amazon, Etsy, eBay, Shopify, and any other platform. Just paste your listing text. Our AI detects the format and adapts automatically.",
      any: "And any other marketplace — just paste your text.",
    },
    proof: {
      tag: "THE REAL PROBLEM",
      title: "Your competitor sells more. Same product. Different listing.",
      points: [
        { icon: "🔍", title: "You can't see what they do better", desc: "Without analyzing top sellers side by side, you're guessing what to improve. SellScribe makes the gap visible." },
        { icon: "📝", title: "Rewriting takes hours", desc: "Researching keywords, adjusting tone, reformatting for each platform. SellScribe does it in seconds." },
        { icon: "💸", title: "Every day costs you sales", desc: "A weak listing means lower ranking, lower clicks, lower conversion. It's not a one-time loss — it compounds." },
      ],
    },
    pricing: {
      tag: "PRICING",
      title: "Start free. No credit card.",
      sub: "Upgrade when you see results.",
      plans: [
        {
          name: "Free", price: "Free", period: "", desc: "See what's possible", hl: false, cta: "Start free",
          features: ["5 analyses / month", "2 listing fixes / month", "All marketplaces", "Before & After comparison", "History saved"],
        },
        {
          name: "Starter", price: "$19", period: "/mo", desc: "For active sellers", hl: true, cta: "Start now",
          features: ["50 analyses / month", "20 listing fixes / month", "All marketplaces", "Before & After comparison", "Full history"],
        },
        {
          name: "Pro", price: "$49", period: "/mo", desc: "Power sellers", hl: false, cta: "Go Pro",
          features: ["200 analyses / month", "75 listing fixes / month", "All marketplaces", "Priority processing", "Full history"],
        },
        {
          name: "Agency", price: "$149", period: "/mo", desc: "Teams & agencies", hl: false, cta: "Get Agency",
          features: ["500 analyses / month", "200 listing fixes / month", "All marketplaces", "Priority processing", "Full history"],
        },
      ],
    },
    faq: {
      tag: "FAQ",
      title: "Quick answers",
      items: [
        { q: "Which marketplaces does SellScribe support?", a: "All of them. Wildberries, Kaspi, Amazon, Etsy, eBay, Shopify — and any other platform. Just paste your listing text. Our AI detects the format automatically. Need a specific marketplace added? Contact us." },
        { q: "Do I need to know SEO or copywriting?", a: "No. SellScribe does the analysis and the rewriting. You just paste your listing and your competitor's." },
        { q: "How is this different from ChatGPT?", a: "ChatGPT generates text from scratch. SellScribe analyzes your specific listing against real competitor listings and rewrites it based on that data. It's diagnosis + treatment, not just text generation." },
        { q: "How accurate is the Before/After comparison?", a: "The analysis is based on keyword density, structure, and competitive comparison — not subjective opinion. The fixes are specific and explained: you see exactly what changed and why." },
        { q: "Is the Russian for Wildberries and Kaspi good?", a: "Yes — written natively, not translated. Prompts are specifically tuned for CIS marketplace conventions. Not Google Translate." },
      ],
    },
    cta: {
      title: "Your competitor is getting paid while you read this.",
      sub: "Find out what's costing you sales. Fix it in minutes.",
      btn: "Analyze & fix my listings — free →",
    },
    footer: "© 2026 SellScribe. You're not losing to a better product.",
    popular: "POPULAR",
    demoResult: {
      score: "Your score",
      compScore: "Competitor score",
      gap: "GAP",
      issues: "issues found",
      signupPrompt: "See the full analysis + fix your listing",
      signupBtn: "Sign up free →",
    },
  },
  ru: {
    nav: { features: "Как работает", pricing: "Тарифы", contact: "Связаться", try: "Попробовать" },
    hero: {
      h1a: "Вы проигрываете не лучшему товару.",
      h1b: "Вы проигрываете лучшему листингу.",
      sub: "Узнайте точно почему вы теряете продажи — и исправьте это за секунды.",
      cta: "Анализировать и исправить листинги — бесплатно →",
      demo: "Попробуйте прямо сейчас",
      demoPlaceholder: "Вставьте любой листинг товара — заголовок, описание, буллеты. Любой маркетплейс.",
      demoCompPlaceholder: "Вставьте листинг конкурента. Любой маркетплейс, любой формат.",
      demoBtn: "✦ Анализировать",
      demoLoading: "Анализируем...",
      demoNote: "Регистрация для демо не нужна",
      demoAddComp: "+ Добавить листинг конкурента",
    },
    how: {
      tag: "КАК ЭТО РАБОТАЕТ",
      title: "Два шага. Реальный результат.",
      steps: [
        { n: "01", icon: "◉", color: V1, title: "Анализ", sub: "Вы vs конкуренты", desc: "Вставьте свой листинг и листинг конкурента. SellScribe показывает ваш счёт, слабые места, пропущенные ключевые слова и что конкуренты делают лучше. Без угадываний." },
        { n: "02", icon: "✦", color: "#22C55E", title: "Исправление", sub: "Исправлено. Улучшено. Готово продавать.", desc: "Один клик. Мы исправляем именно то, что съедает ваши продажи — на основе анализа топ листингов по всем маркетплейсам и реальных конкурентов. Каждое изменение объяснено. До и После — рядом." },
      ],
    },
    markets: {
      tag: "РАБОТАЕТ С ЛЮБЫМ МАРКЕТПЛЕЙСОМ",
      title: "Просто вставьте листинг. Остальное мы сделаем.",
      sub: "SellScribe работает с любым маркетплейсом — Wildberries, Kaspi, Amazon, Etsy, eBay, Shopify и любой другой платформой. Просто вставьте текст листинга — остальное сделаем мы.",
      any: "И с любым другим маркетплейсом — просто вставьте текст.",
    },
    proof: {
      tag: "РЕАЛЬНАЯ ПРОБЛЕМА",
      title: "Конкурент продаёт больше. Товар тот же. Листинг другой.",
      points: [
        { icon: "🔍", title: "Вы не видите что они делают лучше", desc: "Без сравнения с топовыми продавцами вы гадаете что улучшить. SellScribe делает разрыв видимым." },
        { icon: "📝", title: "Переписывать — это часы", desc: "Исследование ключевых слов, тон, форматирование. SellScribe делает это за секунды." },
        { icon: "💸", title: "Каждый день стоит вам продаж", desc: "Слабый листинг = низкий рейтинг, меньше кликов, меньше конверсия. Это не разовая потеря — она накапливается." },
      ],
    },
    pricing: {
      tag: "ТАРИФЫ",
      title: "Начните бесплатно. Без карты.",
      sub: "Улучшайте план когда увидите результаты.",
      plans: [
        {
          name: "Бесплатно", price: "Бесплатно", period: "", desc: "Посмотрите как работает", hl: false, cta: "Начать",
          features: ["5 анализов / месяц", "2 исправления / месяц", "Все маркетплейсы", "Сравнение До и После", "История сохраняется"],
        },
        {
          name: "Старт", price: "$19", period: "/мес", desc: "Для активных продавцов", hl: true, cta: "Начать сейчас",
          features: ["50 анализов / месяц", "20 исправлений / месяц", "Все маркетплейсы", "Сравнение До и После", "Полная история"],
        },
        {
          name: "Про", price: "$49", period: "/мес", desc: "Опытным продавцам", hl: false, cta: "Перейти на Про",
          features: ["200 анализов / месяц", "75 исправлений / месяц", "Все маркетплейсы", "Приоритетная обработка", "Полная история"],
        },
        {
          name: "Агентство", price: "$149", period: "/мес", desc: "Командам", hl: false, cta: "Агентство",
          features: ["500 анализов / месяц", "200 исправлений / месяц", "Все маркетплейсы", "Приоритетная обработка", "Полная история"],
        },
      ],
    },
    faq: {
      tag: "ВОПРОСЫ",
      title: "Быстрые ответы",
      items: [
        { q: "Какие маркетплейсы поддерживаются?", a: "Все. Wildberries, Kaspi, Amazon, Etsy, eBay, Shopify — и любой другой. Просто вставьте текст листинга. ИИ определяет формат автоматически. Нужен конкретный маркетплейс? Напишите нам." },
        { q: "Нужно ли знать SEO или копирайтинг?", a: "Нет. SellScribe делает анализ и переписывает. Вы просто вставляете свой листинг и листинг конкурента." },
        { q: "Чем это отличается от ChatGPT?", a: "ChatGPT генерирует текст с нуля. SellScribe анализирует ваш конкретный листинг в сравнении с реальными конкурентами и переписывает на основе этих данных. Это диагноз + лечение, а не просто генерация текста." },
        { q: "Насколько точен анализ?", a: "Анализ основан на плотности ключевых слов, структуре и конкурентном сравнении — не на субъективном мнении. Каждое изменение объясняется: вы видите что изменилось и почему." },
        { q: "Русский для Wildberries и Kaspi действительно хороший?", a: "Да — нативный, не переводной. Промпты специально настроены под стандарты СНГ-маркетплейсов. Не Google Переводчик." },
      ],
    },
    cta: {
      title: "Конкурент получает деньги пока вы читаете это.",
      sub: "Узнайте что съедает ваши продажи. Исправьте за минуты.",
      btn: "Анализировать и исправить — бесплатно →",
    },
    footer: "© 2026 SellScribe. Вы проигрываете не лучшему товару.",
    popular: "ПОПУЛЯРНЫЙ",
    demoResult: {
      score: "Ваш счёт",
      compScore: "Счёт конкурента",
      gap: "РАЗРЫВ",
      issues: "проблем найдено",
      signupPrompt: "Полный анализ + исправление листинга",
      signupBtn: "Зарегистрироваться бесплатно →",
    },
  },
};

function FaqSection({ t }) {
  const [open, setOpen] = useState(null);
  return (
    <section style={{ padding: "80px 24px", background: LT }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <AnimDiv style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ color: V2, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 14 }}>{t.faq.tag}</div>
          <h2 style={{ fontSize: "clamp(26px,3.5vw,38px)", fontWeight: 800, color: "#1A1330", letterSpacing: "-0.03em", fontFamily: "var(--font-display)" }}>{t.faq.title}</h2>
        </AnimDiv>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {t.faq.items.map((faq, i) => (
            <AnimDiv key={i} delay={i * 0.04}>
              <div onClick={() => setOpen(open === i ? null : i)} style={{ background: "#fff", borderRadius: 14, border: `1px solid ${open === i ? V1 + "30" : "rgba(139,92,246,0.08)"}`, overflow: "hidden", cursor: "pointer", transition: "border 0.2s" }}>
                <div style={{ padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#1A1330", lineHeight: 1.4 }}>{faq.q}</span>
                  <span style={{ color: V1, fontSize: 22, fontWeight: 700, flexShrink: 0, transition: "transform 0.2s", transform: open === i ? "rotate(45deg)" : "none" }}>+</span>
                </div>
                {open === i && <div style={{ padding: "0 22px 18px", fontSize: 15, color: "#2A2340", lineHeight: 1.7, fontWeight: 500 }}>{faq.a}</div>}
              </div>
            </AnimDiv>
          ))}
        </div>
      </div>
    </section>
  );
}

function InlineDemo({ t, navigate, lang }) {
  const [myText, setMyText] = useState("");
  const [compText, setCompText] = useState("");
  const [showComp, setShowComp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const runDemo = async () => {
    if (!myText.trim()) { setError(lang === "ru" ? "Вставьте ваш листинг" : "Paste your listing first"); return; }
    setLoading(true); setError(""); setResult(null); setStatus("");
    const steps = lang === "ru"
      ? ["Читаю листинг...", "Анализирую структуру...", "Проверяю ключевые слова...", "Формирую оценку..."]
      : ["Reading your listing...", "Analyzing structure...", "Checking keywords...", "Building your score..."];
    let si = 0;
    setStatus(steps[0]);
    const timer = setInterval(() => { si = Math.min(si+1, steps.length-1); setStatus(steps[si]); }, 1600);
    try {
      const body = { myListing: myText, lang };
      if (compText.trim()) body.competitors = [compText];
      else body.competitors = [];
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
    } catch (err) {
      setError(lang === "ru" ? "Ошибка анализа. Попробуйте зарегистрироваться." : "Demo analysis failed. Try signing up for the full version.");
    } finally {
      clearInterval(timer);
      setStatus("");
      setLoading(false);
    }
  };

  const myCol = result ? (result.score >= 60 ? "#22C55E" : result.score >= 40 ? "#FFB703" : "#FF4D6D") : V1;
  const compCol = result ? ((result.competitorScore || 0) >= 60 ? "#22C55E" : (result.competitorScore || 0) >= 40 ? "#FFB703" : "#FF4D6D") : "#9B96B8";

  return (
    <div style={{ background: CARD, borderRadius: 24, padding: 32, border: `1px solid ${V1}18`, maxWidth: 700, margin: "0 auto", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${V2}, ${V1}, ${V3})` }} />
      
      {!result ? (
        <>
    
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Demo intro */}
            <div style={{ marginBottom: 4 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "#F5F3FF", marginBottom: 8 }}>{t.hero.demo}</h3>
              <p style={{ fontSize: 13, color: "#9B96B8", lineHeight: 1.65 }}>
                {lang === "ru"
                  ? "Вставьте свой листинг и сразу получите разбор с рейтингом. Опционально добавьте листинг конкурента — сравним оба и дадим рекомендации."
                  : "Paste your listing and instantly get a full breakdown with a score. Optionally add a competitor's listing to compare both and get recommendations."}
              </p>
            </div>
            {/* My listing - required */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#9B96B8", letterSpacing: "0.06em", marginBottom: 6 }}>
                {lang === "ru" ? "МОЙ ЛИСТИНГ" : "MY LISTING"}
              </div>
              <textarea value={myText} onChange={e => setMyText(e.target.value)} placeholder={t.hero.demoPlaceholder} rows={4}
                style={{ width: "100%", padding: "14px", borderRadius: 12, background: "#1C1830", border: `1px solid ${V1}25`, color: "#E8E5F5", fontSize: 13, resize: "vertical", lineHeight: 1.6, fontFamily: "var(--font-body)" }} />
            </div>

            {/* Competitor - optional */}
            {!showComp ? (
              <button onClick={() => setShowComp(true)} style={{ padding: "10px", borderRadius: 10, border: `1.5px dashed ${V1}`, background: `${V1}08`, color: V3, fontSize: 13, fontWeight: 600, fontFamily: "var(--font-body)", cursor: "pointer" }}>
                {t.hero.demoAddComp}
              </button>
            ) : (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#CB11AB", letterSpacing: "0.06em", marginBottom: 6 }}>
                  {lang === "ru" ? "ЛИСТИНГ КОНКУРЕНТА (необязательно)" : "COMPETITOR LISTING (optional)"}
                </div>
                <textarea value={compText} onChange={e => setCompText(e.target.value)} placeholder={t.hero.demoCompPlaceholder} rows={4}
                  style={{ width: "100%", padding: "14px", borderRadius: 12, background: "#1C1830", border: "1px solid rgba(203,17,171,0.3)", color: "#E8E5F5", fontSize: 13, resize: "vertical", lineHeight: 1.6, fontFamily: "var(--font-body)" }} />
                <div style={{ fontSize: 11, color: "#5A5478", marginTop: 5 }}>
                  {lang === "ru" ? "Добавьте для сравнения счётов и полного анализа" : "Add for score comparison and deeper analysis"}
                </div>
              </div>
            )}

            {error && <div style={{ fontSize: 13, color: "#FCA5A5" }}>{error}</div>}
            
            {loading && status && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: `${V1}10`, border: `1px solid ${V1}20` }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${V1}30`, borderTop: `2px solid ${V1}`, animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: V3, fontWeight: 500 }}>{status}</span>
              </div>
            )}

            <button onClick={runDemo} disabled={loading || !myText.trim()} style={{
              padding: "14px", borderRadius: 12, border: "none",
              background: (loading || !myText.trim()) ? `${V1}35` : `linear-gradient(135deg, ${V1}, ${V2})`,
              color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "var(--font-body)",
              boxShadow: (loading || !myText.trim()) ? "none" : `0 4px 20px ${V1}35`,
            }}>
              {loading ? t.hero.demoLoading : t.hero.demoBtn}
            </button>
            <div style={{ fontSize: 12, color: "#5A5478", textAlign: "center" }}>{t.hero.demoNote}</div>
          </div>
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: "#0A0814", borderRadius: 14, padding: 20, textAlign: "center", border: `2px solid ${myCol}30` }}>
              <div style={{ fontSize: 10, color: "#9B96B8", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>{t.demoResult.score.toUpperCase()}</div>
              <div style={{ fontSize: 48, fontWeight: 900, color: myCol, fontFamily: "var(--font-display)", lineHeight: 1 }}>{result.score}</div>
            </div>
            <div style={{ background: "#0A0814", borderRadius: 14, padding: 20, textAlign: "center", border: `2px solid ${compCol}30` }}>
              <div style={{ fontSize: 10, color: "#9B96B8", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>{t.demoResult.compScore.toUpperCase()}</div>
              <div style={{ fontSize: 48, fontWeight: 900, color: compCol, fontFamily: "var(--font-display)", lineHeight: 1 }}>{result.competitorScore}</div>
            </div>
          </div>

          {result.summary && (
            <div style={{ background: "#0A0814", borderRadius: 12, padding: 16, border: `1px solid ${V1}20` }}>
              <div style={{ fontSize: 11, color: V3, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>{t.demoResult.gap}: −{(result.competitorScore||0)-(result.score||0)}</div>
              <p style={{ fontSize: 13, color: "#C4C0DA", lineHeight: 1.65 }}>{result.summary}</p>
            </div>
          )}

          {result.issues && result.issues.length > 0 && (
            <div style={{ background: "#0A0814", borderRadius: 12, padding: 16, border: "1px solid rgba(239,68,68,0.2)" }}>
              <div style={{ fontSize: 11, color: "#EF4444", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>{result.issues.length} {t.demoResult.issues.toUpperCase()}</div>
              {result.issues.slice(0, 2).map((issue, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <span style={{ color: "#EF4444", fontWeight: 700, flexShrink: 0 }}>!</span>
                  <span style={{ fontSize: 12, color: "#C4C0DA", lineHeight: 1.6 }}>{issue.problem}</span>
                </div>
              ))}
              {result.issues.length > 2 && (
                <div style={{ fontSize: 13, color: "#EF4444", fontWeight: 600, marginTop: 6 }}>
                  +{result.issues.length - 2} {lang === "ru" ? "ещё проблем — зарегистрируйтесь чтобы увидеть все" : "more issues — sign up to see all"}
                </div>
              )}
            </div>
          )}

          <div style={{ background: `linear-gradient(135deg, ${V1}18, ${V2}10)`, borderRadius: 14, padding: 20, textAlign: "center", border: `1px solid ${V1}30` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#F5F3FF", marginBottom: 8 }}>{t.demoResult.signupPrompt}</div>
            <button onClick={() => navigate("/auth")} style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${V1}, ${V2})`, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "var(--font-body)", boxShadow: `0 2px 16px ${V1}35` }}>
              {t.demoResult.signupBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const [lang, setLang] = useLang();
  const t = S[lang];

  useEffect(() => {
    const bl = navigator.language || "";
    if (bl.toLowerCase().startsWith("ru") && lang === "en") setLang("ru");
  }, []);

  return (
    <div style={{ fontFamily: "var(--font-body)", background: DK, color: "#E8E5F5", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800;12..96,900&family=DM+Sans:wght@300;400;500;700&display=swap');
        :root{--font-display:'Bricolage Grotesque',sans-serif;--font-body:'DM Sans',sans-serif;}
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        @keyframes pulse{0%,100%{opacity:0.18;}50%{opacity:0.45;}}
        @keyframes starPulse{0%,100%{opacity:0.7;transform:scale(1);}50%{opacity:1;transform:scale(1.3);}}
        @keyframes pulseDot{0%,100%{box-shadow:0 0 4px #22C55E;opacity:0.8;}50%{box-shadow:0 0 12px #22C55E,0 0 4px #22C55E;opacity:1;}}
        .step-sub{position:relative;z-index:1;}
        .pulse-dot{animation:pulseDot 1.8s ease-in-out infinite;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .mockup-grid{grid-template-columns:1fr 1fr;}
        @media(max-width:640px){.mockup-grid{grid-template-columns:1fr!important;}}
        button,a{cursor:pointer;font-family:var(--font-body);transition:transform 0.18s,opacity 0.18s;}
        button:hover:not(:disabled),a:hover{opacity:0.88;transform:translateY(-1px);}
        .nav-link{transition:color 0.2s!important;transform:none!important;}
        .nav-link:hover{color:#F5F3FF!important;opacity:1!important;transform:none!important;}
        @media(max-width:640px){.hero-btns{flex-direction:column;}.hide-mobile{display:none!important;}}
        @media(max-width:900px){.pricing-grid{grid-template-columns:repeat(2,1fr)!important;}}
        @media(max-width:540px){.pricing-grid{grid-template-columns:1fr!important;}}
      `}</style>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, padding: "0 32px", borderBottom: `1px solid ${V1}12`, background: `${DK}F0`, backdropFilter: "blur(20px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div onClick={() => navigate("/")} style={{ cursor: "pointer" }}><Logo /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }} className="hide-mobile">
            <a href="#how"     className="nav-link" style={{ color: "#B0AACC", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>{t.nav.features}</a>
            <a href="#pricing" className="nav-link" style={{ color: "#B0AACC", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>{t.nav.pricing}</a>
            <a href="https://tally.so/r/NpYqMl" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ color: "#B0AACC", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>{t.nav.contact}</a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: `${V1}0A`, border: `1px solid ${V1}18`, borderRadius: 8, overflow: "hidden", display: "flex" }}>
              {["en","ru"].map(l => (
                <button key={l} onClick={() => setLang(l)} style={{ padding: "5px 12px", border: "none", fontWeight: 700, fontSize: 12, background: lang === l ? `${V1}25` : "transparent", color: lang === l ? V3 : "#6D628F", letterSpacing: "0.04em" }}>{l.toUpperCase()}</button>
              ))}
            </div>
            <button onClick={() => navigate("/auth")} style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${V1}, ${V2})`, color: "#fff", fontWeight: 700, fontSize: 14, boxShadow: `0 2px 16px ${V1}30` }}>
              {t.nav.try}
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "90px 24px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "5%", left: "50%", transform: "translateX(-50%)", width: 800, height: 500, background: `radial-gradient(ellipse, ${V1}14 0%, transparent 70%)`, pointerEvents: "none" }} />
        <AnimDiv style={{ maxWidth: 780, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 18px", borderRadius: 100, background: `${V1}12`, border: `1px solid ${V1}25`, color: V3, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 28 }}>
            <span style={{ animation: "starPulse 2.4s ease-in-out infinite", display: "inline-block" }}>✦</span>
            <span>{lang === "ru" ? "ИИ-анализ листингов для маркетплейсов" : "AI-powered listing analysis"}</span>
          </div>
          <h1 style={{ fontSize: "clamp(32px,5.5vw,68px)", fontWeight: 900, letterSpacing: "-0.04em", fontFamily: "var(--font-display)", lineHeight: 1.08, marginBottom: 20 }}>
            <span style={{ color: "#F5F3FF", display: "block" }}>{t.hero.h1a}</span>
            <span style={{ background: `linear-gradient(135deg, ${V1}, ${V3})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "block" }}>{t.hero.h1b}</span>
          </h1>
          <p style={{ fontSize: "clamp(17px,2vw,22px)", fontWeight: 600, marginBottom: 8, background: `linear-gradient(135deg, ${V3}, #F472B6)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {lang === "ru" ? "Каждый день слабый листинг отдаёт ваши продажи конкурентам." : "Every day your listing underperforms, competitors take your sales."}
          </p>
          <p style={{ fontSize: "clamp(17px,2vw,22px)", color: "#C4C0DA", lineHeight: 1.55, marginBottom: 36, fontWeight: 500 }}>
            {t.hero.sub}
          </p>
          <div className="hero-btns" style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 56 }}>
            <button onClick={() => navigate("/auth")} style={{ padding: "16px 36px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${V1}, ${V2})`, color: "#fff", fontWeight: 700, fontSize: 16, boxShadow: `0 4px 32px ${V1}40` }}>
              {t.hero.cta}
            </button>
          </div>
        </AnimDiv>
        <AnimDiv delay={0.15}>
          <div style={{ marginBottom: 16, textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 100, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)" }}>
              <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#22C55E", letterSpacing: "0.06em" }}>{lang === "ru" ? "ДЕМО — БЕЗ РЕГИСТРАЦИИ" : "LIVE DEMO — NO SIGN-UP"}</span>
            </div>
          </div>
          <InlineDemo t={t} navigate={navigate} lang={lang} />
        </AnimDiv>
      </section>

      {/* REAL PROBLEM */}
      <section style={{ padding: "80px 24px", background: LT }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <AnimDiv style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ color: V2, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 14 }}>{t.proof.tag}</div>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 800, color: "#1A1330", letterSpacing: "-0.03em", fontFamily: "var(--font-display)" }}>{t.proof.title}</h2>
          </AnimDiv>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
            {t.proof.points.map((p, i) => (
              <AnimDiv key={i} delay={i * 0.1}>
                <div style={{ padding: 28, borderRadius: 20, background: `${V1}05`, border: `1px solid ${V1}12`, height: "100%" }}>
                  <div style={{ fontSize: 32, marginBottom: 16 }}>{p.icon}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1A1330", marginBottom: 10, fontFamily: "var(--font-display)" }}>{p.title}</h3>
                  <p style={{ color: "#6B647A", fontSize: 14, lineHeight: 1.65 }}>{p.desc}</p>
                </div>
              </AnimDiv>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: "80px 24px", background: LT }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <AnimDiv style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ color: V2, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 14 }}>{t.how.tag}</div>
            <h2 style={{ fontSize: "clamp(26px,3.5vw,42px)", fontWeight: 800, color: "#1A1330", letterSpacing: "-0.03em", fontFamily: "var(--font-display)" }}>{t.how.title}</h2>
          </AnimDiv>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {t.how.steps.map((step, i) => (
              <AnimDiv key={i} delay={i * 0.12}>
                <div style={{ display: "flex", gap: 28, alignItems: "flex-start", padding: 32, borderRadius: 20, background: "#fff", border: `1px solid rgba(139,92,246,0.1)`, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 10, right: 12, fontSize: 80, fontWeight: 900, fontFamily: "var(--font-display)", color: "#EDE9FE", lineHeight: 1, userSelect: "none" }}>{step.n}</div>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: `${step.color}14`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: step.color, flexShrink: 0, border: `1px solid ${step.color}22` }}>
                    {step.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="step-sub" style={{ fontSize: 11, fontWeight: 700, color: step.color, letterSpacing: "0.08em", marginBottom: 4, maxWidth: "calc(100% - 60px)" }}>{step.sub}</div>
                    <h3 style={{ fontSize: 22, fontWeight: 800, color: "#1A1330", marginBottom: 10, fontFamily: "var(--font-display)" }}>{step.title}</h3>
                    <p style={{ color: "#6B647A", fontSize: 15, lineHeight: 1.68 }}>{step.desc}</p>
                  </div>
                </div>
              </AnimDiv>
            ))}
          </div>
        </div>
      </section>

      {/* MARKETPLACES */}
      <section style={{ padding: "80px 24px", background: DK }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <AnimDiv style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ color: V3, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 14 }}>{t.markets.tag}</div>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 800, color: "#F5F3FF", letterSpacing: "-0.03em", fontFamily: "var(--font-display)", marginBottom: 16 }}>{t.markets.title}</h2>
            <p style={{ color: "#9B96B8", fontSize: 16, maxWidth: 580, margin: "0 auto", lineHeight: 1.65 }}>{t.markets.sub}</p>
          </AnimDiv>
          <AnimDiv delay={0.1}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginBottom: 24 }}>
              {MARKETPLACES.map(m => (
                <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", borderRadius: 100, background: `${m.color}10`, border: `1px solid ${m.color}30` }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#fff", flexShrink: 0 }}>{m.abbr}</div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: m.color }}>{m.name}</span>
                </div>
              ))}
            </div>
            <p style={{ textAlign: "center", color: "#5A5478", fontSize: 14, fontStyle: "italic" }}>{t.markets.any}</p>
          </AnimDiv>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "80px 24px", background: "#0D0B1A" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <AnimDiv style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ color: V3, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 12 }}>{t.pricing.tag}</div>
            <h2 style={{ fontSize: "clamp(26px,4vw,42px)", fontWeight: 800, color: "#F5F3FF", letterSpacing: "-0.03em", fontFamily: "var(--font-display)", marginBottom: 10 }}>{t.pricing.title}</h2>
            <p style={{ color: "#9B96B8", fontSize: 16, marginBottom: 8 }}>{t.pricing.sub}</p>
            {t.pricing.valueNote && <p style={{ fontSize: 13, color: `${V3}`, fontWeight: 600, background: `${V1}10`, border: `1px solid ${V1}20`, borderRadius: 8, padding: "8px 16px", display: "inline-block" }}>💡 {t.pricing.valueNote}</p>}
          </AnimDiv>
          <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
            {t.pricing.plans.map((pl, i) => (
              <AnimDiv key={i} delay={i * 0.08} style={{
                background: pl.hl ? `linear-gradient(180deg,${V1}0D,${V1}04)` : `${V1}04`,
                borderRadius: 22, padding: 24,
                border: pl.hl ? `2px solid ${V1}28` : `1px solid ${V1}0A`,
                position: "relative",
              }}>
                {pl.hl && <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(135deg,${V1},${V2})`, padding: "4px 16px", borderRadius: 100, fontSize: 11, fontWeight: 700, color: "#fff" }}>{t.popular}</div>}
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#F5F3FF", marginBottom: 3, fontFamily: "var(--font-display)" }}>{pl.name}</h3>
                <p style={{ color: "#6D628F", fontSize: 13, marginBottom: 16 }}>{pl.desc}</p>
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: pl.hl ? V3 : "#F5F3FF", fontFamily: "var(--font-display)" }}>{pl.price}</span>
                  <span style={{ color: "#6D628F", fontSize: 14 }}>{pl.period}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  {pl.features.map((f, fi) => (
                    <div key={fi} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: V3, fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                      <span style={{ color: "#C4C0DA", fontSize: 13, lineHeight: 1.4 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate("/auth")} style={{
                  width: "100%", padding: "11px 0", borderRadius: 12,
                  border: pl.hl ? "none" : `1px solid ${V1}28`,
                  background: pl.hl ? `linear-gradient(135deg,${V1},${V2})` : "transparent",
                  color: pl.hl ? "#fff" : "#A098C8", fontWeight: 700, fontSize: 14,
                }}>
                  {pl.cta}
                </button>
              </AnimDiv>
            ))}
          </div>
        </div>
      </section>


      {/* WHAT TOP SELLERS DO */}
      <section style={{ padding: "80px 24px", background: CARD }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <AnimDiv style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ color: V3, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 14 }}>
              {lang === "ru" ? "ЧТО СКРЫТО ОТ ВАС" : "WHAT YOU'RE NOT SEEING"}
            </div>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 800, color: "#F5F3FF", letterSpacing: "-0.03em", fontFamily: "var(--font-display)", marginBottom: 16 }}>
              {lang === "ru" ? "Что топ-продавцы делают — а вы даже не замечаете" : "What top sellers do that you don't even notice"}
            </h2>
            <p style={{ color: "#9B96B8", fontSize: 16, maxWidth: 560, margin: "0 auto", lineHeight: 1.65 }}>
              {lang === "ru" ? "Разрыв между вашим листингом и топом — не в товаре. Он в деталях которые не видны без анализа." : "The gap between your listing and the top isn't your product. It's details invisible without analysis."}
            </p>
          </AnimDiv>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))", gap: 16 }}>
            {[
              {
                en: { icon: "🔑", title: "Keyword placement that ranks", body: "Top sellers don't stuff keywords — they place them in exact positions that marketplace algorithms reward. Based on top-performing listing patterns." },
                ru: { icon: "🔑", title: "Ключевые слова в нужных позициях", body: "Топ-продавцы не спамят ключевыми словами — они размещают их в позициях которые алгоритмы маркетплейсов вознаграждают. На основе паттернов топовых листингов." }
              },
              {
                en: { icon: "📐", title: "Structure buyers scan, not read", body: "Buyers don't read listings — they scan. Top listings are structured for 3-second decisions. Based on real customer behavior signals." },
                ru: { icon: "📐", title: "Структура для сканирования, не чтения", body: "Покупатели не читают листинги — они сканируют. Топовые листинги структурированы для решения за 3 секунды. На основе реальных сигналов поведения покупателей." }
              },
              {
                en: { icon: "💬", title: "Words that trigger buying decisions", body: "Certain words convert 3x better than others in each category. Top sellers know which ones. Based on competitor patterns across thousands of listings." },
                ru: { icon: "💬", title: "Слова которые запускают покупку", body: "Определённые слова конвертируют в 3 раза лучше других в каждой категории. Топ-продавцы знают какие. На основе паттернов конкурентов по тысячам листингов." }
              },
              {
                en: { icon: "⚡", title: "The first 10 words decide everything", body: "Search results show only the title. Buyers decide in milliseconds. Top sellers engineer their titles to stop the scroll. You can see the exact difference in seconds." },
                ru: { icon: "⚡", title: "Первые 10 слов решают всё", body: "В результатах поиска виден только заголовок. Покупатели решают за миллисекунды. Топ-продавцы проектируют заголовки чтобы остановить скролл. Разницу можно увидеть за секунды." }
              },
            ].map((item, i) => {
              const d = lang === "ru" ? item.ru : item.en;
              return (
                <AnimDiv key={i} delay={i * 0.08}>
                  <div style={{ padding: 24, borderRadius: 16, background: `${V1}06`, border: `1px solid ${V1}14`, height: "100%" }}>
                    <div style={{ fontSize: 28, marginBottom: 14 }}>{d.icon}</div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#F5F3FF", marginBottom: 8, fontFamily: "var(--font-display)" }}>{d.title}</h3>
                    <p style={{ color: "#9B96B8", fontSize: 13, lineHeight: 1.65 }}>{d.body}</p>
                  </div>
                </AnimDiv>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY BETTER THAN CHATGPT */}
      <section style={{ padding: "80px 24px", background: "#0D0B1A" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <AnimDiv style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ color: V3, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 14 }}>
              {lang === "ru" ? "ЧЕМ МЫ ЛУЧШЕ CHATGPT" : "VS CHATGPT"}
            </div>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 800, color: "#F5F3FF", letterSpacing: "-0.03em", fontFamily: "var(--font-display)" }}>
              {lang === "ru" ? "ChatGPT пишет. SellScribe исправляет." : "ChatGPT writes. SellScribe fixes."}
            </h2>
          </AnimDiv>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {[
              {
                en: ["ChatGPT", "Generates text from scratch", "No competitor data", "No marketplace knowledge", "You decide what to ask", "Generic output — could be for anyone", "No before/after comparison"],
                ru: ["ChatGPT", "Генерирует текст с нуля", "Нет данных конкурентов", "Не знает правила маркетплейсов", "Вы сами решаете что спросить", "Общий результат — подойдёт кому угодно", "Нет сравнения До/После"]
              },
              {
                en: ["SellScribe", "Analyzes YOUR specific listing vs competitors", "Compares against top-performing listings", "Built for every major marketplace", "Diagnoses the problem automatically", "Fixes what's specifically costing YOUR sales", "Shows exact Before & After with explanations"],
                ru: ["SellScribe", "Анализирует ВАШ конкретный листинг vs конкуренты", "Сравнивает с топовыми листингами", "Создан для всех ключевых маркетплейсов", "Диагностирует проблему автоматически", "Исправляет то что съедает ВАШИ продажи", "Показывает точное До/После с объяснениями"]
              }
            ].map((col, ci) => {
              const isUs = ci === 1;
              return (
                <AnimDiv key={ci} delay={ci * 0.1}>
                  <div style={{ borderRadius: 20, overflow: "hidden", border: isUs ? `2px solid ${V1}40` : "1px solid rgba(255,255,255,0.06)", height: "100%" }}>
                    <div style={{ padding: "16px 20px", background: isUs ? `linear-gradient(135deg, ${V1}, ${V2})` : "rgba(255,255,255,0.04)", borderBottom: isUs ? "none" : "1px solid rgba(255,255,255,0.06)" }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: "var(--font-display)" }}>{col[lang === "ru" ? "ru" : "en"][0]}</span>
                    </div>
                    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10, background: isUs ? `${V1}08` : "transparent" }}>
                      {col[lang === "ru" ? "ru" : "en"].slice(1).map((item, i) => (
                        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <span style={{ color: isUs ? "#22C55E" : "#4A4768", fontWeight: 700, fontSize: 14, flexShrink: 0, marginTop: 1 }}>{isUs ? "✓" : "✗"}</span>
                          <span style={{ fontSize: 13, color: isUs ? "#C4C0DA" : "#5A5478", lineHeight: 1.5 }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </AnimDiv>
              );
            })}
          </div>
        </div>
      </section>

      {/* KILLER MOCKUP */}
      <section style={{ padding: "80px 24px", background: LT }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <AnimDiv style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ color: V2, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 14 }}>
              {lang === "ru" ? "КАК ЭТО ВЫГЛЯДИТ" : "WHAT YOU GET"}
            </div>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 800, color: "#1A1330", letterSpacing: "-0.03em", fontFamily: "var(--font-display)" }}>
              {lang === "ru" ? "Полный разбор. Конкретный результат." : "Full breakdown. Concrete result."}
            </h2>
          </AnimDiv>
          <AnimDiv delay={0.1}>
            <div style={{ background: "#fff", borderRadius: 24, overflow: "hidden", border: "1px solid rgba(139,92,246,0.12)", boxShadow: "0 8px 60px rgba(139,92,246,0.1)" }}>
              {/* Top bar */}
              <div style={{ padding: "12px 20px", background: "#F7F5FF", borderBottom: "1px solid #EDE9F8", display: "flex", gap: 6 }}>
                {["#FF5F57","#FFBD2E","#28CA41"].map(c => <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />)}
                <span style={{ fontSize: 12, color: "#9B96B8", marginLeft: 8 }}>sellscribe.app/generate</span>
              </div>
              <div className="mockup-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 420 }}>
                {/* Left - scores */}
                <div style={{ padding: 28, borderRight: "1px solid #EDE9F8", display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#9B96B8", letterSpacing: "0.08em" }}>ANALYSIS RESULT</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ textAlign: "center", padding: "16px 12px", borderRadius: 14, border: "2px solid rgba(255,77,109,0.2)", background: "rgba(255,77,109,0.04)" }}>
                      <div style={{ fontSize: 10, color: "#9B96B8", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 6 }}>MY LISTING</div>
                      <div style={{ fontSize: 42, fontWeight: 900, color: "#FF4D6D", fontFamily: "var(--font-display)", lineHeight: 1 }}>38</div>
                      <div style={{ fontSize: 11, color: "#FF4D6D", fontWeight: 600, marginTop: 4 }}>Needs work</div>
                    </div>
                    <div style={{ textAlign: "center", padding: "16px 12px", borderRadius: 14, border: "2px solid rgba(34,197,94,0.2)", background: "rgba(34,197,94,0.04)" }}>
                      <div style={{ fontSize: 10, color: "#9B96B8", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 6 }}>COMPETITOR</div>
                      <div style={{ fontSize: 42, fontWeight: 900, color: "#22C55E", fontFamily: "var(--font-display)", lineHeight: 1 }}>81</div>
                      <div style={{ fontSize: 11, color: "#22C55E", fontWeight: 600, marginTop: 4 }}>Top performer</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "#9B96B8", textAlign: "center", lineHeight: 1.5, padding: "0 4px" }}>
                    Score based on structure, keyword coverage, and conversion patterns from top sellers
                  </div>
                  <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(255,77,109,0.04)", border: "1px solid rgba(255,77,109,0.15)" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#FF4D6D", letterSpacing: "0.06em", marginBottom: 8 }}>GAP: −43 · 4 ISSUES FOUND</div>
                    {["Missing core keywords competitors use", "Title too generic — no specifics", "No social proof or trust signals", "Weak opening — doesn't stop the scroll"].map((issue, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                        <span style={{ color: "#FF4D6D", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>!</span>
                        <span style={{ fontSize: 12, color: "#6B647A" }}>{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Right - before/after */}
                <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#9B96B8", letterSpacing: "0.08em" }}>BEFORE → AFTER</div>
                  <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,77,109,0.04)", border: "1px solid rgba(255,77,109,0.15)" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#FF4D6D", letterSpacing: "0.06em", marginBottom: 6 }}>BEFORE</div>
                    <div style={{ fontSize: 13, color: "#6B647A", lineHeight: 1.6 }}>
                      <span style={{ background: "rgba(255,77,109,0.12)", borderBottom: "2px solid #FF4D6D", borderRadius: 2 }}>Wireless Charger</span>
                      {" — charges your phone wirelessly. Compatible with most phones."}
                    </div>
                  </div>
                  <div style={{ textAlign: "center", fontSize: 18, color: "#22C55E", fontWeight: 700 }}>↓</div>
                  <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.2)" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#22C55E", letterSpacing: "0.06em", marginBottom: 6 }}>AFTER</div>
                    <div style={{ fontSize: 13, color: "#2A2340", lineHeight: 1.6 }}>
                      <span style={{ background: "rgba(34,197,94,0.12)", borderBottom: "2px solid #22C55E", borderRadius: 2 }}>Fast Wireless Charger 15W — iPhone 15 & Samsung S24</span>
                      {" | Qi-certified, eco bamboo, charges 3× faster than standard pads"}
                    </div>
                  </div>
                  <div style={{ padding: "10px 14px", borderRadius: 10, background: "#F7F5FF", border: "1px solid #EDE9F8" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#9B96B8", letterSpacing: "0.06em", marginBottom: 4 }}>WHY WE CHANGED THIS</div>
                    <div style={{ fontSize: 12, color: "#6B647A", lineHeight: 1.55 }}>✓ Added specific phone models — top competitors all mention them<br/>✓ Added speed claim — #1 keyword in this category<br/>✓ Added eco angle — converts 28% better in this niche</div>
                  </div>
                </div>
              </div>
            </div>
          </AnimDiv>
        </div>
      </section>

      {/* FAQ */}
      <FaqSection t={t} />

      {/* FINAL CTA */}
      <section style={{ padding: "80px 24px", background: DK }}>
        <AnimDiv style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", padding: "64px 40px", borderRadius: 28, background: `linear-gradient(135deg,${V1}10,${V2}06)`, border: `1px solid ${V1}20`, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: `radial-gradient(circle,${V1}15,transparent)`, pointerEvents: "none" }} />
          <h2 style={{ fontSize: "clamp(24px,3.5vw,36px)", fontWeight: 800, color: "#F5F3FF", marginBottom: 14, fontFamily: "var(--font-display)", letterSpacing: "-0.03em", position: "relative" }}>
            {t.cta.title}
          </h2>
          <p style={{ color: "#9B96B8", fontSize: 16, lineHeight: 1.65, marginBottom: 32, position: "relative" }}>{t.cta.sub}</p>
          <button onClick={() => navigate("/auth")} style={{ padding: "16px 44px", borderRadius: 14, border: "none", background: `linear-gradient(135deg,${V1},${V2})`, color: "#fff", fontWeight: 700, fontSize: 16, boxShadow: `0 4px 32px ${V1}30`, position: "relative" }}>
            {t.cta.btn}
          </button>
        </AnimDiv>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "28px 24px", background: DK, borderTop: `1px solid ${V1}10` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <Logo />
          <p style={{ color: "#7A74A0", fontSize: 13 }}>{t.footer}</p>
        </div>
      </footer>
    </div>
  );
}
