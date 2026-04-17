import { getClient, queuedGet } from "@/lib/utils/http";
import { cached, TTL } from "@/lib/utils/cache";

const BASE = "https://data.sec.gov";
// SEC requires User-Agent identifying caller
const UA = "InvestmentCommand/0.1 contact@example.com";

export const edgarAvailable = () => true;

getClient({
  name: "edgar",
  baseURL: BASE,
  concurrency: 2,
  intervalCap: 6,
  intervalMs: 1000,
  retries: 2,
});

// Map ticker → CIK (cached from the SEC's company_tickers endpoint)
let _tickerIndex: Record<string, string> | null = null;

async function loadTickerIndex(): Promise<Record<string, string>> {
  if (_tickerIndex) return _tickerIndex;
  try {
    const res = await fetch("https://www.sec.gov/files/company_tickers.json", {
      headers: { "User-Agent": UA },
      cache: "force-cache",
    });
    const data = (await res.json()) as Record<string, { cik_str: number; ticker: string; title: string }>;
    const idx: Record<string, string> = {};
    for (const k of Object.keys(data)) {
      const row = data[k];
      idx[row.ticker.toUpperCase()] = String(row.cik_str).padStart(10, "0");
    }
    _tickerIndex = idx;
    return idx;
  } catch {
    return {};
  }
}

export async function tickerToCik(ticker: string): Promise<string | null> {
  const idx = await loadTickerIndex();
  return idx[ticker.toUpperCase()] ?? null;
}

export async function edgarSubmissions(ticker: string) {
  const cik = await tickerToCik(ticker);
  if (!cik) return null;
  return cached(`edgar:sub:${cik}`, TTL.filings, async () => {
    try {
      const res = await fetch(`${BASE}/submissions/CIK${cik}.json`, {
        headers: { "User-Agent": UA },
      });
      if (!res.ok) return null;
      return (await res.json()) as {
        cik: string;
        name: string;
        tickers: string[];
        sic: string;
        sicDescription: string;
        filings: {
          recent: {
            accessionNumber: string[];
            filingDate: string[];
            reportDate: string[];
            form: string[];
            primaryDocument: string[];
            primaryDocDescription: string[];
          };
        };
      };
    } catch {
      return null;
    }
  });
}

export async function edgarRecentFilings(ticker: string, forms: string[] = ["10-K", "10-Q", "8-K"], limit = 10) {
  const sub = await edgarSubmissions(ticker);
  if (!sub) return [];
  const { accessionNumber, filingDate, reportDate, form, primaryDocument } = sub.filings.recent;
  const out: Array<{
    form: string;
    filingDate: string;
    reportDate: string;
    accessionNumber: string;
    url: string;
  }> = [];
  for (let i = 0; i < form.length && out.length < limit; i++) {
    if (!forms.includes(form[i])) continue;
    const accessionNoDashes = accessionNumber[i].replace(/-/g, "");
    const cik = sub.cik.replace(/^0+/, "");
    out.push({
      form: form[i],
      filingDate: filingDate[i],
      reportDate: reportDate[i],
      accessionNumber: accessionNumber[i],
      url: `https://www.sec.gov/Archives/edgar/data/${cik}/${accessionNoDashes}/${primaryDocument[i]}`,
    });
  }
  return out;
}
