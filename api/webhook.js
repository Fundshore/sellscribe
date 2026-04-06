import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  const signature = req.headers["x-signature"];

  if (secret && signature) {
    const hmac = crypto.createHmac("sha256", secret);
    const body = JSON.stringify(req.body);
    const digest = hmac.update(body).digest("hex");
    if (digest !== signature) {
      return res.status(401).json({ error: "Invalid signature" });
    }
  }

  const event = req.headers["x-event-name"];
  const data = req.body?.data;

  if (!data) return res.status(400).json({ error: "No data" });

  // Plan limits: analyze_limit, fix_limit
  const PLAN_LIMITS = {
    starter: { analyze: 50,  fix: 20  },
    pro:     { analyze: 200, fix: 75  },
    agency:  { analyze: 500, fix: 200 },
  };

  const VARIANT_TO_PLAN = {
    [process.env.LEMONSQUEEZY_GROWTH_VARIANT]:  "starter",
    [process.env.LEMONSQUEEZY_PRO_VARIANT]:     "pro",
    [process.env.LEMONSQUEEZY_AGENCY_VARIANT]:  "agency",
  };

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    if (event === "order_created" || event === "subscription_created") {
      const email = data?.attributes?.user_email;
      const variantId = String(
        data?.attributes?.first_order_item?.variant_id ||
        data?.attributes?.variant_id
      );
      const plan = VARIANT_TO_PLAN[variantId] || "starter";
      const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.starter;

      if (!email) return res.status(400).json({ error: "No email" });

      const { data: user } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (user) {
        await supabase
          .from("profiles")
          .update({
            plan,
            analyze_limit: limits.analyze,
            generations_limit: limits.fix,
            audits_used: 0,
            generations_used: 0,
          })
          .eq("id", user.id);
      }
    }

    if (event === "subscription_cancelled" || event === "subscription_expired") {
      const email = data?.attributes?.user_email;
      if (email) {
        await supabase
          .from("profiles")
          .update({
            plan: "free",
            analyze_limit: 5,
            generations_limit: 2,
          })
          .eq("email", email);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
