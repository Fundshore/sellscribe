import { useNavigate } from "react-router-dom";

const V1 = "#8B5CF6";
const V2 = "#7C3AED";

const SECTIONS = [
  {
    heading: "1. Information We Collect",
    body: "We collect your email address when you create an account. We collect usage data including the number of analyses and fixes you perform. Product listing text you submit is processed by Anthropic's Claude API to generate analysis results and improved listings — we do not store this text beyond the duration of your session unless you explicitly save it to your history."
  },
  {
    heading: "2. How We Use Your Information",
    body: "We use your email to create and manage your account, send important service updates, and respond to support requests. Usage data is used to enforce subscription limits and improve the service. We do not use your data for advertising purposes."
  },
  {
    heading: "3. Data Sharing and Third Parties",
    body: "We share product listing text with Anthropic, Inc. solely for the purpose of generating AI-powered analysis and listing improvements. We use Supabase for database hosting and Lemon Squeezy for payment processing. We use Vercel for application hosting. These service providers process data only as necessary to provide their services to us. We do not sell your personal data to any third parties."
  },
  {
    heading: "4. Shopify Integration",
    body: "If you use SellScribe through the Shopify App Store, we access your store's product data (titles and descriptions) solely to display them within the SellScribe interface and to save improved listings back to your store upon your explicit request. We do not access order data, customer data, payment data, or any other store information beyond product listings. Your Shopify access token is stored securely and used only for the purposes described above."
  },
  {
    heading: "5. Data Retention",
    body: "We retain your account information and analysis history for as long as your account is active. You may request deletion of your account and all associated data at any time by contacting us. Analysis history in the Shopify app can be deleted individually at any time within the app."
  },
  {
    heading: "6. Shopify Customer Data Requests",
    body: "In compliance with Shopify's requirements, we support customer data access and erasure requests. If a customer of a merchant using our Shopify app requests access to or deletion of their data, the merchant should contact us at the address below. Note that SellScribe does not collect or store end-customer data — we only process merchant product listing data."
  },
  {
    heading: "7. Security",
    body: "We implement industry-standard security measures including encrypted data transmission (HTTPS), secure credential storage, and access controls. Your Shopify access token is stored encrypted. Despite these measures, no system is completely secure and we cannot guarantee absolute security."
  },
  {
    heading: "8. Your Rights",
    body: "You have the right to access, correct, or delete your personal data. You may request a copy of your data or request account deletion by contacting us. If you are located in the European Economic Area, you have additional rights under GDPR including the right to data portability and the right to lodge a complaint with a supervisory authority."
  },
  {
    heading: "9. Cookies",
    body: "We use only essential cookies necessary for authentication and session management. We do not use tracking or advertising cookies."
  },
  {
    heading: "10. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the updated policy on our website. Your continued use of the service after changes are posted constitutes your acceptance."
  },
  {
    heading: "11. Contact",
    body: "For privacy-related requests, data deletion requests, or questions about this policy, please contact us through the feedback form on our website at sellscribe.app."
  },
];

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "#F7F5FF", fontFamily: "'DM Sans', system-ui, sans-serif", color: "#1A1330" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* Nav */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #EDE9F8", padding: "0 32px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span onClick={() => navigate("/")} style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 18, cursor: "pointer", letterSpacing: "-0.02em" }}>
            <span style={{ color: "#1A1330" }}>Sell</span><span style={{ color: V1 }}>Scribe</span>
          </span>
          <button onClick={() => navigate("/")} style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${V1}25`, background: "transparent", color: V1, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            ← Back
          </button>
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 80px" }}>
        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: "#1A1330", letterSpacing: "-0.03em", marginBottom: 8 }}>
          Privacy Policy
        </h1>
        <p style={{ color: "#9B96B8", fontSize: 14, marginBottom: 40 }}>Last updated: April 8, 2026</p>

        <p style={{ fontSize: 15, color: "#2A2340", lineHeight: 1.7, marginBottom: 40, padding: "18px 20px", background: "#fff", borderRadius: 12, border: `1px solid ${V1}15` }}>
          SellScribe ("we", "us", "our") is committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights regarding your personal information.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {SECTIONS.map((s, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "24px 28px", border: "1px solid #EDE9F8" }}>
              <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 17, fontWeight: 800, color: "#1A1330", marginBottom: 10 }}>{s.heading}</h2>
              <p style={{ fontSize: 14, color: "#2A2340", lineHeight: 1.75 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
