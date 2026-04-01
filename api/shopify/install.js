// api/shopify/install.js
// Step 1: Merchant clicks "Install" in App Store
// Shopify redirects to: /api/shopify/install?shop=store.myshopify.com

export default function handler(req, res) {
  const { shop } = req.query;

  if (!shop || !shop.endsWith(".myshopify.com")) {
    return res.status(400).json({ error: "Invalid shop parameter" });
  }

  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const redirectUri = "https://sellscribe.app/api/shopify/callback";
  const scopes = "write_products,read_products";
  const state = Buffer.from(Math.random().toString()).toString("base64");

  const authUrl =
    `https://${shop}/admin/oauth/authorize` +
    `?client_id=${clientId}` +
    `&scope=${scopes}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${state}`;

  res.redirect(authUrl);
}
