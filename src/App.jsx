import { useState, useRef, useEffect } from "react";

const V1 = "#8B5CF6";
const V2 = "#7C3AED";
const V3 = "#A78BFA";
const DK = "#0A0814";
const CARD = "#110E1D";
const LT = "#F7F5FF";

// ─── SVG platform icons (fix #3: realistic Kaspi + WB logos) ───────────────
function IconWildberries({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <rect width="40" height="40" rx="8" fill="#CB11AB"/>
      <text x="20" y="27" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="15" fill="#fff">WB</text>
    </svg>
  );
}
function IconKaspi({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <rect width="40" height="40" rx="8" fill="#E31E24"/>
      <text x="20" y="28" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="20" fill="#fff">K</text>
    </svg>
  );
}

// emoji fallback for platforms without custom SVG
function EmojiIcon({ emoji, size = 22 }) {
  return <span style={{ fontSize: size, lineHeight: 1 }}>{emoji}</span>;
}

const PLATFORM_ICONS = {
  amazon:      ({ size = 22 }) => <EmojiIcon emoji="📦" size={size} />,
  shopify:     ({ size = 22 }) => <EmojiIcon emoji="🛍️" size={size} />,
  etsy:        ({ size = 22 }) => <EmojiIcon emoji="🎨" size={size} />,
  ebay:        ({ size = 22 }) => <EmojiIcon emoji="🏷️" size={size} />,
  wildberries: IconWildberries,
  kaspi:       IconKaspi,
};

const PLATFORMS = [
  { id: "amazon",      name: "Amazon",      color: "#FF9900" },
  { id: "shopify",     name: "Shopify",     color: "#96BF48" },
  { id: "etsy",        name: "Etsy",        color: "#F1641E" },
  { id: "ebay",        name: "eBay",        color: "#E53238" },
  { id: "wildberries", name: "Wildberries", color: "#CB11AB" },
  { id: "kaspi",       name: "Kaspi",       color: "#E31E24" },
];

const PLATFORM_RULES = [
  {
    id: "amazon", name: "Amazon", color: "#FF9900",
    format: { en: "5 bullet points", ru: "5 буллет-поинтов" },
    lang: { en: "English", ru: "Английский" },
    limit: { en: "200 char title · 80 char/bullet", ru: "200 зн. заголовок · 80 зн./буллет" },
    tone: { en: "Specs-first, keyword-dense", ru: "Технические хар-ки, ключевые слова" },
    sample: "• Premium natural bamboo with anti-slip silicone base\n• Qi-certified 15W fast charge — iPhone 15, Samsung S24, AirPods\n• Ultra-slim 5mm profile, eco-packaged, zero plastic",
  },
  {
    id: "etsy", name: "Etsy", color: "#F1641E",
    format: { en: "Storytelling paragraphs + 13 tags", ru: "Сторителлинг-параграфы + 13 тегов" },
    lang: { en: "English", ru: "Английский" },
    limit: { en: "140 char title · 13 tags required", ru: "140 зн. заголовок · 13 тегов обязательно" },
    tone: { en: "Artisan, warm, personal", ru: "Авторский, тёплый, личный" },
    sample: "Every piece celebrates the natural grain of sustainably sourced bamboo. Crafted for the eco-conscious desk dweller who believes beautiful objects should also do good in the world.",
  },
  {
    id: "shopify", name: "Shopify", color: "#96BF48",
    format: { en: "SEO paragraphs", ru: "SEO-параграфы" },
    lang: { en: "English", ru: "Английский" },
    limit: { en: "60 char title · 320 char meta", ru: "60 зн. заголовок · 320 зн. мета" },
    tone: { en: "Conversion-focused, Google SEO", ru: "Конверсионный, SEO под Google" },
    sample: "Upgrade your workspace with our sustainably crafted bamboo wireless charger. Designed for modern desks and eco-conscious lifestyles — charges all Qi-enabled devices at up to 15W.",
  },
  {
    id: "ebay", name: "eBay", color: "#E53238",
    format: { en: "Condition + spec table", ru: "Состояние + таблица характеристик" },
    lang: { en: "English", ru: "Английский" },
    limit: { en: "80 char title", ru: "80 зн. заголовок" },
    tone: { en: "Factual, condition-first", ru: "Фактический, акцент на состоянии" },
    sample: "NEW | Bamboo Wireless Charging Pad 15W Qi | Compatible: iPhone/Samsung/AirPods | Material: Natural bamboo | Dimensions: 100×100×5mm | Package: Retail box",
  },
  {
    id: "wildberries", name: "Wildberries", color: "#CB11AB",
    format: { en: "Short bullets + specs", ru: "Короткие буллеты + характеристики" },
    lang: { en: "🇷🇺 Russian (native)", ru: "🇷🇺 Русский (нативно)" },
    limit: { en: "100 char title", ru: "100 зн. заголовок" },
    tone: { en: "Direct, feature-focused", ru: "Прямой, по функциям" },
    sample: "• Материал: натуральный бамбук\n• Мощность зарядки: 15W (Qi)\n• Совместимость: iPhone, Samsung, AirPods\n• Противоскользящее основание · Толщина 5 мм",
  },
  {
    id: "kaspi", name: "Kaspi", color: "#E31E24",
    format: { en: "Characteristics table", ru: "Таблица характеристик" },
    lang: { en: "🇷🇺 Russian (native)", ru: "🇷🇺 Русский (нативно)" },
    limit: { en: "60 char title", ru: "60 зн. заголовок" },
    tone: { en: "Concise, technical specs", ru: "Краткий, технические параметры" },
    sample: "Беспроводная зарядка бамбуковая 15W Qi. Тип: беспроводная. Мощность: 15W. Материал: бамбук. Цвет: натуральный. Размер: 100×100 мм.",
  },
];

// ─── Full i18n strings ──────────────────────────────────────────────────────
const STRINGS = {
  en: {
    badge: "AI-powered product listings",
    h1a: "Write once.", h1b: "Sell everywhere.",
    sub: "Describe your product once. Get optimized listings for Amazon, Shopify, Etsy, eBay, Wildberries & Kaspi — each tailored to its marketplace.",
    cta: "Start for free →",
    navPlatforms: "Platforms", navFeatures: "Features", navPricing: "Pricing", navTry: "Try Free",

    whyTag: "WHY IT MATTERS",
    whyTitle: "Every platform speaks a different language",
    whySub: "Same product. Completely different rules — format, length, tone, even the actual language. SellScribe knows them all and applies them automatically.",
    sampleLabel: "Generated output sample",
    sampleReady: "Platform-optimised · Ready to paste",
    ruleLabels: { format: "Format", lang: "Language", limit: "Limits", tone: "Tone" },

    mathTag: "THE MATH IS SIMPLE",
    mathTitle: "100 products. The difference is 250 hours.",
    manualLabel: "MANUAL — PER PRODUCT",
    ssLabel: "SELLSCRIBE — PER PRODUCT",
    manualItems: [
      { plat: "Amazon",      color: "#FF9900", time: "45 min", note: "Bullet points + keyword research" },
      { plat: "Etsy",        color: "#F1641E", time: "30 min", note: "Storytelling tone + 13 tags" },
      { plat: "Shopify",     color: "#96BF48", time: "25 min", note: "SEO paragraphs for Google" },
      { plat: "Wildberries", color: "#CB11AB", time: "35 min", note: "Translate to Russian + reformat" },
      { plat: "Kaspi",       color: "#E31E24", time: "20 min", note: "Spec table in Cyrillic" },
    ],
    totalManual: "Total per product", totalSS: "Total per product",
    totalManualVal: "~2.5 hrs", totalSSVal: "~30 sec",
    ssSteps: [
      { label: "Paste product name", sub: "Or upload a CSV for bulk" },
      { label: "Select platforms",   sub: "Any combination of 6" },
      { label: "Click generate",     sub: "All formats, instantly" },
    ],
    outputLabel: "OUTPUT — ALL 6 PLATFORMS",
    savingsLine: ["100 products manually =", "250 hrs", "with SellScribe =", "50 minutes"],

    howTag: "HOW IT WORKS", howTitle: "Three steps. All platforms.",
    steps: [
      { n: "01", t: "Describe",  d: "Enter your product name and key features. Or just a name — AI infers the rest.", icon: "✎" },
      { n: "02", t: "Select",    d: "Pick platforms: Amazon, Shopify, Etsy, eBay, Wildberries, Kaspi. Any combination.", icon: "⎚" },
      { n: "03", t: "Generate",  d: "Get unique, SEO-optimized listings tailored to each marketplace's format and audience.", icon: "✦" },
    ],

    whySSTag: "WHY SELLSCRIBE", whySSTitle: "Built for multi-platform sellers",
    features: [
      { icon: "🌍", t: "6 platforms, one click",         d: "Every tool out there locks you to one marketplace. SellScribe generates for Amazon, Shopify, Etsy, eBay, Wildberries, and Kaspi simultaneously.", accent: "#FF9900" },
      { icon: "🧠", t: "Platform-aware intelligence",    d: "Amazon shoppers want specs and bullet points. Etsy buyers want the story behind the product. Our AI adapts the selling angle — not just the format.", accent: V1 },
      { icon: "🇷🇺", t: "Native Russian for CIS markets",d: "Wildberries and Kaspi listings aren't translated through Google — they're written natively in Russian, with natural phrasing that converts.", accent: "#CB11AB" },
      { icon: "📊", t: "SEO that actually works",        d: "Not keyword stuffing. Natural keyword integration based on what real buyers search for on each platform.", accent: "#14B8A6" },
    ],

    priceTag: "PRICING", priceTitle: "Simple, transparent pricing", priceSub: "Start free. Scale as you grow.",
    plans: [
      { name: "Starter", price: "Free", period: "",    desc: "Try it out",        features: ["10 descriptions/month","3 platforms","Basic SEO","Copy to clipboard"],           cta: "Start Free",    hl: false },
      { name: "Growth",  price: "$9",   period: "/mo", desc: "For active sellers", features: ["100 descriptions/month","All 6 platforms","Advanced SEO","Export to CSV","Tone customization"], cta: "Start Growing", hl: true  },
      { name: "Pro",     price: "$29",  period: "/mo", desc: "Power sellers",      features: ["500 descriptions/month","Brand Voice learning","Bulk CSV upload","Priority generation"],        cta: "Go Pro",        hl: false },
      { name: "Agency",  price: "$79",  period: "/mo", desc: "Teams & agencies",   features: ["Unlimited","Multiple brand voices","API access","Priority support"],              cta: "Contact Us",    hl: false },
    ],

    ctaTitle: "Stop writing listings manually",
    ctaSub: "Join sellers who save hours every week with AI-powered multi-platform descriptions.",
    ctaBtn: "Generate your first listing — free",
    footerNote: "© 2026 SellScribe. Write once. Sell everywhere.",
  },
  ru: {
    badge: "ИИ-листинги для всех маркетплейсов",
    h1a: "Опишите один раз.", h1b: "Продавайте везде.",
    sub: "Описывайте товар один раз. Получайте оптимизированные листинги для Amazon, Shopify, Etsy, eBay, Wildberries и Kaspi — каждый под свою платформу.",
    cta: "Начать бесплатно →",
    navPlatforms: "Платформы", navFeatures: "Как работает", navPricing: "Тарифы", navTry: "Попробовать",

    whyTag: "ПОЧЕМУ ЭТО ВАЖНО",
    whyTitle: "Каждая платформа говорит на своём языке",
    whySub: "Один и тот же товар — совершенно разные правила: формат, длина, тон и даже язык. SellScribe знает их все и применяет автоматически.",
    sampleLabel: "Пример сгенерированного текста",
    sampleReady: "Оптимизировано под платформу · Готово к вставке",
    ruleLabels: { format: "Формат", lang: "Язык", limit: "Лимиты", tone: "Тон" },

    mathTag: "ПРОСТАЯ МАТЕМАТИКА",
    mathTitle: "100 товаров. Разница — 250 часов.",
    manualLabel: "ВРУЧНУЮ — НА ОДИН ТОВАР",
    ssLabel: "SELLSCRIBE — НА ОДИН ТОВАР",
    manualItems: [
      { plat: "Amazon",      color: "#FF9900", time: "45 мин", note: "Буллеты + исследование ключевых слов" },
      { plat: "Etsy",        color: "#F1641E", time: "30 мин", note: "Сторителлинг + 13 тегов" },
      { plat: "Shopify",     color: "#96BF48", time: "25 мин", note: "SEO-параграфы под Google" },
      { plat: "Wildberries", color: "#CB11AB", time: "35 мин", note: "Перевод на русский + переформатирование" },
      { plat: "Kaspi",       color: "#E31E24", time: "20 мин", note: "Таблица характеристик кириллицей" },
    ],
    totalManual: "Итого на товар", totalSS: "Итого на товар",
    totalManualVal: "~2.5 часа", totalSSVal: "~30 сек",
    ssSteps: [
      { label: "Вставьте название товара", sub: "Или загрузите CSV для массовой обработки" },
      { label: "Выберите платформы",       sub: "Любая комбинация из 6" },
      { label: "Нажмите «Сгенерировать»",  sub: "Все форматы — мгновенно" },
    ],
    outputLabel: "РЕЗУЛЬТАТ — ВСЕ 6 ПЛАТФОРМ",
    savingsLine: ["100 товаров вручную =", "250 часов", "с SellScribe =", "50 минут"],

    howTag: "КАК ЭТО РАБОТАЕТ", howTitle: "Три шага. Все платформы.",
    steps: [
      { n: "01", t: "Описание",    d: "Введите название и ключевые характеристики товара. Или только название — ИИ сам выведет остальное.", icon: "✎" },
      { n: "02", t: "Выбор",       d: "Выберите платформы: Amazon, Shopify, Etsy, eBay, Wildberries, Kaspi. Любая комбинация.", icon: "⎚" },
      { n: "03", t: "Генерация",   d: "Получите уникальные SEO-оптимизированные листинги под формат и аудиторию каждого маркетплейса.", icon: "✦" },
    ],

    whySSTag: "ПОЧЕМУ SELLSCRIBE", whySSTitle: "Создан для мультиплатформенных продавцов",
    features: [
      { icon: "🌍", t: "6 платформ одним кликом",           d: "Все остальные инструменты привязывают вас к одной площадке. SellScribe генерирует для всех шести одновременно.", accent: "#FF9900" },
      { icon: "🧠", t: "Интеллект, знающий платформы",       d: "Amazon хочет характеристики. Etsy хочет историю. Shopify нужен Google SEO. ИИ адаптирует саму подачу — не только формат.", accent: V1 },
      { icon: "🇷🇺", t: "Нативный русский для СНГ",         d: "Wildberries и Kaspi — написано нативно по-русски, без машинного перевода. Естественный текст, который продаёт.", accent: "#CB11AB" },
      { icon: "📊", t: "SEO, который работает",              d: "Не спам ключевыми словами. Органическая интеграция по реальным запросам покупателей на каждой конкретной платформе.", accent: "#14B8A6" },
    ],

    priceTag: "ТАРИФЫ", priceTitle: "Понятные тарифы", priceSub: "Начните бесплатно. Растите без ограничений.",
    plans: [
      { name: "Старт",     price: "Free", period: "",      desc: "Попробуйте",            features: ["10 описаний в месяц","3 платформы","Базовый SEO","Копирование"],                                    cta: "Начать",            hl: false },
      { name: "Рост",      price: "$9",   period: "/мес",  desc: "Для активных продавцов", features: ["100 описаний в месяц","Все 6 платформ","Расширенный SEO","Экспорт CSV","Настройка тона"],          cta: "Начать рост",       hl: true  },
      { name: "Про",       price: "$29",  period: "/мес",  desc: "Опытным продавцам",      features: ["500 описаний в месяц","Brand Voice обучение","Bulk CSV загрузка","Приоритетная генерация"],         cta: "Перейти на Про",    hl: false },
      { name: "Агентство", price: "$79",  period: "/мес",  desc: "Командам",               features: ["Без ограничений","Несколько голосов бренда","API доступ","Приоритетная поддержка"],                cta: "Написать нам",      hl: false },
    ],

    ctaTitle: "Хватит писать листинги вручную",
    ctaSub: "Присоединяйтесь к продавцам, которые экономят часы каждую неделю — с ИИ-листингами для всех платформ.",
    ctaBtn: "Создать первый листинг — бесплатно",
    footerNote: "© 2026 SellScribe. Описывай один раз. Продавай везде.",
  },
};

const PRICING = STRINGS.en.plans; // fallback, not used directly

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function AnimDiv({ children, delay = 0, direction = "up", style = {}, ...props }) {
  const [ref, visible] = useInView();
  const dirs = { up: "translateY(56px)", left: "translateX(48px)", right: "translateX(-48px)", scale: "scale(0.93)" };
  return (
    <div ref={ref} style={{
      ...style,
      opacity: visible ? 1 : 0,
      transform: visible ? "translate(0) scale(1)" : dirs[direction],
      transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
    }} {...props}>
      {children}
    </div>
  );
}

function Logo({ size = 1, light = false }) {
  // fix #6: use dark background in footer on light bg so SVG is readable
  const bgFill = light ? "#E8E4F8" : CARD;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 * size }}>
      <svg viewBox="0 0 80 80" width={30 * size} height={30 * size}>
        <defs><linearGradient id="lG2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={V3} /><stop offset="50%" stopColor={V1} /><stop offset="100%" stopColor={V2} /></linearGradient></defs>
        <rect width="80" height="80" rx="18" fill={bgFill} />
        <path d="M24 16 C20 16,18 20,18 24 L18 56 C18 60,20 64,24 64 L48 64 C52 64,54 60,54 56 L54 28" stroke="url(#lG2)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M54 28 C54 22,51 18,46 18 L24 18" stroke="url(#lG2)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <line x1="26" y1="30" x2="46" y2="30" stroke={V1} strokeWidth="2" opacity="0.6" strokeLinecap="round" />
        <line x1="26" y1="38" x2="42" y2="38" stroke={V1} strokeWidth="2" opacity="0.45" strokeLinecap="round" />
        <path d="M60 18 L62 14 L64 18 L68 20 L64 22 L62 26 L60 22 L56 20 Z" fill={V3} opacity="0.85" />
        <circle cx="64" cy="36" r="1.5" fill={V3} opacity="0.65" />
        <path d="M56 58 L57 55 L58 58 L61 59 L58 60 L57 63 L56 60 L53 59 Z" fill={V3} opacity="0.55" />
      </svg>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 19 * size, letterSpacing: "-0.02em" }}>
        <span style={{ color: light ? "#1A1330" : "#F5F3FF" }}>Sell</span>
        <span style={{ color: V1 }}>Scribe</span>
      </span>
    </div>
  );
}

function PlatIcon({ id, size = 22 }) {
  const C = PLATFORM_ICONS[id];
  return C ? <C size={size} /> : null;
}

function DemoCard() {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 4), 2600); return () => clearInterval(t); }, []);
  const demos = [
    { id: "amazon",      color: "#FF9900", label: "AMAZON · BULLET POINTS · EN",       title: "Eco-Friendly Bamboo Wireless Charger — 15W",             body: "• Premium bamboo with anti-slip base\n• Qi-certified 15W — iPhone, Samsung, AirPods\n• Eco-packaged, plastic-free" },
    { id: "etsy",        color: "#F1641E", label: "ETSY · STORYTELLING · EN",           title: "Handcrafted Bamboo Wireless Charger",                    body: "Every piece celebrates the natural grain of sustainably sourced bamboo. For the eco-conscious desk dweller who believes beautiful objects should do good..." },
    { id: "wildberries", color: "#CB11AB", label: "WILDBERRIES · БУЛЛЕТЫ · 🇷🇺",       title: "Беспроводная зарядка из бамбука 15W",                    body: "• Материал: натуральный бамбук\n• Мощность: 15W Qi · iPhone и Samsung\n• Противоскользящее основание" },
  ];
  return (
    <div style={{ background: CARD, borderRadius: 20, padding: 28, border: `1px solid ${V1}12`, width: "100%", maxWidth: 440, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${V2}, ${V1}, ${V3})` }} />
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: "#6D628F", marginBottom: 6, fontWeight: 600, letterSpacing: "0.08em" }}>PRODUCT</div>
        <div style={{ padding: "10px 14px", borderRadius: 10, background: `${V1}08`, border: `1px solid ${V1}15`, color: "#D6D3E8", fontSize: 14 }}>
          Bamboo Wireless Charging Pad
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {demos.map((d, i) => (
          <div key={d.id} style={{ padding: "5px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: step === i + 1 ? `${d.color}18` : `${V1}08`, color: step === i + 1 ? d.color : "#6D628F", border: step === i + 1 ? `1px solid ${d.color}30` : `1px solid transparent`, transition: "all 0.4s" }}>
            {d.id === "wildberries" ? "WB" : d.id.charAt(0).toUpperCase() + d.id.slice(1)}
          </div>
        ))}
      </div>
      <div style={{ minHeight: 110 }}>
        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[85, 70, 55, 40].map((w, i) => (
              <div key={i} style={{ height: 10, width: `${w}%`, borderRadius: 5, background: `${V1}12`, animation: `pulse 1.5s ease-in-out ${i * 0.15}s infinite` }} />
            ))}
            <div style={{ color: "#6D628F", fontSize: 12, marginTop: 4 }}>✦ Generating...</div>
          </div>
        )}
        {demos.map((d, i) => step === i + 1 && (
          <div key={d.id} style={{ fontSize: 13, color: "#C4C0DA", lineHeight: 1.65, animation: "textReveal 0.5s ease-out" }}>
            <div style={{ fontWeight: 700, color: d.color, marginBottom: 5, fontSize: 11, letterSpacing: "0.08em" }}>{d.label}</div>
            <div style={{ fontWeight: 600, color: "#E8E5F5", marginBottom: 5 }}>{d.title}</div>
            <div style={{ opacity: 0.72, fontSize: 12, whiteSpace: "pre-line" }}>{d.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlatformRulesSection({ lang }) {
  const [active, setActive] = useState("amazon");
  const p = PLATFORM_RULES.find(r => r.id === active);
  const t = STRINGS[lang];
  return (
    <section style={{ background: LT, padding: "80px 24px" }} id="platforms">
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <AnimDiv style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ color: V2, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 14 }}>{t.whyTag}</div>
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 800, color: "#1A1330", letterSpacing: "-0.03em", fontFamily: "var(--font-display)", marginBottom: 14 }}>
            {t.whyTitle}
          </h2>
          <p style={{ color: "#6B647A", fontSize: 16, maxWidth: 520, margin: "0 auto", lineHeight: 1.68 }}>{t.whySub}</p>
        </AnimDiv>
        <AnimDiv delay={0.1}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 28 }}>
            {PLATFORM_RULES.map(r => (
              <button key={r.id} onClick={() => setActive(r.id)} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "7px 16px", borderRadius: 100, border: "none", cursor: "pointer",
                fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14,
                background: active === r.id ? r.color : "rgba(0,0,0,0.05)",
                color: active === r.id ? "#fff" : "#6B647A",
                transition: "all 0.22s",
                boxShadow: active === r.id ? `0 2px 16px ${r.color}35` : "none",
              }}>
                <PlatIcon id={r.id} size={18} /> {r.name}
              </button>
            ))}
          </div>
          <div key={active} style={{
            background: "#fff", borderRadius: 20, overflow: "hidden",
            border: `1px solid ${p.color}18`,
            boxShadow: `0 4px 40px ${p.color}08`,
            display: "grid", gridTemplateColumns: "1fr 1fr",
            animation: "textReveal 0.3s ease-out",
          }}>
            <div style={{ padding: 36, borderRight: "1px solid rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
                <PlatIcon id={p.id} size={36} />
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: p.color }}>{p.name}</span>
              </div>
              {(["format", "lang", "limit", "tone"]).map(k => (
                <div key={k} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#B0AACC", minWidth: 62, paddingTop: 2, textTransform: "uppercase" }}>{t.ruleLabels[k]}</span>
                  <span style={{ fontSize: 13, color: "#2A2340", fontWeight: 500, lineHeight: 1.45 }}>{p[k][lang]}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: 36, background: `${p.color}03` }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#B0AACC", marginBottom: 14, textTransform: "uppercase" }}>{t.sampleLabel}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#3A3350", lineHeight: 1.72, whiteSpace: "pre-line", padding: "16px 18px", background: "#fff", borderRadius: 12, border: `1px solid ${p.color}15` }}>
                {p.sample}
              </div>
              <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6, color: "#B0AACC", fontSize: 12 }}>
                <span style={{ color: p.color }}>✓</span>
                <span>{t.sampleReady}</span>
              </div>
            </div>
          </div>
        </AnimDiv>
      </div>
    </section>
  );
}

function BeforeAfterSection({ lang }) {
  const t = STRINGS[lang];
  return (
    <section style={{ background: "#0D0B1A", padding: "80px 24px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <AnimDiv style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ color: V3, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 14 }}>{t.mathTag}</div>
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 800, color: "#F5F3FF", letterSpacing: "-0.03em", fontFamily: "var(--font-display)" }}>
            {t.mathTitle}
          </h2>
        </AnimDiv>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 0, alignItems: "start" }}>
          <AnimDiv direction="left" style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.1)", borderRadius: 20, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(239,68,68,0.08)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#EF4444", fontSize: 11 }}>●</span>
              <span style={{ color: "#F87171", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>{t.manualLabel}</span>
            </div>
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 8 }}>
              {t.manualItems.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.07)" }}>
                  <PlatIcon id={PLATFORMS.find(p => p.name === item.plat || p.id === item.plat.toLowerCase())?.id || item.plat.toLowerCase()} size={24} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: item.color }}>{item.plat}</div>
                    <div style={{ fontSize: 11, color: "#6D628F", marginTop: 1 }}>{item.note}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#F87171", flexShrink: 0 }}>{item.time}</div>
                </div>
              ))}
              <div style={{ marginTop: 6, padding: "13px 16px", borderRadius: 10, background: "rgba(239,68,68,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#F87171", fontSize: 13, fontWeight: 600 }}>{t.totalManual}</span>
                <span style={{ color: "#FCA5A5", fontSize: 20, fontWeight: 900, fontFamily: "var(--font-display)" }}>{t.totalManualVal}</span>
              </div>
            </div>
          </AnimDiv>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 18px", paddingTop: 72, gap: 8 }}>
            <div style={{ width: 1, height: 36, background: `linear-gradient(to bottom, transparent, ${V1}30)` }} />
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: `linear-gradient(135deg, ${V1}, ${V2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "var(--font-display)", boxShadow: `0 0 24px ${V1}40` }}>vs</div>
            <div style={{ width: 1, height: 36, background: `linear-gradient(to bottom, ${V1}30, transparent)` }} />
          </div>

          <AnimDiv direction="right" style={{ background: `${V1}05`, border: `1px solid ${V1}12`, borderRadius: 20, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: `1px solid ${V1}0A`, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: V3, fontSize: 11 }}>✦</span>
              <span style={{ color: V3, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>{t.ssLabel}</span>
            </div>
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 8 }}>
              {t.ssSteps.map((s, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", borderRadius: 10, background: `${V1}06`, border: `1px solid ${V1}0A` }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: `${V1}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: V3, flexShrink: 0 }}>0{idx + 1}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#E8E5F5" }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: "#6D628F", marginTop: 1 }}>{s.sub}</div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 4, padding: "13px 16px", borderRadius: 10, background: `${V1}08`, border: `1px solid ${V1}12` }}>
                <div style={{ fontSize: 10, color: V3, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>{t.outputLabel}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {PLATFORMS.map(p => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 6, background: `${p.color}14`, border: `1px solid ${p.color}25`, fontSize: 11, fontWeight: 600, color: p.color }}>
                      <PlatIcon id={p.id} size={14} /> {p.name}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 6, padding: "13px 16px", borderRadius: 10, background: `${V1}0A`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: V3, fontSize: 13, fontWeight: 600 }}>{t.totalSS}</span>
                <span style={{ color: "#C4B5FD", fontSize: 20, fontWeight: 900, fontFamily: "var(--font-display)" }}>{t.totalSSVal}</span>
              </div>
            </div>
          </AnimDiv>
        </div>

        <AnimDiv delay={0.2} style={{ textAlign: "center", marginTop: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "11px 24px", borderRadius: 100, background: `${V1}08`, border: `1px solid ${V1}14` }}>
            <span style={{ color: V3, fontSize: 13 }}>⚡</span>
            <span style={{ color: "#C4C0DA", fontSize: 14, fontWeight: 500 }}>
              {t.savingsLine[0]} <strong style={{ color: "#F87171" }}>{t.savingsLine[1]}</strong>&nbsp;→&nbsp;{t.savingsLine[2]} <strong style={{ color: V3 }}>{t.savingsLine[3]}</strong>
            </span>
          </div>
        </AnimDiv>
      </div>
    </section>
  );
}

export default function Landing() {
  const [navSolid, setNavSolid] = useState(false);
  const [lang, setLang] = useState("en");
  const t = STRINGS[lang];

  useEffect(() => {
    const h = () => setNavSolid(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div style={{ background: DK, fontFamily: "var(--font-body)", color: "#E8E5F5", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800;12..96,900&family=DM+Sans:wght@300;400;500;700&display=swap');
        :root { --font-display:'Bricolage Grotesque',sans-serif; --font-body:'DM Sans',sans-serif; }
        * { margin:0; padding:0; box-sizing:border-box; }
        @keyframes heroReveal { from{opacity:0;transform:translateY(36px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);} }
        @keyframes gradientText { 0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;} }
        @keyframes pulse { 0%,100%{opacity:0.15;}50%{opacity:0.35;} }
        @keyframes textReveal { from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);} }
        @keyframes sparkleRotate { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
        @keyframes orbFloat { 0%,100%{transform:translate(0,0);}40%{transform:translate(24px,-16px);}70%{transform:translate(-16px,12px);} }
        html, body { margin:0; padding:0; width:100%; overflow-x:hidden; scroll-behavior:smooth; }
        body { background:#0A0814; }
        #root { width:100%; }
        button { cursor:pointer; transition: transform 0.18s, box-shadow 0.18s; }
        button:hover { transform: translateY(-2px); }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 36px",
        background: navSolid ? `${DK}EC` : "transparent",
        backdropFilter: navSolid ? "blur(20px)" : "none",
        borderBottom: `1px solid ${navSolid ? V1 + "12" : "transparent"}`,
        transition: "all 0.4s",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", height: 64, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Logo />
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <a href="#platforms" style={{ color: "#9B96B8", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>{t.navPlatforms}</a>
            <a href="#features"  style={{ color: "#9B96B8", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>{t.navFeatures}</a>
            <a href="#pricing"   style={{ color: "#9B96B8", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>{t.navPricing}</a>
            <div style={{ display: "flex", background: `${V1}0A`, border: `1px solid ${V1}18`, borderRadius: 8, overflow: "hidden" }}>
              {["en", "ru"].map(l => (
                <button key={l} onClick={() => setLang(l)} style={{
                  padding: "5px 12px", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12,
                  background: lang === l ? `${V1}25` : "transparent",
                  color: lang === l ? V3 : "#6D628F",
                  letterSpacing: "0.04em", transition: "all 0.2s",
                }}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button style={{ padding: "9px 22px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${V1}, ${V2})`, color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "var(--font-body)", boxShadow: `0 2px 16px ${V1}30` }}>
              {t.navTry}
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: "100px 24px 60px" }}>
        <div style={{ position: "absolute", top: "15%", left: "10%", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${V2}12 0%, transparent 70%)`, animation: "orbFloat 12s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "8%", width: 250, height: 250, borderRadius: "50%", background: `radial-gradient(circle, ${V1}0A 0%, transparent 70%)`, animation: "orbFloat 10s ease-in-out 3s infinite", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1100, width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 60, flexWrap: "wrap", position: "relative", zIndex: 2 }}>
          <div style={{ flex: "1 1 480px", animation: "heroReveal 1s cubic-bezier(0.16,1,0.3,1)" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 100, background: `${V1}10`, border: `1px solid ${V1}18`, marginBottom: 28 }}>
              <span style={{ color: V3, fontSize: 14, animation: "sparkleRotate 4s linear infinite" }}>✦</span>
              <span style={{ color: V3, fontSize: 13, fontWeight: 600 }}>{t.badge}</span>
            </div>
            <h1 style={{ fontSize: "clamp(40px, 5vw, 64px)", fontWeight: 900, lineHeight: 1.06, color: "#F5F3FF", marginBottom: 22, letterSpacing: "-0.04em", fontFamily: "var(--font-display)" }}>
              {t.h1a}<br />
              <span style={{ background: `linear-gradient(135deg, ${V3} 0%, ${V1} 40%, ${V3} 100%)`, backgroundSize: "200% auto", animation: "gradientText 4s ease infinite", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {t.h1b}
              </span>
            </h1>
            <p style={{ fontSize: 18, color: "#9B96B8", lineHeight: 1.7, maxWidth: 480, marginBottom: 36 }}>{t.sub}</p>
            <button style={{ padding: "15px 40px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${V1}, ${V2})`, color: "#fff", fontWeight: 700, fontSize: 16, fontFamily: "var(--font-body)", boxShadow: `0 4px 32px ${V1}30, 0 0 0 1px ${V1}40` }}>
              {t.cta}
            </button>
          </div>
          <div style={{ flex: "1 1 400px", display: "flex", justifyContent: "center", animation: "heroReveal 1s cubic-bezier(0.16,1,0.3,1) 0.2s both" }}>
            <DemoCard />
          </div>
        </div>
      </section>

      {/* ── Platform logos bar (fix #2: static, readable) ── */}
      <section style={{ padding: "0 24px 60px", background: DK }}>
        <AnimDiv style={{ display: "flex", justifyContent: "center", gap: 36, flexWrap: "wrap" }}>
          {PLATFORMS.map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <PlatIcon id={p.id} size={20} />
              <span style={{ color: "#8A84A8", fontSize: 14, fontWeight: 600 }}>{p.name}</span>
            </div>
          ))}
        </AnimDiv>
      </section>

      {/* ═══ PLATFORM RULES (light) ═══ */}
      <PlatformRulesSection lang={lang} />

      {/* ═══ BEFORE / AFTER (dark) ═══ */}
      <BeforeAfterSection lang={lang} />

      {/* ═══ HOW IT WORKS (light) ═══ */}
      <section id="features" style={{ padding: "80px 24px", background: LT }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <AnimDiv style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ color: V2, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 12 }}>{t.howTag}</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: "#1A1330", letterSpacing: "-0.03em", fontFamily: "var(--font-display)" }}>
              {t.howTitle}
            </h2>
          </AnimDiv>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {t.steps.map((s, i) => (
              <AnimDiv key={s.n} delay={i * 0.15} style={{
                padding: 36, borderRadius: 20,
                background: "#fff",
                border: `1px solid rgba(139,92,246,0.1)`,
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: 8, right: -4, fontSize: 90, fontWeight: 900, fontFamily: "var(--font-display)", color: "#EDE9FE", opacity: 1, lineHeight: 1, userSelect: "none" }}>{s.n}</div>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${V1}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: V1, marginBottom: 20, border: `1px solid ${V1}18` }}>
                  {s.icon}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#1A1330", marginBottom: 10, fontFamily: "var(--font-display)" }}>{s.t}</h3>
                <p style={{ color: "#6B647A", fontSize: 15, lineHeight: 1.65 }}>{s.d}</p>
              </AnimDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES (dark) ═══ */}
      <section style={{ padding: "80px 24px", background: DK }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <AnimDiv style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ color: V3, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 12 }}>{t.whySSTag}</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: "#F5F3FF", letterSpacing: "-0.03em", fontFamily: "var(--font-display)" }}>{t.whySSTitle}</h2>
          </AnimDiv>
          {t.features.map((f, i) => (
            <AnimDiv key={i} delay={i * 0.1} style={{
              display: "flex", gap: 24, padding: 28, borderRadius: 20, marginBottom: 14,
              background: `linear-gradient(135deg, ${f.accent}06, transparent)`,
              border: `1px solid ${f.accent}14`, alignItems: "flex-start",
            }}>
              {/* fix #5: stronger icon bg so it stands out on dark */}
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `${f.accent}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0, border: `1px solid ${f.accent}30` }}>
                {f.icon}
              </div>
              <div>
                <h4 style={{ fontSize: 18, fontWeight: 700, color: "#F5F3FF", marginBottom: 6, fontFamily: "var(--font-display)" }}>{f.t}</h4>
                <p style={{ color: "#9B96B8", fontSize: 15, lineHeight: 1.65 }}>{f.d}</p>
              </div>
            </AnimDiv>
          ))}
        </div>
      </section>

      {/* ═══ PRICING (dark) ═══ */}
      <section id="pricing" style={{ padding: "80px 24px", background: "#0D0B1A" }}>
        <div style={{ maxWidth: 1020, margin: "0 auto" }}>
          <AnimDiv style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ color: V3, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 12 }}>{t.priceTag}</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: "#F5F3FF", letterSpacing: "-0.03em", fontFamily: "var(--font-display)", marginBottom: 10 }}>{t.priceTitle}</h2>
            <p style={{ color: "#6D628F", fontSize: 16 }}>{t.priceSub}</p>
          </AnimDiv>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {t.plans.map((pl, i) => (
              <AnimDiv key={i} delay={i * 0.1} direction="up" style={{
                background: pl.hl ? `linear-gradient(180deg, ${V1}0D, ${V1}04)` : `${V1}04`,
                borderRadius: 22, padding: 28,
                border: pl.hl ? `2px solid ${V1}28` : `1px solid ${V1}0A`,
                position: "relative",
              }}>
                {pl.hl && <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(135deg, ${V1}, ${V2})`, padding: "4px 16px", borderRadius: 100, fontSize: 11, fontWeight: 700, color: "#fff" }}>POPULAR</div>}
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#F5F3FF", marginBottom: 3, fontFamily: "var(--font-display)" }}>{pl.name}</h3>
                <p style={{ color: "#6D628F", fontSize: 13, marginBottom: 16 }}>{pl.desc}</p>
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: pl.hl ? V3 : "#F5F3FF", fontFamily: "var(--font-display)" }}>{pl.price}</span>
                  <span style={{ color: "#6D628F", fontSize: 14 }}>{pl.period}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  {pl.features.map((f, fi) => (
                    <div key={fi} style={{ display: "flex", gap: 8 }}>
                      <span style={{ color: V3, fontSize: 13 }}>✓</span>
                      <span style={{ color: "#C4C0DA", fontSize: 13 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button style={{
                  width: "100%", padding: "11px 0", borderRadius: 12,
                  border: pl.hl ? "none" : `1px solid ${V1}28`,
                  background: pl.hl ? `linear-gradient(135deg, ${V1}, ${V2})` : "transparent",
                  color: pl.hl ? "#fff" : "#A098C8",
                  fontWeight: 700, fontSize: 14, fontFamily: "var(--font-body)",
                }}>
                  {pl.cta}
                </button>
              </AnimDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA (light) ═══ */}
      <section style={{ padding: "80px 24px", background: LT }}>
        <AnimDiv style={{
          maxWidth: 700, margin: "0 auto", textAlign: "center", padding: "64px 40px", borderRadius: 28,
          background: "#fff", border: `1px solid ${V1}14`,
          position: "relative", overflow: "hidden", boxShadow: `0 8px 60px ${V1}0A`,
        }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: `radial-gradient(circle, ${V1}08, transparent)`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${V2}06, transparent)`, pointerEvents: "none" }} />
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 800, color: "#1A1330", marginBottom: 16, fontFamily: "var(--font-display)", letterSpacing: "-0.03em", position: "relative" }}>
            {t.ctaTitle}
          </h2>
          <p style={{ color: "#6B647A", fontSize: 16, lineHeight: 1.65, marginBottom: 32, maxWidth: 460, margin: "0 auto 32px", position: "relative" }}>
            {t.ctaSub}
          </p>
          <button style={{ padding: "16px 44px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${V1}, ${V2})`, color: "#fff", fontWeight: 700, fontSize: 16, fontFamily: "var(--font-body)", boxShadow: `0 4px 32px ${V1}30`, position: "relative" }}>
            {t.ctaBtn}
          </button>
        </AnimDiv>
      </section>

      {/* ═══ FOOTER (fix #6) ═══ */}
      <footer style={{ padding: "32px 24px", background: LT, borderTop: `1px solid ${V1}12` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <Logo size={0.85} light />
          <p style={{ color: "#7A74A0", fontSize: 13, fontWeight: 500 }}>{t.footerNote}</p>
        </div>
      </footer>
    </div>
  );
}
