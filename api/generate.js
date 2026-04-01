export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { product, features, platforms, tone } = req.body;

  if (!product || !platforms || platforms.length === 0) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const PLATFORM_INSTRUCTIONS = {
    amazon: `Amazon listing: Write exactly 5 bullet points. Start each with "•". Title max 200 chars, each bullet max 80 chars. Focus on specs, keywords, benefits. Tone: professional, keyword-dense. Format:
TITLE: [title here]
• [bullet 1]
• [bullet 2]
• [bullet 3]
• [bullet 4]
• [bullet 5]`,

    shopify: `Shopify product description: Write 2-3 SEO paragraphs optimised for Google search. Conversational but persuasive. Include natural keywords. Title max 60 chars. Format:
TITLE: [title here]
[paragraph 1]
[paragraph 2]
[paragraph 3 optional]`,

    etsy: `Etsy listing: Write a warm, personal storytelling description. Mention handcrafted/artisan quality, sustainability if relevant. Include exactly 13 comma-separated tags at the end. Title max 140 chars. Format:
TITLE: [title here]
[storytelling description 3-4 sentences]
TAGS: tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10, tag11, tag12, tag13`,

    ebay: `eBay listing: Write a factual, condition-focused description. Include a spec table format. Mention condition (NEW). Title max 80 chars. Format:
TITLE: [title here]
Condition: New
[Key specs as: Spec: Value, one per line]
[1-2 sentence description]`,

    wildberries: `Wildberries листинг: Пиши ТОЛЬКО на русском языке. 4-5 коротких буллетов с характеристиками. Заголовок максимум 100 знаков. Тон прямой, по функциям. Формат:
ЗАГОЛОВОК: [заголовок здесь]
• [характеристика 1]
• [характеристика 2]
• [характеристика 3]
• [характеристика 4]
• [характеристика 5 опционально]`,

    kaspi: `Kaspi.kz листинг: Пиши ТОЛЬКО на русском языке. Краткое описание + таблица технических характеристик. Заголовок максимум 60 знаков. Тон технический, конкретный. Формат:
ЗАГОЛОВОК: [заголовок здесь]
[1-2 предложения описания]
Характеристики:
Тип: [значение]
Материал: [значение]
[другие характеристики]`,
  };

  const TONES = {
    professional: "professional and trustworthy",
    friendly: "friendly and approachable",
    luxury: "premium, luxury and exclusive",
    casual: "casual and conversational",
  };

  const toneDesc = TONES[tone] || TONES.professional;

  const platformInstructions = platforms
    .map((p) => `[PLATFORM: ${p.toUpperCase()}]\n${PLATFORM_INSTRUCTIONS[p]}\n[END: ${p.toUpperCase()}]`)
    .join("\n\n");

  const prompt = `You are an expert e-commerce copywriter. Generate optimised product listings for the following platforms.

Product: ${product}
${features ? `Key features/details: ${features}` : ""}
Overall tone: ${toneDesc}

Generate a listing for EACH platform below. Follow the exact format for each. Output them in the same order. Do not add commentary between listings.

${platformInstructions}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.error?.message || "API error" });
    }

    const data = await response.json();
    const text = data.content[0].text;

    const results = {};
    const enPlats = platforms.filter(p => !["wildberries", "kaspi"].includes(p));
    const ruPlats = platforms.filter(p => ["wildberries", "kaspi"].includes(p));

    const sections = text.split(/(?=(?:^|\n)(?:TITLE:|ЗАГОЛОВОК:))/m).filter(s => s.trim());

    let enIdx = 0;
    let ruIdx = 0;

    sections.forEach(section => {
      const s = section.trim();
      if (!s) return;
      if (s.startsWith("TITLE:") && enIdx < enPlats.length) {
        results[enPlats[enIdx]] = s;
        enIdx++;
      } else if (s.startsWith("ЗАГОЛОВОК:") && ruIdx < ruPlats.length) {
        results[ruPlats[ruIdx]] = s;
        ruIdx++;
      }
    });

    if (Object.keys(results).length === 0) {
      results[platforms[0]] = text;
    }

    return res.status(200).json({ results });
  } catch (err) {
    return res.status(500).json({ error: "Server error: " + err.message });
  }
}
