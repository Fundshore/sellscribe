// api/shopify/products.js
// Returns product list for a shop

import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const { shop } = req.query;

  if (!shop) return res.status(400).json({ error: "Missing shop" });

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { data: store } = await supabase
      .from("shopify_stores")
      .select("access_token")
      .eq("shop", shop)
      .single();

    if (!store?.access_token) {
      return res.status(401).json({ error: "Shop not authenticated" });
    }

    const productsRes = await fetch(
      `https://${shop}/admin/api/2025-04/products.json?limit=50&fields=id,title`,
      {
        headers: { "X-Shopify-Access-Token": store.access_token },
      }
    );

    const data = await productsRes.json();
    res.status(200).json({ products: data.products || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
