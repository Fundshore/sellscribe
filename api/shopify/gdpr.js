import crypto from "crypto";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const rawBody = await getRawBody(req);
  const hmacHeader = req.headers["x-shopify-hmac-sha256"];

  if (!hmacHeader || !process.env.SHOPIFY_CLIENT_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const digest = crypto
    .createHmac("sha256", process.env.SHOPIFY_CLIENT_SECRET)
    .update(rawBody)
    .digest("base64");

  let valid = false;
  try {
    valid = crypto.timingSafeEqual(
      Buffer.from(digest, "base64"),
      Buffer.from(hmacHeader, "base64")
    );
  } catch {
    valid = false;
  }

  if (!valid) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const body = JSON.parse(rawBody.toString());
  const topic = req.headers["x-shopify-topic"];

  if (topic === "customers/data_request" || topic === "customers/redact") {
    return res.status(200).json({ acknowledged: true });
  }

  if (topic === "shop/redact") {
    const shop = body?.shop_domain;
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
