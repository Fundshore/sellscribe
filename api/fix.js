export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { myListing, myName, platform, analyzeResult, lang } = req.body;
  if (!myListing || !analyzeResult) {
    return res.status(400).json({ error: "Missing listing or analysis" });
  }

  const isRu = lang === "ru";

  const prompt = `You are an expert e-commerce copywriter. Rewrite the listing to fix all identified issues and beat the competition.

Platform: ${platform}
${myName ? `Product: ${myName}` : ""}

ORIGINAL LISTING:
${myListing}

ISSUES TO FIX:
${JSON.stringify(analyzeResult.issues || [])}

COMPETITOR STRENGTHS TO INCORPORATE:
${JSON.stringify(analyzeResult.competitorStrengths || [])}

Rewrite the listing. Make it significantly better. Be specific and concrete.

IMPORTANT: For each "fix", use "fragment" that is an EXACT substring from the FIXED listing (the new text you wrote). This is used to highlight what changed.

Respond ONLY in valid JSON, no markdown:
{
  "fixedTitle": "<improved product title for ${platform}>",
  "fixedBody": "<improved full listing body text>",
  "fixes": [
    {
      "fragment": "<exact substring from fixedBody or fixedTitle that was added/improved>",
      "reason": "<why this specific change helps. ${isRu ? "In Russian." : "In English."}>"
    }
  ],
  "summary": "<2-3 sentences explaining the main improvements and why they will help sales. ${isRu ? "In Russian." : "In English."}>"
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
        max_tokens: 2000,
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
