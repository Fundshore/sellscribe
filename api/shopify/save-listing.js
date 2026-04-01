// api/shopify/save-listing.js
// Saves generated description back to a Shopify product

import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { shop, productId, description, title } = req.body;

  if (!shop || !productId || !description) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Get access token from Supabase
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

    // Update product description via Shopify Admin API
    const updateRes = await fetch(
      `https://${shop}/admin/api/2025-04/products/${productId}.json`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": store.access_token,
        },
        body: JSON.stringify({
          product: {
            id: productId,
            body_html: description,
            ...(title && { title }),
          },
        }),
      }
    );

    const updateData = await updateRes.json();

    if (!updateRes.ok) {
      return res.status(updateRes.status).json({ error: updateData.errors });
    }

    res.status(200).json({ success: true, product: updateData.product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
