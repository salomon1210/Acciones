import { getClient, queuedGet } from "@/lib/utils/http";
import { cached, TTL } from "@/lib/utils/cache";

const BASE = "https://api.stlouisfed.org/fred";
const KEY = process.env.FRED_API_KEY;

export const fredAvailable = () => !!KEY;

getClient({ name: "fred", baseURL: BASE, concurrency: 2, intervalCap: 10, intervalMs: 1000, retries: 2 });

export const FRED_SERIES = {
  FED_FUNDS: "DFF",
  CPI: "CPIAUCSL",
  UNEMPLOYMENT: "UNRATE",
  YIELD_10Y: "DGS10",
  YIELD_2Y: "DGS2",
  YIELD_3M: "DGS3MO",
  M2: "M2SL",
  REAL_GDP: "GDPC1",
};

export type FredPoint = { date: string; value: number | null };

export async function fredSeries(seriesId: string, limit = 60): Promise<FredPoint[]> {
  if (!KEY) return [];
  return cached(`fred:${seriesId}:${limit}`, TTL.macro, async () => {
    try {
      const data = await queuedGet<{ observations: Array<{ date: string; value: string }> }>(
        "fred",
        `/series/observations?series_id=${seriesId}&api_key=${KEY}&file_type=json&limit=${limit}&sort_order=desc`
      );
      return (data?.observations ?? []).map((o) => ({
        date: o.date,
        value: o.value === "." ? null : Number(o.value),
      }));
    } catch {
      return [];
    }
  });
}

export async function fredReleaseCalendar() {
  if (!KEY) return [];
  return cached(`fred:releases`, TTL.macro, async () => {
    try {
      const data = await queuedGet<{ releases: Array<{ id: number; name: string; press_release: boolean; link?: string }> }>(
        "fred",
        `/releases?api_key=${KEY}&file_type=json&limit=20`
      );
      return data?.releases ?? [];
    } catch {
      return [];
    }
  });
}
