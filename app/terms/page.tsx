import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Statement Excel Converter",
  description:
    "Terms of service for Statement Excel Converter — a free bank statement to Excel/CSV conversion tool.",
  alternates: { canonical: "https://statementexcelconverter.com/terms" },
};

export default function TermsPage() {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1>Terms of Service</h1>
          <p className="hero-sub">
            Simple terms for a simple tool. Last updated: October 2026.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <h2>The service</h2>
          <p>
            Statement Excel Converter lets you convert bank statement PDFs and
            images into Excel or CSV files. The service is provided free for
            basic use, with limits for anonymous users.
          </p>

          <h2>Acceptable use</h2>
          <p>
            You may use the service to convert documents you are authorized to
            process. Do not use it to process data you don't have rights to, or
            to attempt to disrupt the service.
          </p>

          <h2>Accuracy</h2>
          <p>
            Conversion uses AI and is provided "as is". Always review extracted
            data before relying on it for financial or legal purposes.
          </p>

          <h2>Liability</h2>
          <p>
            To the maximum extent permitted by law, we are not liable for any
            loss arising from use of the service.
          </p>

          <p style={{ marginTop: 24 }}>
            <Link href="/" className="link-card-more">
              ← Back to converter
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
