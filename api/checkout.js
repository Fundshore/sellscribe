export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { plan, email } = req.body;

  if (!plan || !email) {
    return res.status(400).json({ error: "Missing plan or email" });
  }

  const VARIANT_IDS = {
    growth: process.env.LEMONSQUEEZY_GROWTH_VARIANT,
    pro:    process.env.LEMONSQUEEZY_PRO_VARIANT,
    agency: process.env.LEMONSQUEEZY_AGENCY_VARIANT,
  };

  const variantId = VARIANT_IDS[plan.toLowerCase()];
  if (!variantId) {
    return res.status(400).json({ error: "Invalid plan" });
  }

  try {
    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        "Accept": "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        "Authorization": `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email: email,
            },
            product_options: {
              redirect_url: "https://sellscribe.app/generate",
            },
          },
          relationships: {
            store: {
              data: {
                type: "stores",
                id: String(process.env.LEMONSQUEEZY_STORE_ID),
              },
            },
            variant: {
              data: {
                type: "variants",
                id: String(variantId),
              },
            },
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data?.errors?.[0]?.detail || "Checkout error" });
    }

    const checkoutUrl = data?.data?.attributes?.url;
    if (!checkoutUrl) {
      return res.status(500).json({ error: "No checkout URL returned" });
    }

    return res.status(200).json({ url: checkoutUrl });
  } catch (err) {
    return res.status(500).json({ error: "Server error: " + err.message });
  }
}
