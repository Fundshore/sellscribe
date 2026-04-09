import crypto from "crypto";

function verifyHmac(req) {
  const hmacHeader = req.headers["x-shopify-hmac-sha256"];
  if (!hmacHeader || !process.env.SHOPIFY_CLIENT_SECRET) return false;
  const body = JSON.stringify(req.body);
  const digest = crypto
    .createHmac("sha256", process.env.SHOPIFY_CLIENT_SECRET)
    .update(body, "utf8")
    .digest("base64");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  if (!verifyHmac(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const topic = req.headers["x-shopify-topic"];

  if (topic === "customers/data_request") {
    return res.status(200).json({ acknowledged: true });
  }

  if (topic === "customers/redact") {
    return res.status(200).json({ acknowledged: true });
  }

  if (topic === "shop/redact") {
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
