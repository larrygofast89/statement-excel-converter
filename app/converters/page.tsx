import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileSpreadsheet, CreditCard, TrendingUp, House, Receipt } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Supported Statement Types — Bank Statement Converter",
  description:
    "Convert bank statements, credit card statements, investment statements and invoices from PDF to Excel or CSV. Free, no signup.",
  alternates: { canonical: "https://statementexcelconverter.com/converters" },
};

const statementTypes: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: FileSpreadsheet,
    title: "Bank statements",
    desc: "Checking and savings account statements, with every transaction, opening balance and summary extracted.",
  },
  {
    icon: CreditCard,
    title: "Credit card statements",
    desc: "Credit card bills with purchases, payments, fees and interest itemized into rows.",
  },
  {
    icon: TrendingUp,
    title: "Investment & brokerage",
    desc: "Brokerage and investment account statements with trades, dividends and holdings.",
  },
  {
    icon: House,
    title: "Loan & mortgage",
    desc: "Loan and mortgage statements with principal, interest and payment breakdowns.",
  },
  {
    icon: Receipt,
    title: "Invoices & receipts",
    desc: "Invoices and receipts with line items, totals and tax extracted to a clean spreadsheet.",
  },
];

const formats = ["PDF", "PNG", "JPG", "JPEG"];

export default function ConvertersPage() {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1>Supported Statement Types</h1>
          <p className="hero-sub">
            One converter for every kind of financial statement. Upload a PDF or
            image and get a structured Excel or CSV file with account info and
            transactions in separate sheets.
          </p>
          <Link href="/#converter" className="btn btn-primary btn-lg">
            Convert a statement <ArrowRight size={16} strokeWidth={2} />
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="feature-grid">
            {statementTypes.map((t) => (
              <div className="feature-card" key={t.title}>
                <div className="feature-icon">
                  <t.icon size={20} strokeWidth={2} />
                </div>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <h2>Input & output formats</h2>
            <p>Simple in, clean structured data out.</p>
          </div>

          <div className="fmt-row">
            <div className="fmt-block">
              <h3 className="banks-region">You upload</h3>
              <div className="bank-chips">
                {formats.map((f) => (
                  <span className="bank-chip" key={f}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <div className="fmt-block">
              <h3 className="banks-region">You download</h3>
              <div className="bank-chips">
                <span className="bank-chip bank-chip-strong">Excel (.xlsx)</span>
                <span className="bank-chip bank-chip-strong">CSV</span>
              </div>
            </div>
          </div>

          <div className="section-head" style={{ marginTop: 40 }}>
            <h2>What's inside the file</h2>
          </div>
          <div className="steps">
            <div className="step-card">
              <div className="step-num">1</div>
              <h3>Account Info</h3>
              <p>Bank, account holder, account number, currency and period.</p>
            </div>
            <div className="step-card">
              <div className="step-num">2</div>
              <h3>Summary</h3>
              <p>Opening balance, total deposits, withdrawals and other figures.</p>
            </div>
            <div className="step-card">
              <div className="step-num">3</div>
              <h3>Transactions</h3>
              <p>Every transaction with date, description and amount.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
