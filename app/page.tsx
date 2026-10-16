import Converter from "@/components/Converter";
import {
  ShieldCheck,
  Target,
  Zap,
  Globe,
  Layers,
  BadgeCheck,
  Receipt,
  Briefcase,
  SearchCheck,
  BarChart3,
  Check,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";

const features: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: ShieldCheck,
    title: "Private & Secure",
    desc: "Files are processed securely and deleted after conversion. Your financial data never gets stored or shared.",
  },
  {
    icon: Target,
    title: "Accurate AI Extraction",
    desc: "AI reads dates, descriptions, and amounts with high accuracy — including scanned and older PDFs.",
  },
  {
    icon: Zap,
    title: "Instant Conversion",
    desc: "Turn a multi-page PDF statement into a clean spreadsheet in seconds, not hours of manual typing.",
  },
  {
    icon: Globe,
    title: "Global Currency Support",
    desc: "Handles USD, EUR, GBP, and dozens of other currencies across banks worldwide.",
  },
  {
    icon: Layers,
    title: "Batch-Ready",
    desc: "Convert statements one after another with a consistent output format that's ready for reconciliation.",
  },
  {
    icon: BadgeCheck,
    title: "Free to Start",
    desc: "Convert your first statements free — no signup, no credit card, no Excel installation required.",
  },
];

const audience: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Receipt,
    title: "Accountants",
    desc: "Turn client PDF bank statements into Excel sheets ready for reconciliation and categorization.",
  },
  {
    icon: Briefcase,
    title: "Business Owners",
    desc: "Convert bank statement PDFs to spreadsheets for budgeting, cashflow tracking, and internal reporting.",
  },
  {
    icon: SearchCheck,
    title: "Auditors",
    desc: "Produce structured Excel exports for audit sampling and documentation with consistent formatting.",
  },
  {
    icon: BarChart3,
    title: "Financial Analysts",
    desc: "Transform static PDFs into sortable, filterable transaction data ready for analysis.",
  },
];

const steps = [
  {
    title: "Upload your statement",
    desc: "Drag and drop your bank statement PDF or image (PNG, JPG). Scanned PDFs work too.",
  },
  {
    title: "AI extracts transactions",
    desc: "Our AI reads every date, description, and amount — no manual typing, no typos.",
  },
  {
    title: "Download Excel or CSV",
    desc: "Get a clean spreadsheet with an account info sheet and a transactions sheet, ready to use.",
  },
];

const faqs = [
  {
    q: "What's the best PDF to Excel bank statement converter online?",
    a: "A good converter should handle both digital and scanned PDFs, extract account details plus every transaction, and export to a structured Excel file. Statement Excel Converter does all three with AI-powered accuracy — free, with no signup required.",
  },
  {
    q: "Will my financial data remain private?",
    a: "Yes. Files are processed securely in memory and never stored after conversion. We don't keep copies of your statements or the extracted data.",
  },
  {
    q: "Does it work with scanned PDFs?",
    a: "Yes. Unlike basic converters that only read text-based PDFs, our AI handles scanned documents and photos — including bank statements compressed in older formats.",
  },
  {
    q: "Do I need Excel installed?",
    a: "No. You can download the result as a standard .xlsx file (opens in Excel, Google Sheets, or Apple Numbers) or as a .csv for any spreadsheet or accounting tool.",
  },
  {
    q: "How do I convert a bank statement PDF to Excel?",
    a: "Upload your PDF, wait a few seconds for the AI to extract the data, review the transactions, then click Download Excel. It's that simple — no account needed.",
  },
];

export default function Home() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Statement Excel Converter",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://statementexcelconverter.com",
    description:
      "Free online tool to convert PDF bank statements to Excel or CSV.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main>
      {/* ===== Hero ===== */}
      <section className="hero">
        <div className="container">
          <h1>Bank Statement Converter — Convert PDF to Excel &amp; CSV</h1>
          <p className="hero-sub">
            Turn complex PDF transaction pages into structured spreadsheets you
            can analyze instantly. Works with digital and scanned statements
            from any bank.
          </p>

          {/* 免费 + 安全说明：标题下方醒目位置 */}
          <div className="hero-trust">
            <ShieldCheck size={18} strokeWidth={2} />
            <span>
              Completely free — no account needed. Your files are processed
              securely and deleted right after conversion.
            </span>
          </div>

          <div className="converter-wrap" id="converter">
            <Converter />
          </div>

          <div className="trust-strip" style={{ marginTop: 28 }}>
            <span className="trust-item">
              <Check size={15} strokeWidth={2.5} className="trust-dot" /> No
              signup required
            </span>
            <span className="trust-item">
              <Check size={15} strokeWidth={2.5} className="trust-dot" /> Secure
              &amp; private
            </span>
            <span className="trust-item">
              <Check size={15} strokeWidth={2.5} className="trust-dot" /> Works
              with scanned PDFs
            </span>
            <span className="trust-item">
              <Check size={15} strokeWidth={2.5} className="trust-dot" /> Excel +
              CSV export
            </span>
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section className="section section-alt" id="features">
        <div className="container">
          <div className="section-head">
            <h2>Why choose this bank statement converter?</h2>
            <p>
              Built for people who deal with bank statements every day — not for
              one-off manual copy-paste jobs.
            </p>
          </div>
          <div className="feature-grid">
            {features.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">
                  <f.icon size={20} strokeWidth={2} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Who it's for ===== */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Who is it for?</h2>
            <p>
              Anyone who turns bank statements into usable data — faster and
              with fewer errors.
            </p>
          </div>
          <div className="who-grid">
            {audience.map((a) => (
              <div className="who-card" key={a.title}>
                <div className="feature-icon">
                  <a.icon size={22} strokeWidth={2} />
                </div>
                <h3>{a.title}</h3>
                <p>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section className="section section-alt" id="how-it-works">
        <div className="container">
          <div className="section-head">
            <h2>How to convert a bank statement PDF to Excel</h2>
            <p>Three simple steps — no account, no software install.</p>
          </div>
          <div className="steps">
            {steps.map((s, i) => (
              <div className="step-card" key={s.title}>
                <div className="step-num">{i + 1}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="section" id="faq">
        <div className="container">
          <div className="section-head">
            <h2>Frequently Asked Questions</h2>
            <p>Quick answers to common questions about bank statement conversion.</p>
          </div>
          <div className="faq-list">
            {faqs.map((f) => (
              <details className="faq-item" key={f.q}>
                <summary className="faq-q">
                  {f.q}
                  <ChevronDown size={18} strokeWidth={2} className="faq-chevron" />
                </summary>
                <div className="faq-a">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 内链到子页面 ===== */}
      <section className="section section-alt">
        <div className="container">
          <div className="bottom-links">
            <a href="/banks" className="bottom-link-card">
              <h3>Supported Banks</h3>
              <p>30+ banks supported</p>
              <span className="link-card-more">View banks →</span>
            </a>
            <a href="/converters" className="bottom-link-card">
              <h3>Statement Types</h3>
              <p>Bank, credit card &amp; more</p>
              <span className="link-card-more">View types →</span>
            </a>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
