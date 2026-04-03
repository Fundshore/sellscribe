export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { reviews, productName, lang } = req.body;

  if (!reviews || reviews.trim().length < 20) {
    return res.status(400).json({ error: "No reviews text provided" });
  }

  const isRu = lang === "ru";

  const prompt = `You are an expert e-commerce product analyst specializing in customer sentiment analysis.

${productName ? `Product: ${productName}` : ""}

CUSTOMER REVIEWS TO ANALYZE:
${reviews.slice(0, 6000)}

Analyze these reviews and extract actionable insights. Count approximately how many reviews were provided.

Respond ONLY in valid JSON, no markdown:
{
  "reviewCount": <approximate number of reviews analyzed>,
  "positives": [
    ${isRu ? '"что хвалят покупатели — конкретный аспект продукта"' : '"specific thing customers praise — concrete product aspect"'},
    ${isRu ? '"ещё один позитивный аспект"' : '"another positive aspect"'},
    ${isRu ? '"ещё один позитивный аспект"' : '"another positive aspect"'},
    ${isRu ? '"ещё один"' : '"another one"'},
    ${isRu ? '"ещё один"' : '"another one"'}
  ],
  "negatives": [
    ${isRu ? '"на что жалуются — конкретная проблема"' : '"specific complaint — concrete problem"'},
    ${isRu ? '"ещё одна жалоба"' : '"another complaint"'},
    ${isRu ? '"ещё одна жалоба"' : '"another complaint"'},
    ${isRu ? '"ещё одна"' : '"another one"'},
    ${isRu ? '"ещё одна"' : '"another one"'}
  ],
  "opportunities": [
    ${isRu ? '"конкретная рекомендация как сделать ваш продукт лучше конкурента"' : '"specific recommendation to make your product better than competitor"'},
    ${isRu ? '"ещё одна рекомендация"' : '"another recommendation"'},
    ${isRu ? '"ещё одна рекомендация"' : '"another recommendation"'},
    ${isRu ? '"ещё одна"' : '"another one"'},
    ${isRu ? '"ещё одна"' : '"another one"'}
  ]
}

Rules:
- positives: what customers genuinely love (5 specific points)
- negatives: real complaints and pain points (5 specific points)  
- opportunities: concrete actionable ways to beat this competitor (5 specific points)
- Be specific, not generic. Use exact details from the reviews.
- ${isRu ? "Отвечай на русском языке" : "Respond in English"}`;

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
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.error?.message || "API error" });
    }

    const data = await response.json();
    const text = data.content[0].text.trim();

    let result;
    try {
      const clean = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
      result = JSON.parse(clean);
    } catch {
      return res.status(500).json({ error: "Failed to parse analysis. Please try again." });
    }

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: "Server error: " + err.message });
  }
}
