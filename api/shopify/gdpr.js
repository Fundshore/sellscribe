// Shopify GDPR mandatory webhooks
// https://shopify.dev/docs/apps/build/privacy-law-compliance

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const topic = req.headers["x-shopify-topic"];

  // All three GDPR webhooks:
  // customers/data_request - customer asks merchant for their data
  // customers/redact - customer asks merchant to delete their data  
  // shop/redact - merchant uninstalls app, delete their data

  if (topic === "customers/data_request") {
    // SellScribe does not store end-customer data
    // We only store merchant product listing data
    // Nothing to return
    return res.status(200).json({ acknowledged: true });
  }

  if (topic === "customers/redact") {
    // SellScribe does not store end-customer data
    // Nothing to delete
    return res.status(200).json({ acknowledged: true });
  }

  if (topic === "shop/redact") {
    // Merchant uninstalled — delete their data from Supabase
    const shop = req.body?.shop_domain;
    if (shop) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_KEY
        );
        await supabase.from("shopify_stores").delete().eq("shop", shop);
        await supabase.from("history").delete().eq("shop", shop);
      } catch (err) {
        console.error("GDPR shop/redact error:", err.message);
      }
    }
    return res.status(200).json({ acknowledged: true });
  }

  return res.status(200).json({ acknowledged: true });
}
