import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { shop } = req.query;
    if (!shop) return res.status(400).json({ error: "Missing shop" });
    const { data, error } = await supabase
      .from("history").select("*").eq("shop", shop)
      .order("created_at", { ascending: false }).limit(50);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ items: data || [] });
  }

  if (req.method === "POST") {
    const { shop, type, product, productId, input, output } = req.body;
    if (!shop) return res.status(400).json({ error: "Missing shop" });
    const { error } = await supabase.from("history").insert({
      shop, type, product,
      product_id: productId,
      input: input || null,
      output,
    });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    const { id, shop } = req.query;
    if (!id || !shop) return res.status(400).json({ error: "Missing id or shop" });
    const { error } = await supabase.from("history").delete().eq("id", id).eq("shop", shop);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
