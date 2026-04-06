export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { myListing, myName, competitors, lang } = req.body;
  if (!myListing) return res.status(400).json({ error: "Missing listing" });

  const validComps = (competitors || []).filter(c => c && c.trim());
  const hasCompetitors = validComps.length > 0;
  const isRu = lang === "ru";

  const prompt = hasCompetitors
    ? `You are an expert e-commerce listing analyst. Be honest and direct.

${myName ? `Product: ${myName}` : ""}

MY LISTING:
${myListing}

COMPETITOR LISTINGS:
${validComps.map((c, i) => `--- Competitor ${i + 1} ---\n${c}`).join("\n\n")}

Analyze MY listing vs competitors. Score both. Find where MY listing loses.

For each issue, "fragment" must be an EXACT substring from MY listing, or null if general.

Respond ONLY in valid JSON, no markdown:
{
  "score": <0-100>,
  "competitorScore": <0-100>,
  "scoreLabel": "<2-4 words>",
  "issues": [{"fragment": "<exact text or null>", "problem": "<1-2 sentences. ${isRu ? "In Russian." : "In English."}>", "severity": "high"|"medium"|"low"}],
  "competitorStrengths": ["<specific thing. ${isRu ? "In Russian." : "In English."}>"],
  "summary": "<2-3 sentences about the gap. ${isRu ? "In Russian." : "In English."}>"
}`
    : `You are an expert e-commerce listing analyst. Evaluate this listing on its own merits.

${myName ? `Product: ${myName}` : ""}

LISTING TO ANALYZE:
${myListing}

Score this listing across: keyword density, title quality, description clarity, persuasiveness, structure, completeness.

For each issue, "fragment" must be an EXACT substring from the listing, or null if general.

Respond ONLY in valid JSON, no markdown:
{
  "score": <0-100, overall quality score>,
  "competitorScore": null,
  "scoreLabel": "<2-4 words describing quality>",
  "issues": [{"fragment": "<exact text or null>", "problem": "<specific improvement needed. ${isRu ? "In Russian." : "In English."}>", "severity": "high"|"medium"|"low"}],
  "competitorStrengths": [],
  "summary": "<2-3 sentences: honest assessment of listing strengths and main areas to improve. ${isRu ? "In Russian." : "In English."}>"
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
      return res.status(500).json({ error: "Failed to parse analysis. Please try again." });
    }

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: "Server error: " + err.message });
  }
}
