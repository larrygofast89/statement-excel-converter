import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact — Statement Excel Converter",
  description:
    "Contact Statement Excel Converter for questions, feedback or support.",
  alternates: { canonical: "https://statementexcelconverter.com/contact" },
};

export default function ContactPage() {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1>Contact</h1>
          <p className="hero-sub">
            Questions, feedback, or a bank format that isn't converting well?
            We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <h2>Get in touch</h2>
          <p>
            The fastest way to reach us is by email. Tell us which bank the
            statement is from and, if something went wrong, what the output
            looked like — that helps us fix it faster.
          </p>
          <p>
            Email:{" "}
            <a href="mailto:support@statementexcelconverter.com" className="link-card-more">
              support@statementexcelconverter.com
            </a>
          </p>

          <h2>Before you write</h2>
          <p>
            If a conversion looks wrong, check that the uploaded PDF or image is
            clear and complete. Most issues are fixed by re-uploading a clearer
            file.
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
