import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Landmark } from "lucide-react";
import { banks } from "@/lib/banks";

export const metadata: Metadata = {
  title: "Supported Banks — Bank Statement Converter",
  description:
    "Convert bank statements from Chase, Bank of America, Wells Fargo, HSBC and 30+ other banks to Excel or CSV. Works with digital and scanned PDFs.",
  alternates: { canonical: "https://statementexcelconverter.com/banks" },
};

const regionOrder = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "International",
];

const bankGroups = regionOrder.map((region) => ({
  region,
  banks: banks.filter((b) => b.region === region),
}));

export default function BanksPage() {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1>Supported Banks</h1>
          <p className="hero-sub">
            Our AI reads bank statements from 30+ major banks worldwide — and
            works with digital PDFs, scanned documents, and photos alike. Don't
            see your bank? It likely still works.
          </p>
          <Link href="/#converter" className="btn btn-primary btn-lg">
            Convert your statement <ArrowRight size={16} strokeWidth={2} />
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {bankGroups.map((g) => (
            <div key={g.region} style={{ marginBottom: 40 }}>
              <h2 className="banks-region">
                <Landmark size={18} strokeWidth={2} /> {g.region}
              </h2>
              <div className="bank-chips">
                {g.banks.map((b) => (
                  <Link href={`/banks/${b.slug}`} className="bank-chip bank-chip-link" key={b.slug}>
                    {b.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <h2>How it works for any bank</h2>
            <p>
              The converter doesn't rely on fixed templates — AI understands the
              layout of each statement, so bank-specific formats are handled
              automatically.
            </p>
          </div>
          <div className="who-grid">
            <div className="who-card">
              <h3>Digital PDFs</h3>
              <p>Statements downloaded from online banking, in any layout.</p>
            </div>
            <div className="who-card">
              <h3>Scanned statements</h3>
              <p>Older or paper statements scanned to PDF, including compressed formats.</p>
            </div>
            <div className="who-card">
              <h3>Photos from your phone</h3>
              <p>A clear photo of a paper statement works too.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
