// 格式/声明类型页数据：用于生成格式独立页 + /converters 列表页 + sitemap
export interface ConverterType {
  slug: string;
  title: string; // 浏览器标题
  h1: string;
  input: string;
  desc: string;
}

export const converterTypes: ConverterType[] = [
  {
    slug: "pdf-to-excel",
    title: "Convert PDF Bank Statement to Excel — Free Converter",
    h1: "Convert PDF Bank Statements to Excel",
    input: "PDF bank statement",
    desc: "Turn a PDF bank statement into an Excel (.xlsx) workbook with account info, summary and every transaction in separate sheets.",
  },
  {
    slug: "pdf-to-csv",
    title: "Convert PDF Bank Statement to CSV — Free Converter",
    h1: "Convert PDF Bank Statements to CSV",
    input: "PDF bank statement",
    desc: "Extract a PDF bank statement to a CSV file — one row per transaction with date, description and amount, ready for import.",
  },
  {
    slug: "scanned-pdf-to-excel",
    title: "Convert Scanned Bank Statement to Excel — Free",
    h1: "Convert Scanned Bank Statements to Excel",
    input: "scanned PDF",
    desc: "AI reads scanned paper statements without hidden text and converts them to a clean Excel file with all transactions.",
  },
  {
    slug: "image-to-excel",
    title: "Convert Statement Image to Excel — Free Converter",
    h1: "Convert Statement Images to Excel",
    input: "image (PNG/JPG)",
    desc: "Upload a photo or screenshot of a bank statement and get a structured Excel file with account details and transactions.",
  },
  {
    slug: "credit-card-statement-to-excel",
    title: "Convert Credit Card Statement to Excel — Free",
    h1: "Convert Credit Card Statements to Excel",
    input: "credit card statement",
    desc: "Itemize credit card purchases, payments, fees and interest into an Excel spreadsheet with every line extracted.",
  },
  {
    slug: "investment-statement-to-excel",
    title: "Convert Investment Statement to Excel — Free",
    h1: "Convert Investment Statements to Excel",
    input: "brokerage / investment statement",
    desc: "Extract trades, dividends and holdings from brokerage and investment statements into a clean Excel file.",
  },
  {
    slug: "loan-statement-to-excel",
    title: "Convert Loan Statement to Excel — Free",
    h1: "Convert Loan & Mortgage Statements to Excel",
    input: "loan / mortgage statement",
    desc: "Break down loan and mortgage payments — principal, interest and fees — into an Excel-ready table.",
  },
  {
    slug: "invoice-to-excel",
    title: "Convert Invoice to Excel — Free Converter",
    h1: "Convert Invoices & Receipts to Excel",
    input: "invoice / receipt",
    desc: "Pull line items, totals and tax from invoices and receipts into a structured Excel spreadsheet.",
  },
];

export function getConverterTypeBySlug(slug: string): ConverterType | undefined {
  return converterTypes.find((c) => c.slug === slug);
}
