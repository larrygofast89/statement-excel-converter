import type { Metadata } from "next";
import { FileSpreadsheet } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import AuthButton from "@/components/AuthButton";
import AuthNotice from "@/components/AuthNotice";
import "./globals.css";

const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL("https://statementexcelconverter.com"),
  title: "Bank Statement Converter — Convert PDF to Excel Free",
  description:
    "Free bank statement converter. Upload your bank statement PDF and convert it to Excel or CSV in seconds. No signup required.",
  keywords:
    "bank statement converter, bank statement to excel, convert bank statement to excel, pdf to excel",
  alternates: {
    canonical: "https://statementexcelconverter.com",
  },
  openGraph: {
    title: "Bank Statement Converter — Convert PDF to Excel Free",
    description:
      "Turn your bank statement PDF into a clean Excel spreadsheet in seconds. Free, no signup.",
    url: "https://statementexcelconverter.com",
    siteName: "Statement Excel Converter",
    type: "website",
    images: [
      {
        url: "https://statementexcelconverter.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Statement Excel Converter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bank Statement Converter — Convert PDF to Excel Free",
    description:
      "Turn your bank statement PDF into a clean Excel spreadsheet in seconds. Free, no signup.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <header className="site-header">
          <div className="site-header-inner">
            <a href="/" className="logo">
              <span className="logo-mark">
                <FileSpreadsheet size={16} strokeWidth={2.2} />
              </span>
              Statement Excel Converter
            </a>
            <div className="header-actions">
              <nav className="site-nav">
                <a href="/banks">Banks</a>
                <a href="/converters">Statement types</a>
                <a href="/#how-it-works">How it works</a>
                <a href="/#faq">FAQ</a>
              </nav>
              <AuthButton />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <AuthNotice />

        {children}

        <footer className="site-footer">
          <div className="site-footer-inner">
            <span>
              © {new Date().getFullYear()} Statement Excel Converter. Free bank
              statement to Excel tool.
            </span>
            <nav className="footer-links">
              <a href="/about">About</a>
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
              <a href="/contact">Contact</a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
