export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { urls, myListing, platform, productName } = req.body;

  if (!urls || urls.length === 0) {
    return res.status(400).json({ error: "No URLs provided" });
  }

  const fetchPage = async (url) => {
    try {
      const r = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: AbortSignal.timeout(8000),
      });
      const html = await r.text();
      const text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 3000);
      return text;
    } catch (e) {
      return null;
    }
  };

  const pageTexts = await Promise.all(urls.slice(0, 5).map(fetchPage));
  const validPages = pageTexts.filter(Boolean);

  if (validPages.length === 0) {
    return res.status(400).json({ error: "Could not fetch any of the provided URLs. Please check the links and try again." });
  }

  const competitorContent = validPages
    .map((text, i) => `--- COMPETITOR ${i + 1} ---\n${text}`)
    .join("\n\n");

  const prompt = `You are an expert e-commerce listing analyst. Score and compare listings honestly. Keep detailed fix recommendations reserved — give direction without the full recipe. Make the user feel the gap so they want to act.

${productName ? `Product: ${productName}` : ""}
Platform: ${platform || "general e-commerce"}

COMPETITOR LISTINGS:
${competitorContent}

${myListing ? `MY LISTING:\n${myListing}\n` : "No listing provided — score as 0, analyze competitors only."}

Respond ONLY in valid JSON, no markdown, no extra text:
{
  "myScore": <0-100, honest score for my listing. 0 if none provided>,
  "competitorScore": <0-100, average score for competitors>,
  "myScoreLabel": "<2-4 words: e.g. 'Needs major work', 'Decent but beatable', 'Strong contender'>",
  "competitorScoreLabel": "<2-4 words: e.g. 'Highly optimized', 'Well structured', 'Average quality'>",
  "topKeywords": [<array of 8-10 most important keywords from competitor listings>],
  "missingKeywords": [<array of 5-7 keywords competitors use that are missing from my listing, or top missing opportunities>],
  "gapSummary": "<2-3 sentences. What is the overall gap? Where are competitors clearly ahead? Speak to the urgency — no step-by-step fixes, just the honest picture of what's being lost.>",
  "competitorStrengths": [
    {"point": "<area where competitors are stronger>", "example": "<brief example from their listing>"},
    {"point": "<area>", "example": "<example>"},
    {"point": "<area>", "example": "<example>"}
  ]
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
        max_tokens: 1500,
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

    return res.status(200).json({ audit: result, pagesAnalyzed: validPages.length });
  } catch (err) {
    return res.status(500).json({ error: "Server error: " + err.message });
  }
}
