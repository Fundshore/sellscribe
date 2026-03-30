import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verify webhook signature
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

  // Plan limits
  const PLAN_LIMITS = {
    growth: 100,
    pro: 500,
    agency: 999999,
  };

  const VARIANT_TO_PLAN = {
    [process.env.LEMONSQUEEZY_GROWTH_VARIANT]: "growth",
    [process.env.LEMONSQUEEZY_PRO_VARIANT]: "pro",
    [process.env.LEMONSQUEEZY_AGENCY_VARIANT]: "agency",
  };

  try {
    // Import Supabase
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    if (event === "order_created" || event === "subscription_created") {
      const email = data?.attributes?.user_email;
      const variantId = String(data?.attributes?.first_order_item?.variant_id ||
                               data?.attributes?.variant_id);
      const plan = VARIANT_TO_PLAN[variantId] || "growth";
      const limit = PLAN_LIMITS[plan] || 100;

      if (!email) return res.status(400).json({ error: "No email" });

      // Find user by email and update their plan
      const { data: users } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (users) {
        await supabase
          .from("profiles")
          .update({
            plan: plan,
            generations_limit: limit,
            generations_used: 0, // reset counter on upgrade
          })
          .eq("id", users.id);
      }
    }

    if (event === "subscription_cancelled" || event === "subscription_expired") {
      const email = data?.attributes?.user_email;
      if (email) {
        await supabase
          .from("profiles")
          .update({ plan: "free", generations_limit: 10 })
          .eq("email", email);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
