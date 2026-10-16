import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Landmark, CheckCircle2 } from "lucide-react";
import Converter from "@/components/Converter";
import { banks, getBankBySlug } from "@/lib/banks";

export const dynamicParams = false;

export function generateStaticParams() {
  return banks.map((b) => ({ slug: b.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const bank = getBankBySlug(params.slug);
  if (!bank) return { title: "Bank Statement Converter" };
  return {
    title: `${bank.name} Bank Statement Converter — PDF to CSV & Excel`,
    description: `Convert ${bank.name} bank statements to Excel or CSV. AI extracts account details, summary and every transaction from ${bank.name} PDFs — digital and scanned. Free, no signup.`,
    alternates: {
      canonical: `https://statementexcelconverter.com/banks/${bank.slug}`,
    },
  };
}

export default function BankPage({ params }: { params: { slug: string } }) {
  const bank = getBankBySlug(params.slug);
  if (!bank) return null;

  const related = banks.filter((b) => b.slug !== bank.slug).slice(0, 6);

  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1>{bank.name} Bank Statement Converter — PDF to CSV & Excel</h1>
          <p className="hero-sub">
            Upload a {bank.name} bank statement and get a clean Excel or CSV
            file with account info, summary and every transaction extracted by
            AI — in seconds, free and with no signup.
          </p>
          <Converter />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>How {bank.name} statements are handled</h2>
            <p>
              Our converter doesn't rely on fixed templates. AI reads the layout
              of your actual {bank.name} statement and pulls out the data that
              matters.
            </p>
          </div>
          <div className="who-grid">
            <div className="who-card">
              <h3>{bank.name} format</h3>
              <p>{bank.note}</p>
            </div>
            <div className="who-card">
              <h3>Account info</h3>
              <p>
                Bank name, account holder, account number, currency and
                statement period — read automatically.
              </p>
            </div>
            <div className="who-card">
              <h3>Every transaction</h3>
              <p>
                Date, description and amount for each transaction, exported row
                by row into a spreadsheet.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <h2>Frequently asked questions</h2>
          </div>
          <div className="who-grid">
            <div className="who-card">
              <h3>How do I convert a {bank.name} statement to Excel?</h3>
              <p>
                Upload your {bank.name} PDF above. AI extracts the account
                details and every transaction, then you download an Excel file
                with three sheets: Account Info, Summary and Transactions.
              </p>
            </div>
            <div className="who-card">
              <h3>Does it handle scanned {bank.name} statements?</h3>
              <p>
                Yes. Scanned PDFs and clear phone photos of paper statements
                work too — the AI reads the layout from the image, not from
                hidden text.
              </p>
            </div>
            <div className="who-card">
              <h3>What if a date or amount is misread?</h3>
              <p>
                Review the extracted transactions on screen before downloading.
                Rare mismatches are usually fixed by uploading a clearer file.
              </p>
            </div>
            <div className="who-card">
              <h3>Is my {bank.name} data private?</h3>
              <p>
                Files are processed to extract the data and are not stored or
                shared. No account is required to convert.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>More banks we support</h2>
          </div>
          <div className="bank-chips">
            {related.map((b) => (
              <Link href={`/banks/${b.slug}`} className="bank-chip bank-chip-link" key={b.slug}>
                {b.name}
              </Link>
            ))}
            <Link href="/banks" className="bank-chip bank-chip-link">
              All banks →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
