import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileSpreadsheet, ShieldCheck, Zap } from "lucide-react";
import Converter from "@/components/Converter";
import { converterTypes, getConverterTypeBySlug } from "@/lib/converters";

export const dynamicParams = false;

export function generateStaticParams() {
  return converterTypes.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const t = getConverterTypeBySlug(params.slug);
  if (!t) return { title: "Bank Statement Converter" };
  return {
    title: t.title,
    description: t.desc,
    alternates: {
      canonical: `https://statementexcelconverter.com/converters/${t.slug}`,
    },
  };
}

export default function ConverterTypePage({
  params,
}: {
  params: { slug: string };
}) {
  const t = getConverterTypeBySlug(params.slug);
  if (!t) return null;

  const related = converterTypes.filter((c) => c.slug !== t.slug).slice(0, 5);

  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1>{t.h1}</h1>
          <p className="hero-sub">{t.desc}</p>
          <Converter />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>What you get</h2>
          </div>
          <div className="who-grid">
            <div className="who-card">
              <div className="feature-icon">
                <FileSpreadsheet size={20} strokeWidth={2} />
              </div>
              <h3>Structured output</h3>
              <p>
                Account info, summary and transactions split into separate
                sheets — no copy-paste, no manual reformatting.
              </p>
            </div>
            <div className="who-card">
              <div className="feature-icon">
                <Zap size={20} strokeWidth={2} />
              </div>
              <h3>Works in seconds</h3>
              <p>
                AI reads the layout and extracts data automatically, so a{" "}
                {t.input} becomes a spreadsheet fast.
              </p>
            </div>
            <div className="who-card">
              <div className="feature-icon">
                <ShieldCheck size={20} strokeWidth={2} />
              </div>
              <h3>Private by design</h3>
              <p>
                Files are processed to extract data and are not stored or
                shared. No account is required.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <h2>More conversions</h2>
          </div>
          <div className="bank-chips">
            {related.map((c) => (
              <Link href={`/converters/${c.slug}`} className="bank-chip bank-chip-link" key={c.slug}>
                {c.h1.replace("Convert ", "").replace(" to Excel", "")}
              </Link>
            ))}
            <Link href="/converters" className="bank-chip bank-chip-link">
              All types →
            </Link>
          </div>
          <p style={{ marginTop: 20 }}>
            Convert a specific bank's statement?{" "}
            <Link href="/banks" className="link-card-more">
              Browse supported banks →
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
