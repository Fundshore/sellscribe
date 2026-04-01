// api/shopify/callback.js
// Step 2: Shopify redirects back with ?code=...&shop=...
// We exchange code for access_token and save it

import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const { code, shop, hmac, state } = req.query;

  if (!code || !shop) {
    return res.status(400).json({ error: "Missing code or shop" });
  }

  try {
    // Exchange code for access token
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

    if (!tokenData.access_token) {
      return res.status(400).json({ error: "Failed to get access token" });
    }

    // Save shop + token to Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    await supabase.from("shopify_stores").upsert({
      shop,
      access_token: tokenData.access_token,
      installed_at: new Date().toISOString(),
    });

    // Redirect merchant to the embedded app
    res.redirect(`https://${shop}/admin/apps/${process.env.SHOPIFY_CLIENT_ID}`);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
