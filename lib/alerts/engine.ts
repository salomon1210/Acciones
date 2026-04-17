import { prisma } from "@/lib/db/prisma";
import { getQuote, getHistorical } from "@/lib/api/unified";
import { pyIndicators } from "@/lib/api/py";
import { finnhubEarningsCalendar } from "@/lib/api/finnhub";
import { describeAlert, type AlertConfig, type AlertRow } from "@/lib/alerts/types";

export type FiredAlert = {
  alertId: number;
  symbol: string;
  message: string;
  firedAt: Date;
  payload: Record<string, unknown>;
};

// Single cycle of alert evaluation. Intended to be called every 60s by a cron
// runner or by the manual /api/alerts/check endpoint.
export async function runAlertCycle(): Promise<FiredAlert[]> {
  const alerts = (await prisma.alert.findMany({ where: { active: true } })).map((row) => ({
    ...row,
    config: JSON.parse(row.config) as AlertConfig,
  })) as AlertRow[];

  const bySymbol = new Map<string, typeof alerts>();
  for (const a of alerts) {
    if (!bySymbol.has(a.symbol)) bySymbol.set(a.symbol, []);
    bySymbol.get(a.symbol)!.push(a);
  }

  const fired: FiredAlert[] = [];

  for (const [symbol, group] of bySymbol) {
    const quote = await getQuote(symbol).catch(() => null);
    const hist = await getHistorical(symbol, "3mo", "1d").catch(() => null);
    let rsiLatest: number | null = null;
    let smaCrossed: { fast: number; slow: number } | null = null;
    if (hist?.candles.length) {
      try {
        const ind = await pyIndicators(hist.candles);
        const last = ind.points[ind.points.length - 1];
        const prev = ind.points[ind.points.length - 2];
        rsiLatest = last?.rsi14 ?? null;
        if (last && prev && last.ema20 != null && last.ema50 != null && prev.ema20 != null && prev.ema50 != null) {
          if (prev.ema20 <= prev.ema50 && last.ema20 > last.ema50) smaCrossed = { fast: 20, slow: 50 };
          if (prev.ema20 >= prev.ema50 && last.ema20 < last.ema50) smaCrossed = { fast: 20, slow: 50 };
        }
      } catch {
        // ignore
      }
    }

    for (const alert of group) {
      const cfg = alert.config;
      let shouldFire = false;
      const payload: Record<string, unknown> = {};

      switch (cfg.type) {
        case "price_cross_above":
          if (quote?.price && quote.prevClose) {
            if (quote.prevClose < cfg.price && quote.price >= cfg.price) shouldFire = true;
            payload.price = quote.price;
          }
          break;
        case "price_cross_below":
          if (quote?.price && quote.prevClose) {
            if (quote.prevClose > cfg.price && quote.price <= cfg.price) shouldFire = true;
            payload.price = quote.price;
          }
          break;
        case "pct_change":
          if (quote?.changePct != null) {
            const p = quote.changePct * 100;
            if (cfg.pct >= 0 ? p >= cfg.pct : p <= cfg.pct) shouldFire = true;
            payload.changePct = p;
          }
          break;
        case "volume_spike": {
          const candles = hist?.candles ?? [];
          if (candles.length > 20) {
            const last = candles[candles.length - 1];
            const avg20 = candles.slice(-21, -1).reduce((a, c) => a + c.v, 0) / 20;
            if (avg20 > 0 && last.v >= avg20 * cfg.multiplier) shouldFire = true;
            payload.volume = last.v;
            payload.avg20 = avg20;
          }
          break;
        }
        case "rsi_above":
          if (rsiLatest != null && rsiLatest > cfg.value) shouldFire = true;
          payload.rsi = rsiLatest;
          break;
        case "rsi_below":
          if (rsiLatest != null && rsiLatest < cfg.value) shouldFire = true;
          payload.rsi = rsiLatest;
          break;
        case "sma_cross":
          if (smaCrossed) shouldFire = true;
          payload.smaCrossed = smaCrossed;
          break;
        case "earnings_soon": {
          const from = new Date();
          const to = new Date(Date.now() + cfg.daysAhead * 86400_000);
          const cal = await finnhubEarningsCalendar(from, to, symbol).catch(() => []);
          if (cal.length > 0) {
            shouldFire = true;
            payload.earningsDate = cal[0].date;
          }
          break;
        }
      }

      // Avoid re-firing too often: 4h debounce per alert.
      const DEBOUNCE_MS = 4 * 60 * 60_000;
      if (shouldFire && alert.lastTriggered && Date.now() - new Date(alert.lastTriggered).getTime() < DEBOUNCE_MS) {
        shouldFire = false;
      }

      if (shouldFire) {
        const message = describeAlert(symbol, cfg);
        const now = new Date();
        await prisma.alert.update({ where: { id: alert.id }, data: { lastTriggered: now } });
        await prisma.alertEvent.create({
          data: { alertId: alert.id, message, payload: JSON.stringify(payload) },
        });
        fired.push({ alertId: alert.id, symbol, message, firedAt: now, payload });
      }
    }
  }

  return fired;
}
