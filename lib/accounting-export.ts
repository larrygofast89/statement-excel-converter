// 会计格式导出：OFX / QBO / QIF
// 把已提取的交易数据转成 QuickBooks / Quicken / Xero 等可导入的格式。
// 这些是纯文本结构化格式，字段映射确定，不需要 AI。

export interface Tx {
  date: string; // "YYYY-MM-DD"
  description: string;
  amount: number | null; // 负数=支出，正数=收入
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

// "2026-10-16" -> "20261016"（OFX 日期）
function toOfxDate(date: string): string {
  const m = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}${m[2]}${m[3]}`;
  return date.replace(/-/g, "");
}

// "2026-10-16" -> "10/16/2026"（QIF 日期）
function toQifDate(date: string): string {
  const m = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[2]}/${m[3]}/${m[1]}`;
  return date;
}

function amount2(a: number | null): string {
  return (Math.round((a ?? 0) * 100) / 100).toFixed(2);
}

// 稳定的 FITID：从 date+amount+description 派生，避免重复导入
function fitId(t: Tx, i: number): string {
  const base = `${toOfxDate(t.date)}${amount2(t.amount)}${i}`;
  // 简单散列，保持唯一且稳定
  let h = 0;
  for (let j = 0; j < base.length; j++) {
    h = (h * 31 + base.charCodeAt(j)) >>> 0;
  }
  return `F${h.toString(16).toUpperCase()}${pad(i)}`;
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function nowOfxTimestamp(): string {
  const d = new Date();
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(
    d.getHours()
  )}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

// QBO（QuickBooks Web Connect）—— 本质是 OFX 2.1.1 XML
export function toQbo(txs: Tx[], currency = "USD", acctType = "CHECKING"): string {
  const dtserver = nowOfxTimestamp();
  const dates = txs.map((t) => toOfxDate(t.date)).filter(Boolean).sort();
  const dtstart = dates[0] || toOfxDate(new Date().toISOString().slice(0, 10));
  const dtend = dates[dates.length - 1] || dtstart;

  const stmttrn = txs
    .map((t, i) => {
      const type = (t.amount ?? 0) >= 0 ? "CREDIT" : "DEBIT";
      return `        <STMTTRN>\n          <TRNTYPE>${type}</TRNTYPE>\n          <DTPOSTED>${toOfxDate(
        t.date
      )}</DTPOSTED>\n          <TRNAMT>${amount2(t.amount)}</TRNAMT>\n          <FITID>${fitId(
        t,
        i
      )}</FITID>\n          <NAME>${xmlEscape(t.description || "")}</NAME>\n        </STMTTRN>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<?OFX OFXHEADER="200" VERSION="211" SECURITY="NONE" OLDFILEUID="NONE" NEWFILEUID="NONE"?>
<OFX>
  <SIGNONMSGSRSV1>
    <SONRS>
      <STATUS><CODE>0</CODE><SEVERITY>INFO</SEVERITY></STATUS>
      <DTSERVER>${dtserver}</DTSERVER>
      <LANGUAGE>ENG</LANGUAGE>
    </SONRS>
  </SIGNONMSGSRSV1>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <TRNUID>1</TRNUID>
      <STATUS><CODE>0</CODE><SEVERITY>INFO</SEVERITY></STATUS>
      <STMTRS>
        <CURDEF>${currency}</CURDEF>
        <BANKACCTFROM>
          <BANKID>000000000</BANKID>
          <ACCTID>000000000</ACCTID>
          <ACCTTYPE>${acctType}</ACCTTYPE>
        </BANKACCTFROM>
        <BANKTRANLIST>
          <DTSTART>${dtstart}</DTSTART>
          <DTEND>${dtend}</DTEND>
${stmttrn}
        </BANKTRANLIST>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>`;
}

// OFX 1.0.2（SGML）—— 老式，兼容 Quicken / GnuCash 等
export function toOfx(txs: Tx[], currency = "USD", acctType = "CHECKING"): string {
  const dtserver = nowOfxTimestamp();
  const stmttrn = txs
    .map((t, i) => {
      const type = (t.amount ?? 0) >= 0 ? "CREDIT" : "DEBIT";
      return `<STMTTRN>\n<TRNTYPE>${type}\n<DTPOSTED>${toOfxDate(
        t.date
      )}\n<TRNAMT>${amount2(t.amount)}\n<FITID>${fitId(t, i)}\n<NAME>${t.description ||
        ""}\n</STMTTRN>`;
    })
    .join("\n");

  return `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
<SIGNONMSGSRSV1>
<SONRS>
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
<DTSERVER>${dtserver}
<LANGUAGE>ENG
</SONRS>
</SIGNONMSGSRSV1>
<BANKMSGSRSV1>
<STMTTRNRS>
<TRNUID>1
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
<STMTRS>
<CURDEF>${currency}
<BANKACCTFROM>
<BANKID>000000000
<ACCTID>000000000
<ACCTTYPE>${acctType}
</BANKACCTFROM>
<BANKTRANLIST>
${stmttrn}
</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;
}

// QIF（Quicken Interchange Format）—— Quicken 和旧工具
export function toQif(txs: Tx[]): string {
  const entries = txs
    .map((t) => {
      return `D${toQifDate(t.date)}\nT${amount2(t.amount)}\nN${t.description || ""}\n^`;
    })
    .join("\n");
  return `!Type:Bank\n${entries}`;
}

// 触发浏览器下载文本文件
export function downloadText(
  filename: string,
  content: string,
  mime = "application/octet-stream"
): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
