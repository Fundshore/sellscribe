import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const { code, shop, hmac, state } = req.query;

  if (!code || !shop) {
    return res.status(400).json({ error: "Missing code or shop" });
  }

  try {
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_CLIENT_ID,
        client_secret: process.env.SHOPIFY_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    console.log("Token response:", JSON.stringify(tokenData));

    if (!tokenData.access_token) {
      return res.status(400).json({ error: "Failed to get access token", data: tokenData });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { error: dbError } = await supabase.from("shopify_stores").upsert({
      shop,
      access_token: tokenData.access_token,
      installed_at: new Date().toISOString(),
    });

    if (dbError) {
      return res.status(500).json({ error: "DB error", details: dbError });
    }

    // Register mandatory GDPR webhooks
    const gdprTopics = [
      "customers/data_request",
      "customers/redact",
      "shop/redact",
    ];

    for (const topic of gdprTopics) {
      await fetch(`https://${shop}/admin/api/2025-04/webhooks.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": tokenData.access_token,
        },
        body: JSON.stringify({
          webhook: {
            topic,
            address: "https://sellscribe.app/api/shopify/gdpr",
            format: "json",
          },
        }),
      });
    }

    res.redirect(`https://sellscribe.app/shopify?shop=${shop}`);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
