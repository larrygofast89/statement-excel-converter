import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Statement Excel Converter",
  description:
    "Learn about Statement Excel Converter — a free AI tool that turns bank statement PDFs into Excel and CSV, built for accountants, business owners and analysts.",
  alternates: { canonical: "https://statementexcelconverter.com/about" },
};

export default function AboutPage() {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1>About Statement Excel Converter</h1>
          <p className="hero-sub">
            We turn bank statement PDFs into clean Excel and CSV files — so you
            never retype a transaction again.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <h2>Why we built it</h2>
          <p>
            Bookkeepers and accountants still spend hours copy-pasting
            transactions out of bank statement PDFs into spreadsheets. Existing
            converters either break on scanned documents or produce messy,
            un-structured output.
          </p>
          <p>
            Statement Excel Converter uses AI to read the actual layout of your
            statement — digital or scanned — and extract account info, the
            summary, and every transaction into a structured spreadsheet you can
            use immediately.
          </p>

          <h2>How it works</h2>
          <p>
            Upload a PDF or image. AI reads the dates, descriptions and amounts,
            then builds an Excel or CSV file with three sheets: Account Info,
            Summary and Transactions. Review the results on screen before you
            download.
          </p>

          <h2>Privacy first</h2>
          <p>
            Financial statements are sensitive. Files are processed in memory
            and deleted immediately after conversion. We never store your
            statements or the extracted data.
          </p>

          <p style={{ marginTop: 24 }}>
            <Link href="/" className="link-card-more">
              ← Convert a statement
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
