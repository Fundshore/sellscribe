import { useState, useRef, useEffect } from "react";
import { useLang } from "./useLang";
import { useNavigate } from "react-router-dom";

const V1 = "#8B5CF6";
const V2 = "#7C3AED";
const V3 = "#A78BFA";
const DK = "#0A0814";
const CARD = "#110E1D";
const LT = "#F7F5FF";

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
    id: "shopify", name: "Shopify", color: "#96BF48",
    format: { en: "2–3 SEO paragraphs", ru: "2–3 SEO-параграфа" },
    lang: { en: "English", ru: "Английский" },
    limit: { en: "60 char title · ~250 words body", ru: "60 зн. заголовок · ~250 слов текст" },
    tone: { en: "Conversational, Google-optimised", ru: "Разговорный, SEO под Google" },
    sample: "Charge smarter, not harder. This 15W Qi wireless charger combines sustainability with cutting-edge power delivery — perfect for eco-conscious professionals.",
  },
  {
    id: "etsy", name: "Etsy", color: "#F1641E",
    format: { en: "Story + 13 tags", ru: "История + 13 тегов" },
    lang: { en: "English", ru: "Английский" },
    limit: { en: "140 char title", ru: "140 зн. заголовок" },
    tone: { en: "Warm, artisan, personal", ru: "Тёплый, авторский, личный" },
    sample: "Every grain of bamboo tells a story of slow growth and natural elegance. Handcrafted for the mindful desk dweller who believes beautiful objects should also do good.",
  },
  {
    id: "ebay", name: "eBay", color: "#E53238",
    format: { en: "Spec table + description", ru: "Таблица хар-к + описание" },
    lang: { en: "English", ru: "Английский" },
    limit: { en: "80 char title", ru: "80 зн. заголовок" },
    tone: { en: "Factual, condition-focused", ru: "Фактический, акцент на состоянии" },
    sample: "Condition: New. Charging: 15W Qi wireless. Material: Natural bamboo. Compatible: iPhone 15/14, Samsung S24/S23, AirPods Pro.",
  },
  {
    id: "wildberries", name: "Wildberries", color: "#CB11AB",
    format: { en: "4–5 Russian bullets", ru: "4–5 буллетов на русском" },
    lang: { en: "Russian (native)", ru: "Русский (нативный)" },
    limit: { en: "100 char title", ru: "100 зн. заголовок" },
    tone: { en: "Direct, feature-focused", ru: "Прямой, по характеристикам" },
    sample: "• Материал: натуральный бамбук\n• Мощность: 15W Qi · iPhone и Samsung\n• Противоскользящее основание\n• Экологичная упаковка",
  },
  {
    id: "kaspi", name: "Kaspi", color: "#E31E24",
    format: { en: "Description + spec table", ru: "Описание + таблица хар-к" },
    lang: { en: "Russian (native)", ru: "Русский (нативный)" },
    limit: { en: "60 char title", ru: "60 зн. заголовок" },
    tone: { en: "Technical, precise", ru: "Технический, конкретный" },
    sample: "Беспроводная зарядка бамбуковая 15W Qi. Тип: беспроводная. Мощность: 15W. Материал: бамбук. Цвет: натуральный. Размер: 100×100 мм.",
  },
];

const STRINGS = {
  en: {
    badge: "✦ AI-powered marketplace toolkit",
    h1a: "Create. Analyze.", h1b: "Dominate.",
    sub: "From your first listing to outselling the competition — SellScribe gives you the tools to build, understand, and win across 6 marketplaces.",
    cta: "Start for free →",
    navPlatforms: "Platforms", navFeatures: "Features", navPricing: "Pricing", navContact: "Contact us", navTry: "Try Free",

    cycleTag: "THE FULL CYCLE",
    cycleTitle: "Not just a generator. A complete system.",
    cycleSub: "Most tools stop at creating listings. SellScribe takes you from creation to market intelligence to continuous improvement — all in one place.",
    cycle: [
      {
        tab: "CREATE",
        color: V1,
        icon: "✦",
        title: "Generate listings that convert",
        desc: "Describe your product once. Get platform-perfect listings for Amazon, Shopify, Etsy, eBay, Wildberries and Kaspi — each tailored to its format, tone and audience. Single or bulk upload.",
        features: ["Single listing generation", "Bulk CSV/Excel upload", "6 platforms simultaneously", "Multiple tones", "Tech specs for Amazon & eBay", "Native Russian for WB & Kaspi"],
      },
      {
        tab: "ANALYZE",
        color: "#14B8A6",
        icon: "◉",
        title: "See exactly where you stand",
        desc: "Paste competitor URLs and get a side-by-side score. See their keyword strengths, what gaps exist between you and the leaders, and which customer complaints you can turn into your advantage.",
        features: ["You vs Competitors score /100", "Keyword gap analysis", "Missing keywords identified", "Competitor strengths mapped", "Review Intel from any platform", "Mix reviews from multiple sources"],
      },
      {
        tab: "IMPROVE",
        color: "#F59E0B",
        icon: "↑",
        title: "Close the gap. Pull ahead.",
        desc: "Based on your past analyses, SellScribe generates a full action plan — what to fix in your listing and how to make your product itself better than the competition. No generic advice. Specific, data-driven moves.",
        features: ["Improve listing based on gap analysis", "Improve product based on review intel", "Full recommendations unlocked", "Data-driven, specific actions", "Kill-or-keep honest assessment", "Available on Pro & above"],
      },
    ],

    whyTag: "WHY IT MATTERS",
    whyTitle: "Every platform speaks a different language",
    whySub: "Same product. Completely different rules — format, length, tone, even the actual language. SellScribe knows them all and applies them automatically.",
    sampleLabel: "Generated output sample",
    sampleReady: "Platform-optimised · Ready to paste",
    ruleLabels: { format: "Format", lang: "Language", limit: "Limits", tone: "Tone" },

    priceTag: "PRICING", priceTitle: "Simple, transparent pricing", priceSub: "Start free. Upgrade when you're ready.",
    priceFeatureHeaders: ["CREATE", "ANALYZE", "IMPROVE"],
    plans: [
      {
        name: "Free", price: "Free", period: "", desc: "Try it out", hl: false, cta: "Start Free",
        rows: [
          { label: "Create Single", val: "10 / mo" },
          { label: "Create Bulk", val: "—" },
          { label: "You vs Competitors", val: "2 / mo" },
          { label: "Review Intel", val: "—" },
          { label: "Improve", val: "—" },
          { label: "History", val: "✓" },
          { label: "Platforms", val: "All 6" },
        ],
      },
      {
        name: "Growth", price: "$9", period: "/mo", desc: "For active sellers", hl: true, cta: "Start Growing",
        rows: [
          { label: "Create Single", val: "100 / mo" },
          { label: "Create Bulk", val: "Up to 10 products" },
          { label: "You vs Competitors", val: "20 / mo" },
          { label: "Review Intel", val: "5 / mo" },
          { label: "Improve", val: "—" },
          { label: "History", val: "✓" },
          { label: "Platforms", val: "All 6" },
        ],
      },
      {
        name: "Pro", price: "$29", period: "/mo", desc: "Power sellers", hl: false, cta: "Go Pro",
        rows: [
          { label: "Create Single", val: "500 / mo" },
          { label: "Create Bulk", val: "Up to 50 products" },
          { label: "You vs Competitors", val: "100 / mo" },
          { label: "Review Intel", val: "50 / mo" },
          { label: "Improve", val: "20 / mo" },
          { label: "History", val: "✓" },
          { label: "Platforms", val: "All 6" },
        ],
      },
      {
        name: "Agency", price: "$79", period: "/mo", desc: "Teams & agencies", hl: false, cta: "Get Agency",
        rows: [
          { label: "Create Single", val: "1000 / mo" },
          { label: "Create Bulk", val: "Up to 200 products" },
          { label: "You vs Competitors", val: "500 / mo" },
          { label: "Review Intel", val: "200 / mo" },
          { label: "Improve", val: "100 / mo" },
          { label: "History", val: "✓" },
          { label: "Platforms", val: "All 6" },
        ],
      },
    ],

    faqTag: "FAQ",
    faqTitle: "Questions we get asked",
    faqs: [
      { q: "Which platforms does SellScribe support?", a: "Amazon, Shopify, Etsy, eBay, Wildberries and Kaspi — generate for any combination in one click. Need a different marketplace? Contact us and we'll make it happen." },
      { q: "Do I need to know SEO to use it?", a: "No. SellScribe handles keyword density, title length, format rules and tone for each platform automatically. Just describe your product." },
      { q: "Is the Russian for Wildberries and Kaspi actually good?", a: "Yes — it's written natively, not translated. We specifically trained prompts for CIS marketplace conventions. It's not Google Translate." },
      { q: "What's the difference between Analyze and Improve?", a: "Analyze shows you the gap — how your listing scores vs competitors and where they're stronger. Improve gives you the full action plan to close that gap, based on your real analysis data." },
      { q: "Can I upload multiple products at once?", a: "Yes. On Growth and above, you can upload a CSV, Excel, TXT or Word file with product names and features. SellScribe generates listings for all of them in sequence." },
      { q: "What is Review Intel?", a: "You paste competitor reviews (from any platform), and SellScribe extracts what customers love, what they complain about, and gives you concrete ideas to make your product better. Available on Growth and above." },
    ],

    ctaTitle: "Stop writing listings manually",
    ctaSub: "Create better listings, analyze the competition, improve your product — all in one place.",
    ctaBtn: "Start for free →",
    popularLabel: "POPULAR",
    footerNote: "© 2026 SellScribe. Create. Analyze. Dominate.",
  },

  ru: {
    badge: "✦ Инструментарий для маркетплейсов на базе ИИ",
    h1a: "Создай. Анализируй.", h1b: "Доминируй.",
    sub: "От первого листинга до победы над конкурентами — SellScribe даёт инструменты для создания, анализа и улучшения на 6 маркетплейсах.",
    cta: "Начать бесплатно →",
    navPlatforms: "Платформы", navFeatures: "Как работает", navPricing: "Тарифы", navContact: "Связаться", navTry: "Попробовать",

    cycleTag: "ПОЛНЫЙ ЦИКЛ",
    cycleTitle: "Не просто генератор. Полная система.",
    cycleSub: "Большинство инструментов останавливаются на создании листинга. SellScribe ведёт вас от создания к анализу рынка и постоянному улучшению — всё в одном месте.",
    cycle: [
      {
        tab: "СОЗДАТЬ",
        color: V1,
        icon: "✦",
        title: "Листинги которые продают",
        desc: "Опишите товар один раз. Получите идеальные листинги для Amazon, Shopify, Etsy, eBay, Wildberries и Kaspi — каждый под свой формат, тон и аудиторию. Одиночно или массово.",
        features: ["Одиночная генерация листинга", "Массовая загрузка CSV/Excel", "6 платформ одновременно", "Несколько тонов", "Тех. характеристики для Amazon и eBay", "Нативный русский для WB и Kaspi"],
      },
      {
        tab: "АНАЛИЗ",
        color: "#14B8A6",
        icon: "◉",
        title: "Увидьте где вы стоите",
        desc: "Вставьте ссылки на конкурентов и получите сравнение по баллам. Узнайте их ключевые слова, разрывы между вами и лидерами, и какие жалобы покупателей можно обратить в своё преимущество.",
        features: ["Оценка Вы vs Конкуренты /100", "Анализ пробелов в ключевых словах", "Найдены недостающие слова", "Сильные стороны конкурентов", "Анализ отзывов с любой платформы", "Смешивайте отзывы из разных источников"],
      },
      {
        tab: "УЛУЧШИТЬ",
        color: "#F59E0B",
        icon: "↑",
        title: "Закройте разрыв. Вырвитесь вперёд.",
        desc: "На основе ваших прошлых анализов SellScribe генерирует полный план действий — что исправить в листинге и как улучшить сам товар. Никаких общих советов. Конкретные шаги на основе данных.",
        features: ["Улучшение листинга по данным анализа", "Улучшение товара по отзывам", "Полные рекомендации разблокированы", "Конкретные шаги на основе данных", "Честная оценка убить или оставить", "Доступно на Pro и выше"],
      },
    ],

    whyTag: "ПОЧЕМУ ЭТО ВАЖНО",
    whyTitle: "Каждая платформа говорит на своём языке",
    whySub: "Один и тот же товар — совершенно разные правила: формат, длина, тон и даже язык. SellScribe знает их все и применяет автоматически.",
    sampleLabel: "Пример сгенерированного текста",
    sampleReady: "Оптимизировано под платформу · Готово к вставке",
    ruleLabels: { format: "Формат", lang: "Язык", limit: "Лимиты", tone: "Тон" },

    priceTag: "ТАРИФЫ", priceTitle: "Понятные тарифы", priceSub: "Начните бесплатно. Растите без ограничений.",
    priceFeatureHeaders: ["СОЗДАТЬ", "АНАЛИЗ", "УЛУЧШИТЬ"],
    plans: [
      {
        name: "Бесплатно", price: "Free", period: "", desc: "Попробуйте", hl: false, cta: "Начать",
        rows: [
          { label: "Создать (одиночный)", val: "10 / мес" },
          { label: "Создать (массово)", val: "—" },
          { label: "Вы vs Конкуренты", val: "2 / мес" },
          { label: "Анализ отзывов", val: "—" },
          { label: "Улучшить", val: "—" },
          { label: "История", val: "✓" },
          { label: "Платформы", val: "Все 6" },
        ],
      },
      {
        name: "Рост", price: "$9", period: "/мес", desc: "Для активных продавцов", hl: true, cta: "Начать рост",
        rows: [
          { label: "Создать (одиночный)", val: "100 / мес" },
          { label: "Создать (массово)", val: "До 10 товаров" },
          { label: "Вы vs Конкуренты", val: "20 / мес" },
          { label: "Анализ отзывов", val: "5 / мес" },
          { label: "Улучшить", val: "—" },
          { label: "История", val: "✓" },
          { label: "Платформы", val: "Все 6" },
        ],
      },
      {
        name: "Про", price: "$29", period: "/мес", desc: "Опытным продавцам", hl: false, cta: "Перейти на Про",
        rows: [
          { label: "Создать (одиночный)", val: "500 / мес" },
          { label: "Создать (массово)", val: "До 50 товаров" },
          { label: "Вы vs Конкуренты", val: "100 / мес" },
          { label: "Анализ отзывов", val: "50 / мес" },
          { label: "Улучшить", val: "20 / мес" },
          { label: "История", val: "✓" },
          { label: "Платформы", val: "Все 6" },
        ],
      },
      {
        name: "Агентство", price: "$79", period: "/мес", desc: "Командам", hl: false, cta: "Агентство",
        rows: [
          { label: "Создать (одиночный)", val: "1000 / мес" },
          { label: "Создать (массово)", val: "До 200 товаров" },
          { label: "Вы vs Конкуренты", val: "500 / мес" },
          { label: "Анализ отзывов", val: "200 / мес" },
          { label: "Улучшить", val: "100 / мес" },
          { label: "История", val: "✓" },
          { label: "Платформы", val: "Все 6" },
        ],
      },
    ],

    faqTag: "ВОПРОСЫ",
    faqTitle: "Часто задаваемые вопросы",
    faqs: [
      { q: "Какие платформы поддерживает SellScribe?", a: "Amazon, Shopify, Etsy, eBay, Wildberries и Kaspi — любая комбинация одним кликом. Нужен другой маркетплейс? Напишите нам — добавим." },
      { q: "Нужно ли знать SEO чтобы пользоваться?", a: "Нет. SellScribe сам управляет плотностью ключевых слов, длиной заголовков, форматом и тоном для каждой платформы. Просто опишите товар." },
      { q: "Русский для Wildberries и Kaspi действительно хороший?", a: "Да — пишется нативно, не переводится. Промпты специально заточены под конвенции СНГ-маркетплейсов. Это не Google Переводчик." },
      { q: "В чём разница между Анализом и Улучшением?", a: "Анализ показывает разрыв — как ваш листинг оценивается по сравнению с конкурентами и где они сильнее. Улучшение даёт полный план действий как закрыть этот разрыв, на основе реальных данных анализа." },
      { q: "Можно загрузить несколько товаров сразу?", a: "Да. На тарифе Рост и выше можно загрузить CSV, Excel, TXT или Word файл с названиями и характеристиками. SellScribe генерирует листинги для всех последовательно." },
      { q: "Что такое Анализ отзывов?", a: "Вставляете отзывы конкурентов (с любой платформы), и SellScribe извлекает что покупатели любят, на что жалуются, и даёт идеи как сделать товар лучше. Доступно на тарифе Рост и выше." },
    ],

    ctaTitle: "Хватит писать листинги вручную",
    ctaSub: "Создавайте лучшие листинги, анализируйте конкурентов, улучшайте товар — всё в одном месте.",
    ctaBtn: "Начать бесплатно →",
    popularLabel: "ПОПУЛЯРНЫЙ",
    footerNote: "© 2026 SellScribe. Создай. Анализируй. Доминируй.",
  },
};

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
    { id: "amazon",      color: "#FF9900", label: "AMAZON · BULLET POINTS · EN",  title: "Eco-Friendly Bamboo Wireless Charger — 15W",  body: "• Premium bamboo with anti-slip base\n• Qi-certified 15W — iPhone, Samsung, AirPods\n• Eco-packaged, plastic-free" },
    { id: "etsy",        color: "#F1641E", label: "ETSY · STORYTELLING · EN",     title: "Handcrafted Bamboo Wireless Charger",          body: "Every piece celebrates the natural grain of sustainably sourced bamboo. For the eco-conscious desk dweller who believes beautiful objects should do good..." },
    { id: "wildberries", color: "#CB11AB", label: "WILDBERRIES · БУЛЛЕТЫ · 🇷🇺", title: "Беспроводная зарядка из бамбука 15W",          body: "• Материал: натуральный бамбук\n• Мощность: 15W Qi · iPhone и Samsung\n• Противоскользящее основание" },
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
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
          {p && (
            <div style={{ background: "#fff", borderRadius: 20, padding: 32, border: `1px solid ${p.color}18`, boxShadow: `0 4px 40px ${p.color}08` }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20, marginBottom: 28 }}>
                {Object.entries(t.ruleLabels).map(([k, label]) => (
                  <div key={k}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: p.color, letterSpacing: "0.1em", marginBottom: 6 }}>{label.toUpperCase()}</div>
                    <div style={{ fontSize: 14, color: "#2A2340", fontWeight: 500 }}>{p[k][lang]}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#F7F5FF", borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, color: "#9B96B8", fontWeight: 600, letterSpacing: "0.06em", marginBottom: 10 }}>{t.sampleLabel}</div>
                <pre style={{ fontSize: 13, color: "#2A2340", lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "var(--font-body)", margin: 0 }}>{p.sample}</pre>
                <div style={{ fontSize: 11, color: p.color, marginTop: 10, fontWeight: 600 }}>{t.sampleReady}</div>
              </div>
            </div>
          )}
        </AnimDiv>
      </div>
    </section>
  );
}

function FaqSection({ lang }) {
  const t = STRINGS[lang];
  const [open, setOpen] = useState(null);
  return (
    <section style={{ padding: "80px 24px", background: LT }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <AnimDiv style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ color: V2, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 14 }}>{t.faqTag}</div>
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 800, color: "#1A1330", letterSpacing: "-0.03em", fontFamily: "var(--font-display)" }}>
            {t.faqTitle}
          </h2>
        </AnimDiv>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {t.faqs.map((faq, i) => (
            <AnimDiv key={i} delay={i * 0.05}>
              <div
                onClick={() => setOpen(open === i ? null : i)}
                style={{ background: "#fff", borderRadius: 14, border: `1px solid ${open === i ? V1 + "30" : "rgba(139,92,246,0.08)"}`, overflow: "hidden", cursor: "pointer", transition: "border 0.2s" }}
              >
                <div style={{ padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#1A1330", lineHeight: 1.4 }}>{faq.q}</span>
                  <span style={{ color: V1, fontSize: 20, fontWeight: 700, flexShrink: 0, transition: "transform 0.2s", transform: open === i ? "rotate(45deg)" : "none" }}>+</span>
                </div>
                {open === i && (
                  <div style={{ padding: "0 22px 20px", fontSize: 15, color: "#2A2340", lineHeight: 1.75, fontWeight: 500 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            </AnimDiv>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const navigate = useNavigate();
  const [lang, setLang] = useLang();
  const t = STRINGS[lang];
  const [activeCycle, setActiveCycle] = useState(0);
  const cycleColors = [V1, "#14B8A6", "#F59E0B"];

  return (
    <div style={{ fontFamily: "var(--font-body)", background: DK, color: "#E8E5F5", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800;12..96,900&family=DM+Sans:wght@300;400;500;700&display=swap');
        :root { --font-display:'Bricolage Grotesque',sans-serif; --font-body:'DM Sans',sans-serif; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        @keyframes pulse { 0%,100%{opacity:0.18;} 50%{opacity:0.45;} }
        @keyframes textReveal { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:none;} }
        @keyframes starPulse { 0%,100%{opacity:0.7;transform:scale(1) rotate(0deg);} 50%{opacity:1;transform:scale(1.3) rotate(20deg);} }
        @keyframes float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
        button { cursor: pointer; font-family: var(--font-body); transition: transform 0.18s, opacity 0.18s; }
        button:hover { opacity: 0.88; transform: translateY(-1px); }
        .nav-link:hover { color: #F5F3FF !important; }
        .plat-tabs { display:flex; flex-wrap:wrap; gap:8px; }
        .pricing-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
        @media(max-width:900px){ .pricing-grid{grid-template-columns:repeat(2,1fr);} }
        @media(max-width:540px){ .pricing-grid{grid-template-columns:1fr;} .hero-btns{flex-direction:column;} }
      `}</style>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, padding: "0 32px", borderBottom: `1px solid ${V1}12`, background: `${DK}F0`, backdropFilter: "blur(20px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div onClick={() => navigate("/")} style={{ cursor: "pointer" }}><Logo /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <a href="#cycle"   className="nav-link" style={{ color: "#9B96B8", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>{t.navFeatures}</a>
            <a href="#platforms" className="nav-link" style={{ color: "#9B96B8", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>{t.navPlatforms}</a>
            <a href="#pricing" className="nav-link" style={{ color: "#9B96B8", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>{t.navPricing}</a>
            <a href="https://tally.so/r/NpYqMl" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ color: "#9B96B8", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>{t.navContact}</a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: `${V1}0A`, border: `1px solid ${V1}18`, borderRadius: 8, overflow: "hidden", display: "flex" }}>
              {["en", "ru"].map(l => (
                <button key={l} onClick={() => setLang(l)} style={{ padding: "5px 12px", border: "none", fontWeight: 700, fontSize: 12, background: lang === l ? `${V1}25` : "transparent", color: lang === l ? V3 : "#6D628F", letterSpacing: "0.04em", transition: "all 0.2s" }}>{l.toUpperCase()}</button>
              ))}
            </div>
            <button onClick={() => navigate("/auth")} style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${V1}, ${V2})`, color: "#fff", fontWeight: 700, fontSize: 14, boxShadow: `0 2px 16px ${V1}30` }}>
              {t.navTry}
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "100px 24px 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 700, height: 400, background: `radial-gradient(ellipse, ${V1}18 0%, transparent 70%)`, pointerEvents: "none" }} />
        <AnimDiv style={{ maxWidth: 820, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 18px", borderRadius: 100, background: `${V1}12`, border: `1px solid ${V1}25`, color: V3, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 28 }}>
            <span style={{ animation: "starPulse 2.4s ease-in-out infinite", display: "inline-block" }}>✦</span>
            <span>{lang === "ru" ? t.badge.replace("✦ ", "") : t.badge.replace("✦ ", "")}</span>
          </div>
          <h1 style={{ fontSize: "clamp(40px, 7vw, 80px)", fontWeight: 900, letterSpacing: "-0.04em", fontFamily: "var(--font-display)", lineHeight: 1.05, marginBottom: 24 }}>
            <span style={{ color: "#F5F3FF" }}>{t.h1a}</span>{" "}
            <span style={{ background: `linear-gradient(135deg, ${V1}, ${V3})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{t.h1b}</span>
          </h1>
          <p style={{ fontSize: "clamp(16px, 2vw, 20px)", color: "#9B96B8", lineHeight: 1.65, maxWidth: 620, margin: "0 auto 40px" }}>
            {t.sub}
          </p>
          <div className="hero-btns" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/auth")} style={{ padding: "16px 40px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${V1}, ${V2})`, color: "#fff", fontWeight: 700, fontSize: 16, boxShadow: `0 4px 32px ${V1}35` }}>
  {t.cta}
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28, flexWrap: "wrap" }}>
            {PLATFORMS.map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, background: `${p.color}10`, border: `1px solid ${p.color}20`, fontSize: 12, fontWeight: 600, color: p.color }}>
                <PlatIcon id={p.id} size={14} /> {p.name}
              </div>
            ))}
          </div>
        </AnimDiv>

        {/* Demo Card */}
        <AnimDiv delay={0.2} style={{ display: "flex", justifyContent: "center", marginTop: 60 }}>
          <DemoCard />
        </AnimDiv>
      </section>

      {/* CYCLE SECTION */}
      <section id="cycle" style={{ padding: "80px 24px", background: "#0D0B1A" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <AnimDiv style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ color: V3, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 14 }}>{t.cycleTag}</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#F5F3FF", letterSpacing: "-0.03em", fontFamily: "var(--font-display)", marginBottom: 14 }}>
              {t.cycleTitle}
            </h2>
            <p style={{ color: "#6D628F", fontSize: 16, maxWidth: 560, margin: "0 auto", lineHeight: 1.65 }}>{t.cycleSub}</p>
          </AnimDiv>

          {/* Tab selector */}
          <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 40, background: `${V1}06`, borderRadius: 14, padding: 5, width: "fit-content", margin: "0 auto 40px" }}>
            {t.cycle.map((c, i) => (
              <button key={i} onClick={() => setActiveCycle(i)} style={{
                padding: "10px 24px", borderRadius: 10, border: "none",
                background: activeCycle === i ? `linear-gradient(135deg, ${cycleColors[i]}CC, ${cycleColors[i]})` : "transparent",
                color: activeCycle === i ? "#fff" : "#6D628F",
                fontWeight: 700, fontSize: 13, letterSpacing: "0.04em",
                boxShadow: activeCycle === i ? `0 2px 16px ${cycleColors[i]}40` : "none",
                transition: "all 0.2s",
              }}>
                {c.tab}
              </button>
            ))}
          </div>

          {/* Active cycle content */}
          {t.cycle.map((c, i) => activeCycle === i && (
            <AnimDiv key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: 16, background: `${c.color}18`, border: `1px solid ${c.color}30`, fontSize: 24, color: c.color, marginBottom: 20 }}>{c.icon}</div>
                <h3 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, color: "#F5F3FF", fontFamily: "var(--font-display)", letterSpacing: "-0.02em", marginBottom: 14 }}>{c.title}</h3>
                <p style={{ color: "#9B96B8", fontSize: 16, lineHeight: 1.7, marginBottom: 28 }}>{c.desc}</p>
                <button onClick={() => navigate("/auth")} style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${c.color}, ${c.color}CC)`, color: "#fff", fontWeight: 700, fontSize: 14 }}>
                  {t.cta}
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {c.features.map((f, fi) => (
                  <div key={fi} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 16px", borderRadius: 10, background: `${c.color}06`, border: `1px solid ${c.color}14` }}>
                    <span style={{ color: c.color, fontWeight: 700, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span style={{ color: "#C4C0DA", fontSize: 14 }}>{f}</span>
                  </div>
                ))}
              </div>
            </AnimDiv>
          ))}

          {/* Cycle flow indicator */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 56 }}>
            {t.cycle.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 100, background: `${cycleColors[i]}12`, border: `1px solid ${cycleColors[i]}25`, cursor: "pointer" }} onClick={() => setActiveCycle(i)}>
                  <span style={{ fontSize: 14, color: cycleColors[i] }}>{c.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: cycleColors[i], letterSpacing: "0.04em" }}>{c.tab}</span>
                </div>
                {i < t.cycle.length - 1 && <span style={{ color: "#3D3960", fontSize: 18 }}>→</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLATFORM RULES */}
      <PlatformRulesSection lang={lang} />

      {/* PRICING */}
      <section id="pricing" style={{ padding: "80px 24px", background: "#0D0B1A" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <AnimDiv style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ color: V3, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 12 }}>{t.priceTag}</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: "#F5F3FF", letterSpacing: "-0.03em", fontFamily: "var(--font-display)", marginBottom: 10 }}>{t.priceTitle}</h2>
            <p style={{ color: "#6D628F", fontSize: 16 }}>{t.priceSub}</p>
          </AnimDiv>
          <div className="pricing-grid">
            {t.plans.map((pl, i) => (
              <AnimDiv key={i} delay={i * 0.1} style={{
                background: pl.hl ? `linear-gradient(180deg, ${V1}0D, ${V1}04)` : `${V1}04`,
                borderRadius: 22, padding: 24,
                border: pl.hl ? `2px solid ${V1}28` : `1px solid ${V1}0A`,
                position: "relative",
              }}>
                {pl.hl && <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(135deg, ${V1}, ${V2})`, padding: "4px 16px", borderRadius: 100, fontSize: 11, fontWeight: 700, color: "#fff" }}>{t.popularLabel}</div>}
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#F5F3FF", marginBottom: 3, fontFamily: "var(--font-display)" }}>{pl.name}</h3>
                <p style={{ color: "#6D628F", fontSize: 13, marginBottom: 14 }}>{pl.desc}</p>
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: pl.hl ? V3 : "#F5F3FF", fontFamily: "var(--font-display)" }}>{pl.price}</span>
                  <span style={{ color: "#6D628F", fontSize: 14 }}>{pl.period}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
                  {pl.rows.map((row, ri) => {
                    const isLocked = row.val === "—";
                    return (
                      <div key={ri} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: ri < pl.rows.length - 1 ? `1px solid ${V1}08` : "none" }}>
                        <span style={{ color: isLocked ? "#3D3960" : "#8B87A8", fontSize: 12 }}>{row.label}</span>
                        <span style={{ color: isLocked ? "#3D3960" : row.val === "✓" ? "#22C55E" : V3, fontSize: 12, fontWeight: 600 }}>{row.val}</span>
                      </div>
                    );
                  })}
                </div>
                <button onClick={() => navigate("/auth")} style={{
                  width: "100%", padding: "11px 0", borderRadius: 12,
                  border: pl.hl ? "none" : `1px solid ${V1}28`,
                  background: pl.hl ? `linear-gradient(135deg, ${V1}, ${V2})` : "transparent",
                  color: pl.hl ? "#fff" : "#A098C8",
                  fontWeight: 700, fontSize: 14,
                }}>
                  {pl.cta}
                </button>
              </AnimDiv>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FaqSection lang={lang} />

      {/* FINAL CTA */}
      <section style={{ padding: "80px 24px", background: DK }}>
        <AnimDiv style={{
          maxWidth: 700, margin: "0 auto", textAlign: "center", padding: "64px 40px", borderRadius: 28,
          background: `linear-gradient(135deg, ${V1}10, ${V2}06)`,
          border: `1px solid ${V1}20`,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: `radial-gradient(circle, ${V1}15, transparent)`, pointerEvents: "none" }} />
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 800, color: "#F5F3FF", marginBottom: 16, fontFamily: "var(--font-display)", letterSpacing: "-0.03em", position: "relative" }}>
            {t.ctaTitle}
          </h2>
          <p style={{ color: "#9B96B8", fontSize: 16, lineHeight: 1.65, marginBottom: 32, maxWidth: 460, margin: "0 auto 32px", position: "relative" }}>
            {t.ctaSub}
          </p>
          <button onClick={() => navigate("/auth")} style={{ padding: "16px 44px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${V1}, ${V2})`, color: "#fff", fontWeight: 700, fontSize: 16, boxShadow: `0 4px 32px ${V1}30`, position: "relative" }}>
            {t.ctaBtn}
          </button>
        </AnimDiv>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "32px 24px", background: DK, borderTop: `1px solid ${V1}12` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <Logo size={0.85} />
          <p style={{ color: "#7A74A0", fontSize: 13, fontWeight: 500 }}>{t.footerNote}</p>
        </div>
      </footer>
    </div>
  );
}
