// 银行数据：用于生成银行独立页 + /banks 列表页 + sitemap
export interface Bank {
  slug: string;
  name: string;
  region: string; // 国家/地区
  note: string; // 该行对账单格式特点（一句话）
}

export const banks: Bank[] = [
  // ── United States ──
  { slug: "chase", name: "Chase", region: "United States", note: "Statements print both a transaction date and a posting date, plus a running balance column." },
  { slug: "bank-of-america", name: "Bank of America", region: "United States", note: "Multi-account statements with a per-account summary box and transaction table." },
  { slug: "wells-fargo", name: "Wells Fargo", region: "United States", note: "Checks are listed as check numbers with a separate running balance column." },
  { slug: "citibank", name: "Citibank", region: "United States", note: "Dense multi-page statements with a summary at the end of each statement period." },
  { slug: "capital-one", name: "Capital One", region: "United States", note: "Clean single-account layout with clear transaction date and description columns." },
  { slug: "pnc", name: "PNC", region: "United States", note: "Standard monthly statements with beginning and ending balance summaries." },
  { slug: "us-bank", name: "U.S. Bank", region: "United States", note: "Transactions grouped by type with a daily balance shown in the margin." },
  { slug: "td-bank", name: "TD Bank", region: "United States", note: "US statements use a two-column transaction list with running balance." },
  { slug: "truist", name: "Truist", region: "United States", note: "Formed from BB&T and SunTrust; statements keep the legacy BB&T-style layout." },
  { slug: "american-express", name: "American Express", region: "United States", note: "Credit card statements with charges, payments and a statement balance summary." },
  { slug: "discover", name: "Discover", region: "United States", note: "Credit card bills with a cashback summary and itemized transactions." },
  { slug: "ally-bank", name: "Ally Bank", region: "United States", note: "Online-only bank; digital statements are PDF with a simple transaction table." },
  { slug: "usaa", name: "USAA", region: "United States", note: "Military banking statements with a compact multi-account summary." },
  { slug: "navy-federal", name: "Navy Federal", region: "United States", note: "Credit union statements with a combined accounts and transactions view." },
  { slug: "regions", name: "Regions", region: "United States", note: "Standard checking statements with daily balance and transaction detail." },

  // ── United Kingdom ──
  { slug: "hsbc", name: "HSBC", region: "United Kingdom", note: "UK statements list transactions with type codes and a running balance." },
  { slug: "barclays", name: "Barclays", region: "United Kingdom", note: "Statements show a closing balance and itemized transactions per account." },
  { slug: "lloyds", name: "Lloyds", region: "United Kingdom", note: "Classic blue-header statements with money in/out columns." },
  { slug: "natwest", name: "NatWest", region: "United Kingdom", note: "Transactions use date, description and paid-in/paid-out columns." },
  { slug: "santander-uk", name: "Santander UK", region: "United Kingdom", note: "UK statements with an account summary and transaction table per page." },
  { slug: "nationwide", name: "Nationwide", region: "United Kingdom", note: "Building society statements with a clear monthly transaction list." },
  { slug: "monzo", name: "Monzo", region: "United Kingdom", note: "Digital bank; PDF exports include merchant, category and rounded-up totals." },
  { slug: "revolut", name: "Revolut", region: "United Kingdom", note: "Fintech statements with multi-currency transactions and FX breakdowns." },

  // ── Canada ──
  { slug: "rbc", name: "RBC", region: "Canada", note: "Canadian statements with bilingual labels and running balance." },
  { slug: "td-canada-trust", name: "TD Canada Trust", region: "Canada", note: "Canadian layout with transaction date and posted balance columns." },
  { slug: "scotiabank", name: "Scotiabank", region: "Canada", note: "Statements with an account summary and per-day transaction detail." },
  { slug: "bmo", name: "BMO", region: "Canada", note: "Canadian statements with opening/closing balance and itemized rows." },
  { slug: "cibc", name: "CIBC", region: "Canada", note: "Bilingual statements with a clean transaction table and summary." },

  // ── Australia ──
  { slug: "commonwealth-bank", name: "Commonwealth Bank", region: "Australia", note: "AU statements with a running balance and transaction reference numbers." },
  { slug: "westpac", name: "Westpac", region: "Australia", note: "Australian statements with money in/out and closing balance per day." },
  { slug: "anz", name: "ANZ", region: "Australia", note: "Statements with account summary and itemized transactions per statement." },
  { slug: "nab", name: "NAB", region: "Australia", note: "Australian statements with clear date, description and amount columns." },

  // ── International ──
  { slug: "deutsche-bank", name: "Deutsche Bank", region: "International", note: "German statements with SEPA references and running balance." },
  { slug: "dbs", name: "DBS", region: "International", note: "Singapore statements with multi-currency accounts and transaction codes." },
  { slug: "icbc", name: "ICBC", region: "International", note: "Chinese statements often bilingual with a compact transaction list." },
  { slug: "standard-chartered", name: "Standard Chartered", region: "International", note: "Statements across regions with standardized transaction layout." },
  { slug: "bnp-paribas", name: "BNP Paribas", region: "International", note: "French statements with SEPA and local transaction details." },
  { slug: "ubs", name: "UBS", region: "International", note: "Swiss statements with multi-currency and portfolio-style summaries." },
];

export function getBankBySlug(slug: string): Bank | undefined {
  return banks.find((b) => b.slug === slug);
}
