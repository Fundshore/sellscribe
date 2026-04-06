export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { myListing, myName, analyzeResult, lang } = req.body;
  if (!myListing || !analyzeResult) return res.status(400).json({ error: "Missing listing or analysis" });

  const isRu = lang === "ru";

  const prompt = `You are an expert e-commerce copywriter. Rewrite and structure this listing to fix all identified issues.

Product: ${myName || "unknown"}

ORIGINAL LISTING (raw input):
${myListing}

ISSUES TO FIX:
${JSON.stringify(analyzeResult.issues || [])}

COMPETITOR STRENGTHS TO INCORPORATE:
${JSON.stringify(analyzeResult.competitorStrengths || [])}

Rewrite the listing into a clean, well-structured format. Separate the content into logical sections based on what you detect in the original (title, description, bullet points, specs/characteristics, etc).

IMPORTANT RULES:
- "fragment" in fixes must be an EXACT substring from fixedBody or fixedTitle
- Write all content in ${isRu ? "Russian" : "English"}
- Make the structure clean and readable regardless of how messy the input was
- For marketplaces like Wildberries/Kaspi include a proper characteristics section if specs are present
- For Amazon-style listings use bullet points

Respond ONLY in valid JSON, no markdown:
{
  "fixedTitle": "<clean optimized product title>",
  "fixedSections": [
    { "type": "bullets", "label": "${isRu ? "Ключевые преимущества" : "Key Features"}", "items": ["<bullet 1>", "<bullet 2>", "..."] },
    { "type": "description", "label": "${isRu ? "Описание" : "Description"}", "content": "<paragraph text>" },
    { "type": "specs", "label": "${isRu ? "Характеристики" : "Specifications"}", "items": ["<Param: Value>", "..."] }
  ],
  "fixedBody": "<full fixed listing as plain text, all sections combined, ready to paste>",
  "fixes": [
    { "fragment": "<exact substring from fixedBody or fixedTitle>", "reason": "<why this change helps. ${isRu ? "In Russian." : "In English."}>" }
  ],
  "summary": "<2-3 sentences: main improvements made and why they will help sales. ${isRu ? "In Russian." : "In English."}>"
}`;

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
        max_tokens: 2500,
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
      return res.status(500).json({ error: "Failed to parse fix. Please try again." });
    }

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: "Server error: " + err.message });
  }
}
