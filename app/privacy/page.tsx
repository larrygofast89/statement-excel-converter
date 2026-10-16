import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Statement Excel Converter",
  description:
    "How Statement Excel Converter handles your bank statement data — processing in memory, no storage, and what data we collect.",
  alternates: { canonical: "https://statementexcelconverter.com/privacy" },
};

export default function PrivacyPage() {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1>Privacy Policy</h1>
          <p className="hero-sub">
            Your financial data stays yours. Here's exactly how we handle it.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <h2>Statement data</h2>
          <p>
            When you upload a bank statement, it is processed in memory to
            extract the data. The file and the extracted data are{" "}
            <strong>not stored</strong> on our servers after conversion
            completes. We do not keep copies of your statements, and we do not
            use your data to train models.
          </p>

          <h2>What we collect</h2>
          <p>
            We collect only what's needed to run the service: if you create an
            account, your email address; and, to enforce free-tier limits, a
            minimal count of pages converted per day. We do not sell or share
            your personal information.
          </p>

          <h2>Cookies</h2>
          <p>
            We use a small anonymous cookie to remember your session and
            free-tier usage. It contains no personal information.
          </p>

          <h2>Third parties</h2>
          <p>
            We use third-party services for authentication (email login) and AI
            processing. These providers process data only as needed to deliver
            those features.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about privacy? Reach out via the{" "}
            <Link href="/contact" className="link-card-more">
              contact page
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
