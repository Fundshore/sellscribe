import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";
import { useLang } from "./useLang";
import * as XLSX from "xlsx";

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

const GEN_STRINGS = {
  en: {
    title: "Generate listing", sub: "Describe your product, pick platforms, get copy.",
    prodLabel: "Product name *", prodPlaceholder: "e.g. Bamboo Wireless Charging Pad",
    featLabel: "Key features", featOpt: "(optional)",
    featPlaceholder: "Material: bamboo\nCharging: 15W Qi\nCompatible: iPhone, Samsung\nColor: natural",
    platLabel: "Platforms", toneLabel: "Tone",
    tones: ["Professional", "Friendly", "Luxury", "Casual"],
    genBtn: "✦ Generate listings", genLoading: "✦ Generating...",
    emptyTitle: "Your listings will appear here",
    emptySub: "Fill in the product details on the left and click Generate",
    writingMsg: "✦ Writing your listings...",
    regenBtn: "↻ Regenerate",
    upgradeBtn: "Upgrade", logoutBtn: "Log out", contactBtn: "Contact us",
    left: "left", resetsOn: "Resets",
    errProduct: "Enter a product name", errPlatform: "Select at least one platform",
    errLimit: (limit, date) => `Monthly limit reached (${limit} generations). Resets on ${date}. Upgrade for more.`,
    platforms: "platforms generated",
    analyzeTab: "Analyze", createTab: "Create", improveTab: "Improve",
    compareSubTab: "You vs Competitors", reviewsSubTab: "Review Intel",
    improveListingSubTab: "Improve Listing", improveProductSubTab: "Improve Product",
    auditTitle: "You vs Competitors", auditSub: "",
    urlsLabel: "Competitor URLs", urlsPlaceholder: "https://www.amazon.com/dp/...\nhttps://www.etsy.com/listing/...\nhttps://www.wildberries.ru/...",
    urlsHint: "One URL per line · Max 5 links",
    myListingLabel: "My current listing", myListingOpt: "(optional)",
    myListingPlaceholder: "Paste your current product description here to get a score and comparison...",
    platformLabel: "Platform focus",
    auditBtn: "✦ Analyze listings", auditLoading: "✦ Analyzing...",
    auditEmptyTitle: "Analysis results will appear here",
    auditEmptySub: "Paste competitor URLs and click Analyze listings",
    scoreLabel: "Listing Score", vsCompetitors: "vs competitors",
    topKeywords: "Top keywords from competitors",
    missingKeywords: "Keywords you're missing",
    strengthsTitle: "What competitors do better",
    recommendationsTitle: "Recommendations",
    rewriteBtn: "✦ Rewrite with these insights",
    rewriteLoading: "✦ Rewriting...",
    analyzedPages: "pages analyzed",
    errUrls: "Paste at least one competitor URL",
    auditLimitReached: "Audit limit reached. Upgrade to continue.",
    reviewsTitle: "Analyze Competitor Reviews", reviewsSub: "Learn what customers love and hate about similar products — so you can build something better and stand out.",
    reviewsUrlLabel: "Wildberries product URL", reviewsUrlPlaceholder: "https://www.wildberries.ru/catalog/12345678/detail.aspx",
    reviewsUrlHint: "Auto-fetch reviews for Wildberries · Other platforms: paste manually below",
    reviewsTextLabel: "Paste competitor reviews", reviewsTextOpt: "",
    reviewsTextPlaceholder: "Paste all reviews here — positive and negative. Copy from Amazon, Wildberries, Kaspi, Etsy or any marketplace. Don't worry about messy formatting — our AI will figure it out.",
    reviewsProductLabel: "Your product name",
    reviewsBtn: "✦ Analyze reviews", reviewsLoading: "✦ Analyzing reviews...",
    reviewsEmptyTitle: "Review analysis will appear here",
    reviewsEmptySub: "Paste competitor reviews and click Analyze",
    reviewsFetchBtn: "Fetch WB reviews",
    reviewsFetching: "Fetching...",
    reviewsFetchErr: "Could not fetch reviews automatically. Please paste them manually.",
    positiveTitle: "What customers love ✅",
    negativeTitle: "What customers complain about ❌",
    opportunitiesTitle: "Your opportunities 💡",
    reviewsCountLabel: "reviews analyzed",
    reviewsLimitMsg: "Review Analysis is available on Pro plan and above.",
    reviewsLimitReached: "Review analysis limit reached. Upgrade to continue.",
    historyTab: "History",
    historyEmpty: "No history yet",
    historyEmptySub: "Your generations and analyses will appear here",
    historyDelete: "Delete",
    historyReuse: "Reuse",
    historyTypes: { generate: "Generate", bulk: "Bulk", gap: "Compare vs Competitors", reviews: "Review Intel" },
    improveListingTitle: "Improve Your Listing",
    improveListingSub: "Pick a past competitor analysis — we'll generate an improved listing based on the insights.",
    improveProductTitle: "Improve Your Product",
    improveProductSub: "Pick a past review analysis — we'll give you concrete ideas to make your product better than the competition.",
    pickAnalysis: "Pick an analysis to improve from",
    noHistoryMsg: "No past analyses found. Run a competitor comparison or review analysis first.",
    improveListingBtn: "✦ Generate improved listing",
    improveProductBtn: "✦ Generate improvement ideas",
    improving: "✦ Improving...",
    improvedListingTitle: "Improved Listing",
    improvedProductTitle: "Product Improvement Ideas",
    fromAnalysis: "Based on analysis from",
    bulkTab: "Bulk", singleTab: "Single",
    bulkTitle: "Bulk Generate", bulkSub: "Upload a file with multiple products — get listings for all at once.",
    bulkUploadLabel: "Upload file",
    bulkUploadHint: "CSV, Excel, TXT or Word · Columns: product, features (optional)",
    bulkUploadBtn: "Choose file",
    bulkDropHint: "or drag & drop here",
    bulkPreviewTitle: "Products found",
    bulkGenBtn: "✦ Generate all listings", bulkGenLoading: (n, total) => `✦ Generating ${n} of ${total}...`,
    bulkDownloadBtn: "⬇ Download results",
    bulkEmptyTitle: "Upload a file to start",
    bulkEmptySub: "Supported: CSV, Excel (.xlsx), TXT, Word (.docx)",
    bulkLimitMsg: (max) => `Your plan allows up to ${max} products per bulk job. Upgrade for more.`,
    bulkErrNoFile: "Please upload a file first",
    bulkErrNoProducts: "No products found in file. Make sure first column contains product names.",
    bulkErrLimit: (max) => `Free plan does not include Bulk Generate. Upgrade to Growth or higher.`,
    bulkProgress: (n, total) => `${n} / ${total} done`,
    bulkResultsTitle: "Bulk results",
  },
  ru: {
    title: "Создать листинг", sub: "Опишите товар, выберите платформы, получите текст.",
    prodLabel: "Название товара *", prodPlaceholder: "напр. Беспроводная зарядка из бамбука",
    featLabel: "Ключевые характеристики", featOpt: "(необязательно)",
    featPlaceholder: "Материал: бамбук\nЗарядка: 15W Qi\nСовместимость: iPhone, Samsung\nЦвет: натуральный",
    platLabel: "Платформы", toneLabel: "Тон",
    tones: ["Профессиональный", "Дружелюбный", "Премиум", "Непринуждённый"],
    genBtn: "✦ Создать листинги", genLoading: "✦ Генерация...",
    emptyTitle: "Здесь появятся ваши листинги",
    emptySub: "Заполните данные о товаре слева и нажмите «Создать»",
    writingMsg: "✦ Пишем ваши листинги...",
    regenBtn: "↻ Сгенерировать снова",
    upgradeBtn: "Улучшить план", logoutBtn: "Выйти", contactBtn: "Связаться",
    left: "осталось", resetsOn: "Сброс",
    errProduct: "Введите название товара", errPlatform: "Выберите хотя бы одну платформу",
    errLimit: (limit, date) => `Месячный лимит исчерпан (${limit} генераций). Сброс: ${date}. Улучшите план.`,
    platforms: "платформ сгенерировано",
    analyzeTab: "Анализ", createTab: "Создать", improveTab: "Улучшить",
    compareSubTab: "Вы vs Конкуренты", reviewsSubTab: "Анализ отзывов",
    improveListingSubTab: "Улучшить листинг", improveProductSubTab: "Улучшить товар",
    auditTitle: "Вы vs Конкуренты", auditSub: "",
    urlsLabel: "Ссылки на конкурентов", urlsPlaceholder: "https://www.amazon.com/dp/...\nhttps://www.wildberries.ru/...\nhttps://kaspi.kz/...",
    urlsHint: "По одной ссылке на строку · Максимум 5",
    myListingLabel: "Моё текущее описание", myListingOpt: "(необязательно)",
    myListingPlaceholder: "Вставьте ваше текущее описание товара для получения оценки и сравнения...",
    platformLabel: "Платформа",
    auditBtn: "✦ Анализировать листинги", auditLoading: "✦ Анализируем...",
    auditEmptyTitle: "Результаты анализа появятся здесь",
    auditEmptySub: "Вставьте ссылки на конкурентов и нажмите «Анализировать листинги»",
    scoreLabel: "Оценка листинга", vsCompetitors: "vs конкуренты",
    topKeywords: "Топ ключевые слова конкурентов",
    missingKeywords: "Ключевые слова которых не хватает",
    strengthsTitle: "Что конкуренты делают лучше",
    recommendationsTitle: "Рекомендации",
    rewriteBtn: "✦ Переписать с учётом инсайтов",
    rewriteLoading: "✦ Переписываем...",
    analyzedPages: "страниц проанализировано",
    errUrls: "Вставьте хотя бы одну ссылку на конкурента",
    auditLimitReached: "Лимит анализов исчерпан. Улучшите план.",
    reviewsTitle: "Анализируй отзывы конкурентов", reviewsSub: "Узнайте что покупатели любят и ненавидят в похожих товарах — чтобы сделать лучше и выделиться.",
    reviewsUrlLabel: "Ссылка на товар Wildberries", reviewsUrlPlaceholder: "https://www.wildberries.ru/catalog/12345678/detail.aspx",
    reviewsUrlHint: "Авто-загрузка отзывов для Wildberries · Другие платформы: вставьте вручную",
    reviewsTextLabel: "Вставить отзывы конкурентов", reviewsTextOpt: "",
    reviewsTextPlaceholder: "Вставьте сюда все отзывы — позитивные и негативные. Скопируйте с Amazon, Wildberries, Kaspi, Etsy или любого маркетплейса. Не переживайте насчёт форматирования — наш ИИ разберётся.",
    reviewsProductLabel: "Название вашего товара",
    reviewsBtn: "✦ Анализировать отзывы", reviewsLoading: "✦ Анализируем отзывы...",
    reviewsEmptyTitle: "Результаты анализа появятся здесь",
    reviewsEmptySub: "Вставьте отзывы и нажмите «Анализировать»",
    reviewsFetchBtn: "Загрузить отзывы WB",
    reviewsFetching: "Загружаем...",
    reviewsFetchErr: "Не удалось загрузить отзывы автоматически. Вставьте вручную.",
    positiveTitle: "Что нравится покупателям ✅",
    negativeTitle: "На что жалуются ❌",
    opportunitiesTitle: "Ваши возможности 💡",
    reviewsCountLabel: "отзывов проанализировано",
    reviewsLimitMsg: "Анализ отзывов доступен на тарифе Pro и выше.",
    reviewsLimitReached: "Лимит анализов отзывов исчерпан. Улучшите план.",
    historyTab: "История",
    historyEmpty: "История пуста",
    historyEmptySub: "Здесь появятся ваши генерации и анализы",
    historyDelete: "Удалить",
    historyReuse: "Повторить",
    historyTypes: { generate: "Генерация", bulk: "Массово", gap: "Сравни с конкурентами", reviews: "Анализ отзывов" },
    improveListingTitle: "Улучши листинг",
    improveListingSub: "Выбери прошлый анализ конкурентов — сгенерируем улучшенный листинг на основе инсайтов.",
    improveProductTitle: "Улучши товар",
    improveProductSub: "Выбери прошлый анализ отзывов — дадим конкретные идеи как сделать товар лучше конкурентов.",
    pickAnalysis: "Выбери анализ для улучшения",
    noHistoryMsg: "Нет прошлых анализов. Сначала запусти сравнение с конкурентами или анализ отзывов.",
    improveListingBtn: "✦ Создать улучшенный листинг",
    improveProductBtn: "✦ Создать идеи по улучшению",
    improving: "✦ Улучшаем...",
    improvedListingTitle: "Улучшенный листинг",
    improvedProductTitle: "Идеи по улучшению товара",
    fromAnalysis: "На основе анализа от",
    bulkTab: "Массово", singleTab: "Одиночный",
    bulkTitle: "Массовая генерация", bulkSub: "Загрузите файл с товарами — получите листинги для всех сразу.",
    bulkUploadLabel: "Загрузить файл",
    bulkUploadHint: "CSV, Excel, TXT или Word · Колонки: product, features (необязательно)",
    bulkUploadBtn: "Выбрать файл",
    bulkDropHint: "или перетащите сюда",
    bulkPreviewTitle: "Найдено товаров",
    bulkGenBtn: "✦ Создать все листинги", bulkGenLoading: (n, total) => `✦ Генерация ${n} из ${total}...`,
    bulkDownloadBtn: "⬇ Скачать результаты",
    bulkEmptyTitle: "Загрузите файл для начала",
    bulkEmptySub: "Поддерживается: CSV, Excel (.xlsx), TXT, Word (.docx)",
    bulkLimitMsg: (max) => `Ваш план позволяет до ${max} товаров за раз. Улучшите план для большего.`,
    bulkErrNoFile: "Пожалуйста, загрузите файл",
    bulkErrNoProducts: "Товары не найдены. Убедитесь что первая колонка содержит названия товаров.",
    bulkErrLimit: (max) => `Бесплатный план не включает массовую генерацию. Улучшите план.`,
    bulkProgress: (n, total) => `${n} / ${total} готово`,
    bulkResultsTitle: "Результаты массовой генерации",
  },
};


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
  const [lang, setLang] = useLang();
  const T = GEN_STRINGS[lang];
  const [user, setUser] = useState(null);
  const [product, setProduct] = useState("");
  const [features, setFeatures] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState(["amazon", "wildberries", "kaspi"]);
  const [tones, setTones] = useState(["professional"]);
  const tone = tones[0]; // keep backward compat for API
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [activePlatform, setActivePlatform] = useState(null);
  const [count, setCount] = useState(0);
  const [limit, setLimit] = useState(10);
  const [resetDate, setResetDate] = useState(null);
  const [tab, setTab] = useState("analyze"); // "analyze" | "create" | "improve"
  const [analyzeSubTab, setAnalyzeSubTab] = useState("audit"); // "audit" | "reviews"
  const [improveSubTab, setImproveSubTab] = useState("listing"); // "listing" | "product"

  // Audit state
  const [auditUrls, setAuditUrls] = useState("");
  const [myListing, setMyListing] = useState("");
  const [auditPlatform, setAuditPlatform] = useState("amazon");
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [auditError, setAuditError] = useState("");
  const [auditCount, setAuditCount] = useState(0);
  const [rewriteLoading, setRewriteLoading] = useState(false);

  // History state
  const [historyTab, setHistoryTab] = useState(false); // show history panel
  const [historyItems, setHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(null); // expanded item id

  // Improve state
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [improveLoading, setImproveLoading] = useState(false);
  const [improveResult, setImproveResult] = useState(null);
  const [improveError, setImproveError] = useState("");

  // Reviews state
  const [reviewsUrl, setReviewsUrl] = useState("");
  const [reviewsText, setReviewsText] = useState("");
  const [reviewsProduct, setReviewsProduct] = useState("");
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsResult, setReviewsResult] = useState(null);
  const [reviewsError, setReviewsError] = useState("");
  const [reviewsCount, setReviewsCount] = useState(0);
  const [wbFetching, setWbFetching] = useState(false);

  // Sub-tab state: "single" | "bulk"
  const [subTab, setSubTab] = useState("single");

  // Bulk state
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkProducts, setBulkProducts] = useState([]); // [{product, features}]
  const [bulkResults, setBulkResults] = useState([]); // [{product, results}]
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkError, setBulkError] = useState("");
  const [bulkDragOver, setBulkDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // BULK_LIMITS per plan
  const BULK_LIMITS = { free: 0, growth: 10, pro: 50, agency: 200 };
  const userPlan = limit <= 10 ? "free" : limit <= 100 ? "growth" : limit <= 500 ? "pro" : "agency";
  const bulkMax = BULK_LIMITS[userPlan];

  const parseFile = async (file) => {
    setBulkError("");
    setBulkProducts([]);
    const ext = file.name.split(".").pop().toLowerCase();

    try {
      if (ext === "csv" || ext === "txt") {
        const text = await file.text();
        const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
        // Detect if first line is header
        const firstLower = lines[0]?.toLowerCase() || "";
        const hasHeader = firstLower.includes("product") || firstLower.includes("name") || firstLower.includes("товар");
        const dataLines = hasHeader ? lines.slice(1) : lines;
        const products = dataLines.map(line => {
          const cols = line.split(",");
          return { product: cols[0]?.trim() || "", features: cols[1]?.trim() || "" };
        }).filter(p => p.product);
        setBulkProducts(products);
        setBulkFile(file);
      } else if (ext === "xlsx" || ext === "xls") {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
        const firstRow = rows[0]?.map(c => String(c || "").toLowerCase()) || [];
        const hasHeader = firstRow.some(c => c.includes("product") || c.includes("name") || c.includes("товар"));
        const dataRows = hasHeader ? rows.slice(1) : rows;
        const products = dataRows.map(row => ({
          product: String(row[0] || "").trim(),
          features: String(row[1] || "").trim(),
        })).filter(p => p.product);
        setBulkProducts(products);
        setBulkFile(file);
      } else if (ext === "docx") {
        // Read docx as text - each paragraph is a product
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf);
        // Fallback: try to extract text
        const text = await file.text().catch(() => "");
        const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 2);
        const products = lines.map(l => ({ product: l, features: "" }));
        setBulkProducts(products);
        setBulkFile(file);
      }
    } catch (e) {
      setBulkError("Could not read file: " + e.message);
    }
  };

  const runBulkGenerate = async () => {
    if (bulkProducts.length === 0) { setBulkError(T.bulkErrNoFile); return; }
    if (bulkMax === 0) { setBulkError(T.bulkErrLimit(0)); return; }

    const toProcess = bulkProducts.slice(0, bulkMax);
    setBulkLoading(true);
    setBulkProgress(0);
    setBulkResults([]);
    setBulkError("");

    const results = [];
    for (let i = 0; i < toProcess.length; i++) {
      const { product: prod, features: feat } = toProcess[i];
      setBulkProgress(i + 1);
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product: prod,
            features: feat,
            platforms: selectedPlatforms,
            tone: tones.join(","),
          }),
        });
        const data = await res.json();
        results.push({ product: prod, results: data.results || {}, error: data.error || null });
        // Increment counter
        const newCount = count + i + 1;
        await supabase.from("profiles").update({ generations_used: newCount }).eq("id", user.id);
        setCount(newCount);
      } catch (e) {
        results.push({ product: prod, results: {}, error: e.message });
      }
    }

    setBulkResults(results);
    setBulkLoading(false);
  };

  const downloadBulkResults = () => {
    const rows = [["Product", ...selectedPlatforms]];
    bulkResults.forEach(item => {
      const row = [item.product, ...selectedPlatforms.map(p => item.results[p] || "")];
      rows.push(row);
    });
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Listings");
    XLSX.writeFile(wb, "sellscribe-bulk-listings.xlsx");
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { navigate("/auth"); return; }
      const u = data.session.user;
      setUser(u);
      const { data: profile } = await supabase
        .from("profiles")
        .select("generations_used, generations_limit, reset_date")
        .eq("id", u.id)
        .single();
      if (profile) {
        const lastReset = profile.reset_date ? new Date(profile.reset_date) : new Date(0);
        const now = new Date();
        const monthPassed = (now - lastReset) > 30 * 24 * 60 * 60 * 1000;
        if (monthPassed) {
          await supabase.from("profiles").update({
            generations_used: 0,
            reset_date: now.toISOString(),
          }).eq("id", u.id);
          setCount(0);
          setResetDate(new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000));
        } else {
          setCount(profile.generations_used || 0);
          setResetDate(new Date(lastReset.getTime() + 30 * 24 * 60 * 60 * 1000));
        }
        setLimit(profile.generations_limit || 10);
        setAuditCount(profile.audits_used || 0);
        setReviewsCount(profile.reviews_used || 0);
      }
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const toggleTone = (id) => {
    setTones(prev =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter(t => t !== id) : prev // keep at least one
        : [...prev, id]
    );
  };

  const togglePlatform = (id) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const generate = async () => {
    if (!product.trim()) { setError(T.errProduct); return; }
    if (selectedPlatforms.length === 0) { setError(T.errPlatform); return; }
    if (count >= limit) {
      const resetStr = resetDate
        ? resetDate.toLocaleDateString("en-GB", { day: "numeric", month: "long" })
        : "next month";
      setError(T.errLimit(limit, resetStr));
      return;
    }

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, features, platforms: selectedPlatforms, tone: tones.join(",") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      const newCount = count + 1;
      await supabase.from("profiles").update({ generations_used: newCount }).eq("id", user.id);
      setCount(newCount);
      setResults(data.results);
      setActivePlatform(selectedPlatforms[0]);
      saveHistory("generate", { product, platforms: selectedPlatforms, tone: tones.join(","), input: { product, features }, output: data.results });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const AUDIT_FREE_LIMIT = 2;
  const auditLimit = limit > 10 ? 999 : AUDIT_FREE_LIMIT; // paid users get unlimited audits

  const runAudit = async () => {
    const urls = auditUrls.split("\n").map(u => u.trim()).filter(u => u.startsWith("http"));
    if (urls.length === 0) { setAuditError(T.errUrls); return; }
    if (auditCount >= auditLimit) { setAuditError(T.auditLimitReached); return; }

    setAuditLoading(true);
    setAuditError("");
    setAuditResult(null);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urls,
          myListing: myListing.trim() || null,
          platform: auditPlatform,
          productName: product.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Audit failed");

      const newAuditCount = auditCount + 1;
      await supabase.from("profiles").update({ audits_used: newAuditCount }).eq("id", user.id);
      setAuditCount(newAuditCount);
      setAuditResult(data);
      saveHistory("gap", { product, input: { urls: auditUrls, myListing }, output: data });
    } catch (err) {
      setAuditError(err.message);
    } finally {
      setAuditLoading(false);
    }
  };

  const rewriteWithInsights = async () => {
    if (!auditResult) return;
    const insights = auditResult.audit;
    setRewriteLoading(true);
    setTab("create");
    setSubTab("single");
    setResults(null);
    setLoading(true);

    try {
      const enhancedFeatures = [
        features,
        `Include these keywords: ${insights.missingKeywords?.join(", ")}`,
        `Key improvements: ${insights.recommendations?.slice(0, 3).join("; ")}`,
      ].filter(Boolean).join("\n");

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: product || "product",
          features: enhancedFeatures,
          platforms: selectedPlatforms,
          tone,
        }),
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
      setRewriteLoading(false);
    }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    const { data } = await supabase
      .from("history")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setHistoryItems(data || []);
    setHistoryLoading(false);
  };

  const deleteHistory = async (id) => {
    await supabase.from("history").delete().eq("id", id);
    setHistoryItems(prev => prev.filter(h => h.id !== id));
  };

  const saveHistory = async (type, data) => {
    if (!user) return;
    await supabase.from("history").insert({
      user_id: user.id,
      type,
      product: data.product || null,
      platforms: data.platforms || null,
      tone: data.tone || null,
      input: data.input || {},
      output: data.output || {},
    });
  };

  const runImprove = async () => {
    if (!selectedHistoryItem) return;
    setImproveLoading(true);
    setImproveError("");
    setImproveResult(null);

    const item = selectedHistoryItem;
    const isPro = limit >= 500;
    const isListing = improveSubTab === "listing";

    try {
      const prompt = isListing
        ? `Based on this competitor gap analysis, generate an improved product listing.
Analysis data: ${JSON.stringify(item.output)}
Product: ${item.product || "the product"}
Platforms: ${(item.platforms || ["amazon"]).join(", ")}

Generate an improved listing for each platform that addresses the gaps found. Use the missing keywords, fix the weaknesses, and apply the recommendations. Format each platform with TITLE: and body text.`
        : `Based on this customer review analysis, provide concrete product improvement ideas.
Analysis data: ${JSON.stringify(item.output)}
Product: ${item.product || "the product"}

Provide 8-10 specific, actionable product improvement ideas that address what customers complained about and capitalize on what they loved. Format as a numbered list with brief explanation for each.`;

      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, type: improveSubTab, platforms: item.platforms }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Improve failed");
      const text = data.text || "";

      if (isListing) {
        // Parse platform sections
        const platforms = item.platforms || ["amazon"];
        const enPlats = platforms.filter(p => !["wildberries","kaspi"].includes(p));
        const ruPlats = platforms.filter(p => ["wildberries","kaspi"].includes(p));
        const sections = text.split(/(?=(?:^|\n)(?:TITLE:|ЗАГОЛОВОК:))/m).filter(s => s.trim());
        const results = {};
        let ei = 0, ri = 0;
        sections.forEach(s => {
          const t = s.trim();
          if (t.startsWith("TITLE:") && ei < enPlats.length) { results[enPlats[ei]] = t; ei++; }
          else if (t.startsWith("ЗАГОЛОВОК:") && ri < ruPlats.length) { results[ruPlats[ri]] = t; ri++; }
        });
        if (Object.keys(results).length === 0) results[platforms[0]] = text;
        setImproveResult({ type: "listing", platforms, results });
        setResults(results);
        setActivePlatform(platforms[0]);
        setTab("create");
        setSubTab("single");
      } else {
        setImproveResult({ type: "product", text });
      }

      const newCount = count + 1;
      await supabase.from("profiles").update({ generations_used: newCount }).eq("id", user.id);
      setCount(newCount);
    } catch (err) {
      setImproveError(err.message);
    } finally {
      setImproveLoading(false);
    }
  };

  const REVIEWS_GROWTH_LIMIT = limit >= 100 ? 999 : 0; // growth+ gets reviews
  const reviewsLimit = REVIEWS_GROWTH_LIMIT;

  const fetchWbReviews = async () => {
    const match = reviewsUrl.match(/catalog\/([0-9]+)\//);
    if (!match) { setReviewsError(T.reviewsFetchErr); return; }
    const articleId = match[1];
    setWbFetching(true);
    try {
      const res = await fetch(`https://feedbacks2.wb.ru/feedbacks/v1/${articleId}?take=30&skip=0`);
      const data = await res.json();
      const feedbacks = data?.feedbacks || [];
      if (feedbacks.length === 0) { setReviewsError(T.reviewsFetchErr); return; }
      const text = feedbacks.map(f =>
        `${f.productValuation}/5 — ${f.text || ""}`
      ).join("\n\n");
      setReviewsText(text);
    } catch {
      setReviewsError(T.reviewsFetchErr);
    } finally {
      setWbFetching(false);
    }
  };

  const runReviews = async () => {
    const text = reviewsText.trim();
    if (!text) { setReviewsError(lang === "ru" ? "Вставьте текст отзывов" : "Paste review text first"); return; }
    if (reviewsLimit === 0) { setReviewsError(T.reviewsLimitMsg); return; }

    setReviewsLoading(true);
    setReviewsError("");
    setReviewsResult(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviews: text, productName: reviewsProduct.trim() || null, lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      const newCount = reviewsCount + 1;
      await supabase.from("profiles").update({ reviews_used: newCount }).eq("id", user.id);
      setReviewsCount(newCount);
      setReviewsResult(data);
      saveHistory("reviews", { input: { reviewsText: reviewsText.slice(0, 200) }, output: data });
    } catch (err) {
      setReviewsError(err.message);
    } finally {
      setReviewsLoading(false);
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
        button:hover { opacity:0.88; }
        @keyframes pulse { 0%,100%{opacity:0.2;}50%{opacity:0.5;} }
        @keyframes spin { to{transform:rotate(360deg);} }
        ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-thumb{background:${V1}25;border-radius:3px;}
        .tooltip-wrap:hover .tooltip-box { opacity:1 !important; }
        input:focus::placeholder, textarea:focus::placeholder { color: transparent; }
        .bars-row { flex-direction: row !important; }
        @media (max-width: 640px) { .bars-row { flex-direction: column !important; gap: 6px !important; } }
        .gen-nav-right { display:flex; align-items:center; gap:10px; flex-wrap:wrap; justify-content:flex-end; }
        .gen-email { display:block; }
        .gen-lang { display:flex; }
        .gen-contact { display:inline-flex; }
        .gen-layout { display:grid; grid-template-columns:400px 1fr; min-height:calc(100vh - 60px); }
        .gen-right { background:${LT}; padding:36px 40px; overflow-y:auto; display:flex; flex-direction:column; }
        @media (max-width:900px) {
          .gen-layout { grid-template-columns:1fr; }
          .gen-right { padding:24px 20px; }
          .gen-left { padding:24px 20px !important; }
        }
        @media (max-width:640px) {
          .gen-email { display:none !important; }
          .gen-lang { display:none !important; }
          .gen-nav-right { gap:8px; max-width:calc(100vw - 140px); }
        }
      `}</style>

      {/* NAV — dark */}
      <nav style={{ padding: "0 32px", borderBottom: `1px solid ${V1}12`, position: "sticky", top: 0, background: `${DK}F5`, backdropFilter: "blur(20px)", zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", minHeight: 60, padding: "6px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
          <div onClick={() => navigate("/")}><Logo /></div>
          <div className="gen-nav-right">
            {user && <span className="gen-email" style={{ fontSize: 13, color: "#9B96B8", fontWeight: 500 }}>{user.email}</span>}
            <div className="bars-row" style={{ display: "flex", flexDirection: "row", gap: 16, alignItems: "flex-start" }}>
              {(() => {
                const improveRem = limit >= 500 ? limit - count : 0;
                const improveTotal = limit >= 500 ? limit : 0;
                const bars = [
                  { label: lang === "ru" ? "СОЗДАТЬ" : "CREATE", rem: limit - count, total: limit },
                  { label: lang === "ru" ? "АНАЛИЗ" : "ANALYZE", rem: auditLimit - auditCount, total: auditLimit },
                  { label: lang === "ru" ? "УЛУЧШИТЬ" : "IMPROVE", rem: improveRem, total: improveTotal },
                ];
                return bars.map(({ label, rem, total }) => {
                  const pct = total === 0 ? 0 : total > 500 ? 100 : Math.max((rem / total) * 100, 0);
                  // Color: if small total (<=5), only green/red. If larger, green→yellow→red
                  const isSmall = total > 0 && total <= 5;
                  const barColor = total === 0 ? "#2A2450"
                    : rem === 0 ? "#6D628F"
                    : rem <= (isSmall ? 1 : 2) ? "#FF4D6D"
                    : (!isSmall && pct <= 50) ? "#FFB703"
                    : "#22C55E";
                  const textColor = total === 0 ? "#3D3960"
                    : rem === 0 ? "#5A5478"
                    : rem <= (isSmall ? 1 : 2) ? "#FF4D6D"
                    : (!isSmall && pct <= 50) ? "#FFB703"
                    : "#A8A4C8";
                  return (
                    <div key={label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#8B87A8", letterSpacing: "0.06em" }}>{label}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: textColor }}>
                          {total > 500 ? "∞" : `${rem}/${total}`}
                        </span>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: "#2A2450", overflow: "hidden", minWidth: 70, width: 80 }}>
                        <div style={{
                          height: "100%", borderRadius: 2, transition: "width 0.4s",
                          background: barColor,
                          width: `${pct}%`,
                        }} />
                      </div>
                    </div>
                  );
                });
              })()}
              {resetDate && <div style={{ fontSize: 9, color: "#6D628F", fontWeight: 600, marginTop: 2 }}>
                {T.resetsOn} {resetDate.toLocaleDateString(lang === "ru" ? "ru-RU" : "en-GB", { day: "numeric", month: "short" })}
              </div>}
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
              {T.upgradeBtn}
            </button>
            <div className="gen-lang" style={{ background: `${V1}0A`, border: `1px solid ${V1}18`, borderRadius: 8, overflow: "hidden" }}>
              {["en", "ru"].map(l => (
                <button key={l} onClick={() => setLang(l)} style={{ padding: "5px 12px", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12, background: lang === l ? `${V1}25` : "transparent", color: lang === l ? V3 : "#6D628F", letterSpacing: "0.04em", transition: "all 0.2s" }}>{l.toUpperCase()}</button>
              ))}
            </div>
            <a className="gen-contact" href="https://tally.so/r/NpYqMl" target="_blank" rel="noopener noreferrer"
              style={{ padding: "8px 18px", borderRadius: 6, border: "1px solid rgba(139,92,246,0.35)", background: "rgba(139,92,246,0.08)", color: "#A78BFA", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
              {T.contactBtn}
            </a>
<button onClick={logout} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${V1}20`, background: "transparent", color: "#6D628F", fontWeight: 600, fontSize: 13 }}>
              {T.logoutBtn}
            </button>
          </div>
        </div>
      </nav>

      {/* SPLIT LAYOUT */}
      <div className="gen-layout">

        {/* LEFT — dark input panel */}
        <div className="gen-left" style={{ background: DK, padding: "36px 32px", borderRight: `1px solid ${V1}10`, display: "flex", flexDirection: "column", gap: 20, overflowY: "auto" }}>

          {/* PRIMARY TABS */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <div style={{ display: "flex", gap: 3 }}>
              {["create", "analyze", "improve"].map(t => {
                const active = tab === t;
                return (
                  <button key={t} onClick={() => { setTab(t); if (t === "improve") { loadHistory(); setImproveResult(null); } }} style={{
                    padding: "8px 20px",
                    border: `2px solid ${active ? V1 : V1 + "40"}`,
                    borderBottom: "none",
                    borderRadius: "8px 8px 0 0",
                    background: active ? `linear-gradient(135deg, ${V1}, ${V2})` : "transparent",
                    color: active ? "#fff" : "#B0AACC",
                    fontWeight: 700, fontSize: 15,
                    transition: "all 0.15s",
                  }}>
                    {t === "analyze" ? T.analyzeTab : t === "create" ? T.createTab : T.improveTab}
                  </button>
                );
              })}
            </div>
            <div style={{ height: 2, background: `linear-gradient(90deg, ${V1}, ${V2})`, borderRadius: 1 }} />
          </div>

          {/* SUB-TABS */}
          {(tab === "create" || tab === "analyze" || tab === "improve") && (
            <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 6 }}>
              <div style={{ display: "flex", gap: 3 }}>
                {(tab === "create"
                  ? ["single", "bulk"]
                  : tab === "analyze"
                  ? ["audit", "reviews"]
                  : ["listing", "product"]
                ).map(st => {
                  const active = tab === "create" ? subTab === st : tab === "analyze" ? analyzeSubTab === st : improveSubTab === st;
                  const label = tab === "create"
                    ? (st === "single" ? (lang === "ru" ? "Одиночный" : "Single") : (lang === "ru" ? "Массово" : "Bulk"))
                    : tab === "analyze"
                    ? (st === "audit" ? T.compareSubTab : T.reviewsSubTab)
                    : (st === "listing" ? T.improveListingSubTab : T.improveProductSubTab);
                  return (
                    <button key={st} onClick={() => {
                      if (tab === "create") setSubTab(st);
                      else if (tab === "analyze") setAnalyzeSubTab(st);
                      else { setImproveSubTab(st); setSelectedHistoryItem(null); setImproveResult(null); loadHistory(); }
                    }} style={{
                      padding: "6px 16px",
                      border: `2px solid ${active ? V1 : V1 + "35"}`,
                      borderBottom: "none",
                      borderRadius: "6px 6px 0 0",
                      background: active ? `linear-gradient(135deg, ${V1}, ${V2})` : "transparent",
                      color: active ? "#fff" : "#B0AACC",
                      fontWeight: active ? 700 : 500,
                      fontSize: 13,
                      transition: "all 0.15s",
                    }}>
                      {label}
                    </button>
                  );
                })}
              </div>
              <div style={{ height: 2, background: `${V1}40`, borderRadius: 1 }} />
            </div>
          )}

          {tab === "create" && subTab === "single" && <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "#F5F3FF", letterSpacing: "-0.03em", marginBottom: 5 }}>
              {T.title}
            </h1>
            <p style={{ fontSize: 13, color: "#9B96B8" }}>{T.sub}</p>
          </div>}
          {tab === "analyze" && analyzeSubTab === "audit" && <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "#F5F3FF", letterSpacing: "-0.03em", marginBottom: 8 }}>
              {T.auditTitle}
            </h1>
            <p style={{ fontSize: 13, color: "#9B96B8", lineHeight: 1.6 }}>{lang === "ru" ? "Узнайте где именно вы отстаёте от топ-конкурентов — по ключевым словам, структуре и содержанию. Конкретный план действий как закрыть разрыв доступен во вкладке Improve." : "See exactly where you stand vs top competitors — keyword gaps, listing weaknesses, and what they're doing better. Detailed recommendations to close the gap are in the Improve tab."}</p>
          </div>}

          {tab === "create" && subTab === "single" && <>
          {/* Product name */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color: "#9B96B8", display: "block", marginBottom: 7, textTransform: "uppercase" }}>{T.prodLabel}</label>
            <input
              value={product}
              onChange={e => setProduct(e.target.value)}
              placeholder={T.prodPlaceholder}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, background: "#F7F5FF", border: `1px solid ${V1}20`, color: "#1A1330", fontSize: 14 }}
            />
          </div>

          {/* Features */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color: "#9B96B8", display: "block", marginBottom: 7, textTransform: "uppercase" }}>
              {T.featLabel} <span style={{ color: "#6D628F", fontWeight: 500, textTransform: "none", letterSpacing: 0, fontSize: 12 }}>{T.featOpt}</span>
            </label>
            <textarea
              value={features}
              onChange={e => setFeatures(e.target.value)}
              placeholder={T.featPlaceholder}
              rows={4}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, background: "#F7F5FF", border: `1px solid ${V1}20`, color: "#1A1330", fontSize: 13, resize: "vertical", lineHeight: 1.6 }}
            />
          </div>

          {/* Platforms — pills */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color: "#9B96B8", display: "block", marginBottom: 10, textTransform: "uppercase" }}>{T.platLabel}</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {PLATFORMS.map(p => {
                const selected = selectedPlatforms.includes(p.id);
                return (
                  <button key={p.id} onClick={() => togglePlatform(p.id)} style={{
                    padding: "7px 14px", borderRadius: 100,
                    background: selected ? `${p.color}18` : `${V1}06`,
                    color: selected ? p.color : "#9B96B8",
                    border: `1.5px solid ${selected ? p.color + "50" : V1 + "20"}`,
                    fontSize: 13, fontWeight: 600,
                    transition: "all 0.15s",
                  }}>
                    {p.flag} {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tone — multi-select */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color: "#9B96B8", display: "block", marginBottom: 10, textTransform: "uppercase" }}>
              {T.toneLabel} <span style={{ color: "#5A5478", fontWeight: 500, textTransform: "none", letterSpacing: 0, fontSize: 11 }}>{lang === "ru" ? "(можно несколько)" : "(pick one or more)"}</span>
            </label>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {TONES.map((t, i) => {
                const active = tones.includes(t.id);
                return (
                  <button key={t.id} onClick={() => toggleTone(t.id)} style={{
                    padding: "7px 15px", borderRadius: 100, border: "none",
                    background: active ? `linear-gradient(135deg, ${V1}, ${V2})` : `${V1}08`,
                    color: active ? "#fff" : "#6D628F",
                    fontSize: 13, fontWeight: 600,
                    boxShadow: active ? `0 2px 10px ${V1}30` : "none",
                  }}>
                    {T.tones[i]}
                  </button>
                );
              })}
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
            {loading ? T.genLoading : T.genBtn}
          </button>
          </>}

          {/* BULK TAB */}
          {tab === "create" && subTab === "bulk" && <>
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "#F5F3FF", letterSpacing: "-0.03em", marginBottom: 5 }}>{T.bulkTitle}</h1>
              <p style={{ fontSize: 13, color: "#9B96B8" }}>{T.bulkSub}</p>
            </div>

            {/* File upload */}
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color: "#9B96B8", display: "block", marginBottom: 8, textTransform: "uppercase" }}>{T.bulkUploadLabel}</label>
              <div
                onDragOver={e => { e.preventDefault(); setBulkDragOver(true); }}
                onDragLeave={() => setBulkDragOver(false)}
                onDrop={e => { e.preventDefault(); setBulkDragOver(false); const f = e.dataTransfer.files[0]; if (f) parseFile(f); }}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${bulkDragOver ? V1 : V1 + "30"}`,
                  borderRadius: 12, padding: "28px 20px",
                  textAlign: "center", cursor: "pointer",
                  background: bulkDragOver ? `${V1}08` : `${V1}04`,
                  transition: "all 0.2s",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>📂</div>
                <div style={{ color: "#F5F3FF", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{T.bulkUploadBtn}</div>
                <div style={{ color: "#9B96B8", fontSize: 12 }}>{T.bulkDropHint}</div>
                <div style={{ color: "#5A5478", fontSize: 11, marginTop: 8 }}>{T.bulkUploadHint}</div>
              </div>
              <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls,.txt,.docx" style={{ display: "none" }}
                onChange={e => { const f = e.target.files[0]; if (f) parseFile(f); }} />
            </div>

            {/* Preview */}
            {bulkProducts.length > 0 && (
              <div style={{ background: `${V1}08`, borderRadius: 10, padding: "12px 14px", border: `1px solid ${V1}15` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#9B96B8", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>
                  {T.bulkPreviewTitle}: {bulkProducts.length}
                  {bulkMax > 0 && bulkProducts.length > bulkMax && (
                    <span style={{ color: "#F87171", marginLeft: 8, fontWeight: 600 }}>→ {bulkMax} will be processed</span>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 140, overflowY: "auto" }}>
                  {bulkProducts.slice(0, 8).map((p, i) => (
                    <div key={i} style={{ fontSize: 12, color: "#C4C0DA", display: "flex", gap: 8 }}>
                      <span style={{ color: "#5A5478", minWidth: 20 }}>{i + 1}.</span>
                      <span>{p.product}</span>
                      {p.features && <span style={{ color: "#5A5478" }}>· {p.features.slice(0, 30)}{p.features.length > 30 ? "..." : ""}</span>}
                    </div>
                  ))}
                  {bulkProducts.length > 8 && <div style={{ fontSize: 11, color: "#5A5478" }}>+{bulkProducts.length - 8} more...</div>}
                </div>
              </div>
            )}

            {/* Platforms (reuse) */}
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color: "#9B96B8", display: "block", marginBottom: 10, textTransform: "uppercase" }}>{T.platLabel}</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {PLATFORMS.map(p => {
                  const sel = selectedPlatforms.includes(p.id);
                  return (
                    <button key={p.id} onClick={() => togglePlatform(p.id)} style={{
                      padding: "6px 13px", borderRadius: 100,
                      background: sel ? `${p.color}15` : `${V1}06`,
                      color: sel ? p.color : "#6D628F", fontSize: 12, fontWeight: 600,
                      border: sel ? `1px solid ${p.color}35` : `1px solid ${V1}0A`,
                    }}>
                      {p.flag} {p.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {bulkError && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#FCA5A5", fontSize: 13 }}>{bulkError}</div>}

            {/* Upgrade banner for free users */}
            {bulkMax === 0 && (
              <div style={{ padding: "14px 16px", borderRadius: 12, background: `linear-gradient(135deg, ${V1}15, ${V2}10)`, border: `1px solid ${V1}25`, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>🔒</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#F5F3FF", fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
                    {lang === "ru" ? "Доступно на Growth и выше" : "Available on Growth & above"}
                  </div>
                  <div style={{ color: "#9B96B8", fontSize: 12 }}>
                    {lang === "ru" ? "До 10 товаров за раз — от $9/мес" : "Up to 10 products at once — from $9/mo"}
                  </div>
                </div>
                <button onClick={async () => {
                  const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: "growth", email: user?.email }) });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                }} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: `linear-gradient(135deg, ${V1}, ${V2})`, color: "#fff", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                  {T.upgradeBtn}
                </button>
              </div>
            )}

            <button
              onClick={runBulkGenerate}
              disabled={bulkLoading || bulkProducts.length === 0 || bulkMax === 0}
              style={{
                width: "100%", padding: "14px", borderRadius: 12, border: "none",
                background: (bulkLoading || bulkProducts.length === 0 || bulkMax === 0) ? `${V1}25` : `linear-gradient(135deg, ${V1}, ${V2})`,
                color: (bulkMax === 0) ? "#6D628F" : "#fff", fontWeight: 700, fontSize: 15,
                boxShadow: (bulkLoading || bulkProducts.length === 0 || bulkMax === 0) ? "none" : `0 4px 22px ${V1}35`,
                marginTop: "auto",
                cursor: bulkMax === 0 ? "not-allowed" : "pointer",
              }}
            >
              {bulkLoading ? T.bulkGenLoading(bulkProgress, Math.min(bulkProducts.length, bulkMax)) : T.bulkGenBtn}
            </button>
          </>}

          {/* IMPROVE TAB */}
          {tab === "improve" && <>
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "#F5F3FF", letterSpacing: "-0.03em", marginBottom: 5 }}>
                {improveSubTab === "listing" ? T.improveListingTitle : T.improveProductTitle}
              </h1>
              <p style={{ fontSize: 13, color: "#9B96B8" }}>
                {improveSubTab === "listing" ? T.improveListingSub : T.improveProductSub}
              </p>
            </div>

            {/* Pick from history */}
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color: "#9B96B8", display: "block", marginBottom: 10, textTransform: "uppercase" }}>{T.pickAnalysis}</label>
              {historyItems.filter(h => improveSubTab === "listing" ? h.type === "gap" : h.type === "reviews").slice(0, 5).length === 0 ? (
                <div style={{ padding: "16px", borderRadius: 10, background: `${V1}08`, border: `1px solid ${V1}15`, color: "#6D628F", fontSize: 13, textAlign: "center", lineHeight: 1.6 }}>
                  {T.noHistoryMsg}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {historyItems.filter(h => improveSubTab === "listing" ? h.type === "gap" : h.type === "reviews").slice(0, 5).map(item => {
                    const selected = selectedHistoryItem?.id === item.id;
                    return (
                      <div key={item.id} onClick={() => setSelectedHistoryItem(selected ? null : item)} style={{
                        padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                        background: selected ? `${V1}15` : `${V1}06`,
                        border: `1.5px solid ${selected ? V1 : V1 + "20"}`,
                        transition: "all 0.15s",
                      }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: selected ? "#F5F3FF" : "#C4C0DA" }}>
                          {item.product || (item.type === "gap" ? "Competitor Analysis" : "Review Analysis")}
                        </div>
                        <div style={{ fontSize: 11, color: "#5A5478", marginTop: 3 }}>
                          {new Date(item.created_at).toLocaleDateString(lang === "ru" ? "ru-RU" : "en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {improveError && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#FCA5A5", fontSize: 13 }}>{improveError}</div>}

            {limit < 500 && (
              <div style={{ padding: "14px 16px", borderRadius: 12, background: `linear-gradient(135deg, ${V1}15, ${V2}10)`, border: `1px solid ${V1}25`, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>🔒</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#F5F3FF", fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
                    {lang === "ru" ? "Доступно на Pro и выше" : "Available on Pro & above"}
                  </div>
                  <div style={{ color: "#9B96B8", fontSize: 12 }}>
                    {lang === "ru" ? "Полный план действий — только для Pro" : "Full action plan — Pro plan only"}
                  </div>
                </div>
                <button onClick={async () => {
                  const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: "growth", email: user?.email }) });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                }} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: `linear-gradient(135deg, ${V1}, ${V2})`, color: "#fff", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                  {T.upgradeBtn}
                </button>
              </div>
            )}

            <button onClick={runImprove} disabled={improveLoading || !selectedHistoryItem || limit < 500}
              style={{
                width: "100%", padding: "14px", borderRadius: 12, border: "none",
                background: (improveLoading || !selectedHistoryItem || limit < 500) ? `${V1}25` : `linear-gradient(135deg, ${V1}, ${V2})`,
                color: (improveLoading || !selectedHistoryItem || limit < 500) ? "#6D628F" : "#fff",
                fontWeight: 700, fontSize: 15,
                boxShadow: (improveLoading || !selectedHistoryItem || limit < 500) ? "none" : `0 4px 22px ${V1}35`,
                marginTop: "auto",
                cursor: limit < 500 ? "not-allowed" : "pointer",
              }}>
              {improveLoading ? T.improving : improveSubTab === "listing" ? T.improveListingBtn : T.improveProductBtn}
            </button>
          </>}

          {/* AUDIT TAB */}
          {tab === "analyze" && analyzeSubTab === "audit" && <>

            {/* My product name */}
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color: "#9B96B8", display: "block", marginBottom: 7, textTransform: "uppercase" }}>
                {lang === "ru" ? "Мой товар" : "My product name"}
              </label>
              <input
                value={product}
                onChange={e => setProduct(e.target.value)}
                placeholder={T.prodPlaceholder}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, background: "#F7F5FF", border: `1px solid ${V1}20`, color: "#1A1330", fontSize: 14 }}
              />
            </div>

            {/* My listing */}
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color: "#9B96B8", display: "block", marginBottom: 7, textTransform: "uppercase" }}>
                {T.myListingLabel} <span style={{ color: "#5A5478", fontWeight: 500, textTransform: "none", letterSpacing: 0, fontSize: 12 }}>{T.myListingOpt}</span>
              </label>
              <textarea
                value={myListing}
                onChange={e => setMyListing(e.target.value)}
                placeholder={T.myListingPlaceholder}
                rows={4}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, background: "#F7F5FF", border: `1px solid ${V1}20`, color: "#1A1330", fontSize: 13, resize: "vertical", lineHeight: 1.6 }}
              />
            </div>

            {/* Competitor URLs */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color: "#9B96B8", textTransform: "uppercase" }}>{T.urlsLabel}</label>
                <div style={{ position: "relative", display: "inline-flex" }} className="tooltip-wrap">
                  <span style={{ width: 15, height: 15, borderRadius: "50%", background: `${V1}15`, border: `1px solid ${V1}25`, color: V3, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", cursor: "default" }}>?</span>
                  <div className="tooltip-box" style={{
                    position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
                    background: "#1C1830", border: `1px solid ${V1}20`, borderRadius: 10, padding: "10px 14px",
                    width: 260, fontSize: 12, color: "#C4C0DA", lineHeight: 1.6, zIndex: 100,
                    pointerEvents: "none", opacity: 0, transition: "opacity 0.15s",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                  }}>
                    {lang === "ru"
                      ? "Вставьте ссылки на товары схожие с вашим, у которых высокий рейтинг и много продаж. SellScribe проанализирует их листинги и выявит что делает их успешными."
                      : "Paste links to products similar to yours with high ratings and strong sales. SellScribe will analyze their listings to find what makes them successful."}
                  </div>
                </div>
              </div>
              <textarea
                value={auditUrls}
                onChange={e => setAuditUrls(e.target.value)}
                placeholder={T.urlsPlaceholder}
                rows={4}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, background: "#F7F5FF", border: `1px solid ${V1}20`, color: "#1A1330", fontSize: 13, resize: "vertical", lineHeight: 1.6 }}
              />
              <div style={{ fontSize: 11, color: "#5A5478", marginTop: 5 }}>{T.urlsHint}</div>
            </div>

            {/* Platform focus with tooltip */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color: "#9B96B8", textTransform: "uppercase" }}>{T.platformLabel}</label>
                <div style={{ position: "relative", display: "inline-flex" }} className="tooltip-wrap">
                  <span style={{ width: 15, height: 15, borderRadius: "50%", background: `${V1}15`, border: `1px solid ${V1}25`, color: V3, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", cursor: "default" }}>?</span>
                  <div className="tooltip-box" style={{
                    position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
                    background: "#1C1830", border: `1px solid ${V1}20`, borderRadius: 10, padding: "10px 14px",
                    width: 240, fontSize: 12, color: "#C4C0DA", lineHeight: 1.6, zIndex: 100,
                    pointerEvents: "none", opacity: 0, transition: "opacity 0.15s",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                  }}>
                    {lang === "ru"
                      ? "Укажите платформу для анализа. SellScribe адаптирует инсайты и рекомендации под формат и стандарты выбранного маркетплейса."
                      : "Tells SellScribe which platform's standards to apply. The analysis and recommendations will be tailored to that marketplace's format, keyword style, and best practices."}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {PLATFORMS.map(p => (
                  <button key={p.id} onClick={() => setAuditPlatform(p.id)} style={{
                    padding: "6px 13px", borderRadius: 100,
                    background: auditPlatform === p.id ? `${p.color}20` : `${V1}06`,
                    color: auditPlatform === p.id ? p.color : "#6D628F",
                    fontSize: 12, fontWeight: 600,
                    border: auditPlatform === p.id ? `1px solid ${p.color}40` : `1px solid ${V1}0A`,
                  }}>
                    {p.flag} {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Audit error */}
            {auditError && (
              <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#FCA5A5", fontSize: 13 }}>
                {auditError}
              </div>
            )}

            {/* Audit button */}
            <button
              onClick={runAudit}
              disabled={auditLoading}
              style={{
                width: "100%", padding: "14px", borderRadius: 12, border: "none",
                background: auditLoading ? `${V1}35` : `linear-gradient(135deg, ${V1}, ${V2})`,
                color: "#fff", fontWeight: 700, fontSize: 15,
                boxShadow: auditLoading ? "none" : `0 4px 22px ${V1}35`,
                marginTop: "auto",
              }}
            >
              {auditLoading ? T.auditLoading : T.auditBtn}
            </button>
          </>}

        {/* REVIEWS TAB */}
          {tab === "analyze" && analyzeSubTab === "reviews" && <>
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "#F5F3FF", letterSpacing: "-0.03em", marginBottom: 5 }}>{T.reviewsTitle}</h1>
              <p style={{ fontSize: 13, color: "#9B96B8" }}>{T.reviewsSub}</p>
            </div>

            {/* Single textarea for all reviews */}
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color: "#9B96B8", display: "block", marginBottom: 7, textTransform: "uppercase" }}>
                {T.reviewsTextLabel}
              </label>
              <textarea value={reviewsText} onChange={e => setReviewsText(e.target.value)}
                placeholder={T.reviewsTextPlaceholder} rows={10}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, background: "#F7F5FF", border: `1px solid ${V1}20`, color: "#1A1330", fontSize: 12, resize: "vertical", lineHeight: 1.6 }} />
            </div>

            {reviewsError && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#FCA5A5", fontSize: 13 }}>{reviewsError}</div>}

            {reviewsLimit === 0 && (
              <div style={{ padding: "14px 16px", borderRadius: 12, background: `linear-gradient(135deg, ${V1}15, ${V2}10)`, border: `1px solid ${V1}25`, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>🔒</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#F5F3FF", fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
                    {lang === "ru" ? "Доступно на Growth и выше" : "Available on Growth & above"}
                  </div>
                  <div style={{ color: "#9B96B8", fontSize: 12 }}>{T.reviewsLimitMsg}</div>
                </div>
                <button onClick={async () => {
                  const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: "pro", email: user?.email }) });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                }} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: `linear-gradient(135deg, ${V1}, ${V2})`, color: "#fff", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                  {T.upgradeBtn}
                </button>
              </div>
            )}

            <button onClick={runReviews} disabled={reviewsLoading || !reviewsText.trim() || reviewsLimit === 0}
              style={{
                width: "100%", padding: "14px", borderRadius: 12, border: "none",
                background: (reviewsLoading || !reviewsText.trim() || reviewsLimit === 0) ? `${V1}25` : `linear-gradient(135deg, ${V1}, ${V2})`,
                color: (reviewsLimit === 0) ? "#6D628F" : "#fff", fontWeight: 700, fontSize: 15,
                boxShadow: (reviewsLoading || !reviewsText.trim() || reviewsLimit === 0) ? "none" : `0 4px 22px ${V1}35`,
                marginTop: "auto", cursor: reviewsLimit === 0 ? "not-allowed" : "pointer",
              }}>
              {reviewsLoading ? T.reviewsLoading : T.reviewsBtn}
            </button>
          </>}

        </div>

        {/* RIGHT — light output panel */}
        <div className="gen-right">

          {/* IMPROVE RESULTS — product */}
          {tab === "improve" && improveSubTab === "product" && improveResult?.type === "product" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "#1A1530" }}>{T.improvedProductTitle}</h3>
              <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: `1px solid ${LT2}`, boxShadow: "0 2px 12px rgba(139,92,246,0.06)", whiteSpace: "pre-wrap", fontSize: 14, color: "#2A2340", lineHeight: 1.8 }}>
                {improveResult.text}
              </div>
            </div>
          )}

          {tab === "improve" && !improveResult && !improveLoading && (
            <div style={{ flex: 1, minHeight: "calc(100vh - 132px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: `${V1}12`, border: `1px solid ${V1}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>✨</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "#1A1530" }}>
                {improveSubTab === "listing" ? T.improveListingTitle : T.improveProductTitle}
              </h3>
              <p style={{ color: "#9B96B8", fontSize: 14, maxWidth: 280, lineHeight: 1.65 }}>
                {improveSubTab === "listing" ? T.improveListingSub : T.improveProductSub}
              </p>
            </div>
          )}

          {tab === "improve" && improveLoading && (
            <div style={{ flex: 1, minHeight: "calc(100vh - 132px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 360 }}>
                {[85, 65, 75, 50, 80, 60].map((w, i) => (
                  <div key={i} style={{ height: 10, width: `${w}%`, borderRadius: 5, background: `${V1}18`, animation: `pulse 1.4s ease-in-out ${i * 0.1}s infinite` }} />
                ))}
              </div>
              <p style={{ color: "#9B96B8", fontSize: 13 }}>{T.improving}</p>
            </div>
          )}

          {/* BULK RESULTS */}
          {tab === "create" && subTab === "bulk" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              {bulkResults.length === 0 && !bulkLoading && (
                <div style={{ flex: 1, minHeight: "calc(100vh - 132px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, textAlign: "center" }}>
                  <div style={{ width: 64, height: 64, borderRadius: 20, background: `${V1}12`, border: `1px solid ${V1}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: V1 }}>✦</div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "#1A1530" }}>{T.emptyTitle}</h3>
                  <p style={{ color: "#9B96B8", fontSize: 14, maxWidth: 280, lineHeight: 1.65 }}>{T.emptySub}</p>
                </div>
              )}

              {bulkLoading && (
                <div style={{ flex: 1, minHeight: "calc(100vh - 132px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
                  <div style={{ width: 80, height: 80, borderRadius: "50%", border: `4px solid ${V1}20`, borderTop: `4px solid ${V1}`, animation: "spin 1s linear infinite" }} />
                  <p style={{ color: "#1A1530", fontWeight: 700, fontSize: 16 }}>
                    {T.bulkProgress(bulkProgress, Math.min(bulkProducts.length, bulkMax))}
                  </p>
                  <div style={{ width: 240, height: 6, borderRadius: 3, background: `${V1}15`, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: `linear-gradient(90deg, ${V1}, ${V2})`, width: `${(bulkProgress / Math.min(bulkProducts.length, bulkMax)) * 100}%`, transition: "width 0.4s" }} />
                  </div>
                  <p style={{ color: "#9B96B8", fontSize: 13 }}>{T.writingMsg}</p>
                </div>
              )}

              {bulkResults.length > 0 && !bulkLoading && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "#1A1530" }}>
                      {T.bulkResultsTitle} ({bulkResults.length})
                    </h3>
                    <button onClick={downloadBulkResults} style={{
                      padding: "9px 18px", borderRadius: 10, border: "none",
                      background: `linear-gradient(135deg, ${V1}, ${V2})`,
                      color: "#fff", fontWeight: 700, fontSize: 13,
                      boxShadow: `0 2px 12px ${V1}30`,
                    }}>
                      {T.bulkDownloadBtn}
                    </button>
                  </div>
                  {bulkResults.map((item, idx) => (
                    <div key={idx} style={{ background: "#fff", borderRadius: 14, border: `1px solid ${LT2}`, overflow: "hidden", boxShadow: "0 2px 12px rgba(139,92,246,0.05)" }}>
                      <div style={{ padding: "12px 16px", background: item.error ? "rgba(239,68,68,0.04)" : `${V1}06`, borderBottom: `1px solid ${LT2}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "#1A1330" }}>{idx + 1}. {item.product}</span>
                        {item.error && <span style={{ fontSize: 11, color: "#EF4444" }}>Error</span>}
                        {!item.error && <span style={{ fontSize: 11, color: V1, fontWeight: 600 }}>{selectedPlatforms.length} platforms</span>}
                      </div>
                      {!item.error && (
                        <div style={{ display: "flex", borderBottom: `1px solid ${LT2}`, overflowX: "auto" }}>
                          {selectedPlatforms.map(pid => {
                            const p = PLATFORMS.find(pl => pl.id === pid);
                            return (
                              <div key={pid} style={{ padding: "12px 16px", minWidth: 120, borderRight: `1px solid ${LT2}` }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: p.color, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>{p.name}</div>
                                <div style={{ fontSize: 11, color: "#6B647A", lineHeight: 1.5, maxHeight: 60, overflow: "hidden" }}>
                                  {(item.results[pid] || "").slice(0, 100)}...
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* REVIEWS RESULTS */}
          {tab === "analyze" && analyzeSubTab === "reviews" && !reviewsResult && !reviewsLoading && (
            <div style={{ flex: 1, minHeight: "calc(100vh - 132px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>💬</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "#1A1530" }}>{T.reviewsEmptyTitle}</h3>
              <p style={{ color: "#9B96B8", fontSize: 14, maxWidth: 260, lineHeight: 1.65 }}>{T.reviewsEmptySub}</p>
            </div>
          )}

          {tab === "analyze" && analyzeSubTab === "reviews" && reviewsLoading && (
            <div style={{ flex: 1, minHeight: "calc(100vh - 132px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 360 }}>
                {[80, 60, 75, 50, 65, 70].map((w, i) => (
                  <div key={i} style={{ height: 10, width: `${w}%`, borderRadius: 5, background: "rgba(34,197,94,0.12)", animation: `pulse 1.4s ease-in-out ${i * 0.1}s infinite` }} />
                ))}
              </div>
              <p style={{ color: "#9B96B8", fontSize: 13 }}>{T.reviewsLoading}</p>
            </div>
          )}

          {tab === "analyze" && analyzeSubTab === "reviews" && reviewsResult && (() => {
            const r = reviewsResult;
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "#1A1530" }}>{T.reviewsTitle}</h3>
                  <span style={{ fontSize: 12, color: "#9B96B8" }}>{r.reviewCount} {T.reviewsCountLabel}</span>
                </div>

                {/* Positive */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid rgba(34,197,94,0.2)", boxShadow: "0 2px 12px rgba(34,197,94,0.05)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#16A34A", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>{T.positiveTitle}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {r.positives?.map((p, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ color: "#22C55E", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>+</span>
                        <span style={{ fontSize: 13, color: "#2A2340", lineHeight: 1.6 }}>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Negative */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid rgba(239,68,68,0.2)", boxShadow: "0 2px 12px rgba(239,68,68,0.04)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#EF4444", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>{T.negativeTitle}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {r.negatives?.map((n, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ color: "#EF4444", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>−</span>
                        <span style={{ fontSize: 13, color: "#2A2340", lineHeight: 1.6 }}>{n}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Opportunities */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: `1px solid ${LT2}`, boxShadow: "0 2px 12px rgba(139,92,246,0.06)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: V1, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>{T.opportunitiesTitle}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {r.opportunities?.map((o, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ color: V1, fontWeight: 700, fontSize: 13, flexShrink: 0 }}>→</span>
                        <span style={{ fontSize: 13, color: "#2A2340", lineHeight: 1.6 }}>{o}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* AUDIT RESULTS */}
          {tab === "analyze" && analyzeSubTab === "audit" && !auditResult && !auditLoading && (
            <div style={{ flex: 1, minHeight: "calc(100vh - 132px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: `${V1}12`, border: `1px solid ${V1}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: V1 }}>🔍</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "#1A1530" }}>{T.auditEmptyTitle}</h3>
              <p style={{ color: "#9B96B8", fontSize: 14, maxWidth: 260, lineHeight: 1.65 }}>{T.auditEmptySub}</p>
            </div>
          )}

          {tab === "analyze" && analyzeSubTab === "audit" && auditLoading && (
            <div style={{ flex: 1, minHeight: "calc(100vh - 132px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 360 }}>
                {[85, 65, 50, 70, 45, 80].map((w, i) => (
                  <div key={i} style={{ height: 10, width: `${w}%`, borderRadius: 5, background: `${V1}18`, animation: `pulse 1.4s ease-in-out ${i * 0.1}s infinite` }} />
                ))}
              </div>
              <p style={{ color: "#9B96B8", fontSize: 13 }}>{T.auditLoading}</p>
            </div>
          )}

          {tab === "analyze" && analyzeSubTab === "audit" && auditResult && (() => {
            const a = auditResult.audit;
            const myColor = a.myScore >= 70 ? "#22C55E" : a.myScore >= 45 ? "#F59E0B" : "#EF4444";
            const compColor = a.competitorScore >= 70 ? "#22C55E" : a.competitorScore >= 45 ? "#F59E0B" : "#EF4444";
            const gap = (a.competitorScore || 0) - (a.myScore || 0);
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Dual score comparison */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {/* My score */}
                  <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: `2px solid ${myColor}25`, boxShadow: "0 2px 12px rgba(139,92,246,0.06)", textAlign: "center" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#9B96B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{lang === "ru" ? "МОЙ ЛИСТИНГ" : "MY LISTING"}</div>
                    <div style={{ fontSize: 52, fontWeight: 900, color: myColor, lineHeight: 1, fontFamily: "var(--font-display)" }}>{a.myScore ?? "—"}</div>
                    <div style={{ fontSize: 12, color: myColor, fontWeight: 600, marginTop: 6 }}>{a.myScoreLabel}</div>
                  </div>
                  {/* Competitor score */}
                  <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: `2px solid ${compColor}25`, boxShadow: "0 2px 12px rgba(139,92,246,0.06)", textAlign: "center" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#9B96B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{lang === "ru" ? "КОНКУРЕНТЫ" : "COMPETITORS"}</div>
                    <div style={{ fontSize: 52, fontWeight: 900, color: compColor, lineHeight: 1, fontFamily: "var(--font-display)" }}>{a.competitorScore ?? "—"}</div>
                    <div style={{ fontSize: 12, color: compColor, fontWeight: 600, marginTop: 6 }}>{a.competitorScoreLabel}</div>
                  </div>
                </div>

                {/* Score explanation */}
                <div style={{ fontSize: 11, color: "#9B96B8", textAlign: "center", lineHeight: 1.6, padding: "0 4px" }}>
                  {lang === "ru"
                    ? "⚡ Оценка отражает насыщенность ключевыми словами и соответствие рыночным стандартам платформы — не качество текста. Хорошо написанный листинг может иметь низкий SEO-score, если в нём не хватает ключевых слов которые используют топ-конкуренты."
                    : "⚡ Score reflects keyword density & marketplace fit vs top competitors — not writing quality. A well-written listing can score low if it's missing the keywords that top sellers use."}
                </div>

                {/* Gap summary */}
                {a.gapSummary && (
                  <div style={{ background: gap > 20 ? "rgba(239,68,68,0.04)" : gap > 0 ? "rgba(245,158,11,0.04)" : "rgba(34,197,94,0.04)", borderRadius: 16, padding: 20, border: `1px solid ${gap > 20 ? "rgba(239,68,68,0.15)" : gap > 0 ? "rgba(245,158,11,0.15)" : "rgba(34,197,94,0.15)"}`, boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: gap > 20 ? "#EF4444" : gap > 0 ? "#F59E0B" : "#22C55E", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
                      {gap > 0 ? (lang === "ru" ? `GAP: −${gap} ОЧКОВ` : `GAP: −${gap} POINTS`) : (lang === "ru" ? "ВЫ ВПЕРЕДИ" : "YOU'RE AHEAD")}
                    </div>
                    <p style={{ fontSize: 13, color: "#2A2340", lineHeight: 1.7 }}>{a.gapSummary}</p>
                  </div>
                )}

                {/* Pages analyzed */}
                <div style={{ fontSize: 11, color: "#9B96B8", textAlign: "center" }}>
                  {auditResult.pagesAnalyzed} {T.analyzedPages}
                </div>

                {/* Keywords */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: `1px solid ${LT2}`, boxShadow: "0 2px 12px rgba(139,92,246,0.06)" }}>
                    <div style={{ fontSize: 11, color: "#9B96B8", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>{T.topKeywords}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {a.topKeywords?.map((kw, i) => (
                        <span key={i} style={{ padding: "4px 10px", borderRadius: 100, background: `${V1}0A`, border: `1px solid ${V1}18`, color: V2, fontSize: 12, fontWeight: 600 }}>{kw}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #FEE2E2", boxShadow: "0 2px 12px rgba(239,68,68,0.04)" }}>
                    <div style={{ fontSize: 11, color: "#EF4444", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>{T.missingKeywords}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {a.missingKeywords?.map((kw, i) => (
                        <span key={i} style={{ padding: "4px 10px", borderRadius: 100, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", fontSize: 12, fontWeight: 600 }}>{kw}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Competitor strengths */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: `1px solid ${LT2}`, boxShadow: "0 2px 12px rgba(139,92,246,0.06)" }}>
                  <div style={{ fontSize: 11, color: "#9B96B8", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>{T.strengthsTitle}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {a.competitorStrengths?.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 12 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 8, background: `${V1}10`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: V1, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1330", marginBottom: 3 }}>{s.point}</div>
                          <div style={{ fontSize: 12, color: "#9B96B8", fontStyle: "italic" }}>{s.example}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upgrade to Improve CTA */}
                <div style={{ background: `linear-gradient(135deg, ${V1}12, ${V2}08)`, borderRadius: 16, padding: 20, border: `1px solid ${V1}25`, textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#F5F3FF", marginBottom: 6 }}>
                    {lang === "ru" ? "Хочешь знать КАК закрыть этот разрыв?" : "Want to know exactly HOW to close this gap?"}
                  </div>
                  <div style={{ fontSize: 12, color: "#9B96B8", marginBottom: 14, lineHeight: 1.6 }}>
                    {lang === "ru" ? "Вкладка Improve раскрывает полный план действий — что убить, что усилить, что сделает листинг непобедимым." : "The Improve tab unlocks the full action plan — what to cut, what to amplify, what makes a listing unbeatable."}
                  </div>
                  <button onClick={() => { setTab("improve"); setImproveSubTab("listing"); loadHistory(); setSelectedHistoryItem(null); setImproveResult(null); }}
                    style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${V1}, ${V2})`, color: "#fff", fontWeight: 700, fontSize: 13, boxShadow: `0 2px 12px ${V1}35` }}>
                    {lang === "ru" ? "✦ Открыть Improve" : "✦ Go to Improve"}
                  </button>
                </div>

              </div>
            );
          })()}

          {tab === "create" && subTab === "single" && !results && !loading && (
            <div style={{
              flex: 1, minHeight: "calc(100vh - 132px)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14,
              textAlign: "center",
            }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: `${V1}12`, border: `1px solid ${V1}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: V1 }}>✦</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "#1A1530" }}>{T.emptyTitle}</h3>
              <p style={{ color: "#9B96B8", fontSize: 14, maxWidth: 260, lineHeight: 1.65 }}>{T.emptySub}</p>
            </div>
          )}

          {tab === "create" && subTab === "single" && loading && (
            <div style={{
              flex: 1, minHeight: "calc(100vh - 132px)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20,
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 360 }}>
                {[90, 75, 60, 45, 80, 55].map((w, i) => (
                  <div key={i} style={{ height: 10, width: `${w}%`, borderRadius: 5, background: `${V1}18`, animation: `pulse 1.4s ease-in-out ${i * 0.1}s infinite` }} />
                ))}
              </div>
              <p style={{ color: "#9B96B8", fontSize: 13 }}>{T.writingMsg}</p>
            </div>
          )}

          {tab === "create" && subTab === "single" && results && (
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
                  <div style={{ padding: "24px", minHeight: 200 }}>
                    {(() => {
                      const titleMatch = activeResult.match(/^(?:TITLE|ЗАГОЛОВОК):\s*(.+)/m);
                      const title = titleMatch ? titleMatch[1].trim() : null;
                      const body = activeResult.replace(/^(?:TITLE|ЗАГОЛОВОК):\s*.+\n?/m, "").trim();
                      return (
                        <>
                          {title && (
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#9B96B8", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Title</div>
                          )}
                          {title && (
                            <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1330", marginBottom: 16, lineHeight: 1.4 }}>{title}</div>
                          )}
                          {title && <div style={{ height: 1, background: "#EDE9F8", marginBottom: 16 }} />}
                          <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#2A2340", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                            {body}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <div style={{ padding: "12px 20px", borderTop: `1px solid ${LT2}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#B0AACC" }}>{selectedPlatforms.length} {T.platforms}</span>
                    <button onClick={generate} style={{
                      padding: "6px 14px", borderRadius: 8, border: `1px solid ${V1}20`,
                      background: "transparent", color: V2, fontSize: 12, fontWeight: 600,
                    }}>
                      {T.regenBtn}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* HISTORY FLOATING TRIGGER */}
      <style>{`
        .history-trigger { transition: transform 0.28s cubic-bezier(0.4,0,0.2,1); transform: translateX(calc(100% - 36px)); }
        .history-trigger:hover, .history-trigger.open { transform: translateX(0); }
      `}</style>
      <div
        onClick={() => { setHistoryTab(!historyTab); if (!historyTab) loadHistory(); }}
        className={"history-trigger" + (historyTab ? " open" : "")}
        style={{
          position: "fixed", right: 0, top: 14,
          zIndex: 150, cursor: "pointer",
          display: "flex", alignItems: "center",
          background: `linear-gradient(135deg, ${V1}, ${V2})`,
          borderRadius: "10px 0 0 10px",
          boxShadow: `-3px 4px 20px ${V1}50`,
          padding: "7px 10px 7px 12px",
          gap: 8,
        }}
      >
        {/* Two-tone clock icon */}
        <svg width="18" height="18" viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="9" stroke="#E8DFFF" strokeWidth="1.8" fill="none" opacity="0.9"/>
          <circle cx="11" cy="11" r="9" stroke={V3} strokeWidth="1.8" fill="none" strokeDasharray="28 28" strokeDashoffset="14"/>
          <line x1="11" y1="11" x2="11" y2="6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="11" y1="11" x2="15" y2="13" stroke={V3} strokeWidth="1.8" strokeLinecap="round"/>
          <circle cx="11" cy="11" r="1.2" fill="#fff"/>
        </svg>
        <span style={{ color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
          {T.historyTab}
        </span>
      </div>

      {/* HISTORY PANEL — slide-over */}
      {historyTab && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex" }}>
          {/* Backdrop */}
          <div onClick={() => setHistoryTab(false)} style={{ flex: 1, background: "rgba(0,0,0,0.5)" }} />
          {/* Panel */}
          <div style={{ width: 420, background: "#1C1830", borderLeft: `1px solid ${V1}20`, display: "flex", flexDirection: "column", overflowY: "hidden" }}>
            {/* Header */}
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${V1}15`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "#F5F3FF" }}>🕐 {T.historyTab}</h2>
              <button onClick={() => setHistoryTab(false)} style={{ background: "none", border: "none", color: "#6D628F", fontSize: 20, cursor: "pointer" }}>×</button>
            </div>
            {/* Items */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              {historyLoading && (
                <div style={{ textAlign: "center", color: "#6D628F", paddingTop: 40 }}>Loading...</div>
              )}
              {!historyLoading && historyItems.length === 0 && (
                <div style={{ textAlign: "center", paddingTop: 60 }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
                  <div style={{ color: "#F5F3FF", fontWeight: 700, fontSize: 15 }}>{T.historyEmpty}</div>
                  <div style={{ color: "#6D628F", fontSize: 13, marginTop: 6 }}>{T.historyEmptySub}</div>
                </div>
              )}
              {historyItems.map(item => (
                <div key={item.id} style={{ background: `${V1}08`, borderRadius: 12, padding: "14px 16px", border: `1px solid ${V1}15` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: V3, letterSpacing: "0.08em", textTransform: "uppercase", background: `${V1}15`, padding: "2px 8px", borderRadius: 4 }}>
                        {T.historyTypes[item.type] || item.type}
                      </span>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#E8E5F5", marginTop: 6 }}>
                        {item.product || (item.type === "reviews" ? "Review Analysis" : item.type === "gap" ? "Gap Analysis" : "—")}
                      </div>
                      {item.platforms && (
                        <div style={{ fontSize: 11, color: "#6D628F", marginTop: 3 }}>
                          {item.platforms.join(", ")}
                        </div>
                      )}
                      <div style={{ fontSize: 10, color: "#5A5478", marginTop: 4 }}>
                        {new Date(item.created_at).toLocaleDateString(lang === "ru" ? "ru-RU" : "en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    <button onClick={() => deleteHistory(item.id)} style={{ background: "none", border: "none", color: "#4A4768", fontSize: 16, cursor: "pointer", padding: "4px" }}>🗑</button>
                  </div>
                  {/* Reuse button */}
                  {item.type === "generate" && item.input && (
                    <button onClick={() => {
                      setProduct(item.input.product || "");
                      setFeatures(item.input.features || "");
                      setSelectedPlatforms(item.platforms || []);
                      setTab("create");
                      setSubTab("single");
                      setHistoryTab(false);
                    }} style={{ fontSize: 12, color: V3, background: "none", border: `1px solid ${V1}25`, borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontWeight: 600 }}>
                      ↩ {T.historyReuse}
                    </button>
                  )}
                  {item.type === "gap" && item.input && (
                    <button onClick={() => {
                      setAuditUrls(item.input.urls || "");
                      setMyListing(item.input.myListing || "");
                      setTab("analyze");
                      setAnalyzeSubTab("audit");
                      setHistoryTab(false);
                    }} style={{ fontSize: 12, color: V3, background: "none", border: `1px solid ${V1}25`, borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontWeight: 600 }}>
                      ↩ {T.historyReuse}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
