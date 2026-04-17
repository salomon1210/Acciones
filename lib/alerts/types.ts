export type AlertType =
  | "price_cross_above"
  | "price_cross_below"
  | "pct_change"
  | "volume_spike"
  | "rsi_above"
  | "rsi_below"
  | "sma_cross"
  | "earnings_soon";

export type AlertConfig =
  | { type: "price_cross_above" | "price_cross_below"; price: number }
  | { type: "pct_change"; pct: number; windowHours?: number }
  | { type: "volume_spike"; multiplier: number }
  | { type: "rsi_above" | "rsi_below"; value: number }
  | { type: "sma_cross"; fast: number; slow: number }
  | { type: "earnings_soon"; daysAhead: number };

export type AlertRow = {
  id: number;
  symbol: string;
  type: AlertType;
  config: AlertConfig;
  active: boolean;
  lastTriggered: Date | null;
  createdAt: Date;
};

export function describeAlert(symbol: string, config: AlertConfig): string {
  switch (config.type) {
    case "price_cross_above":
      return `${symbol} cruza $${config.price} hacia arriba`;
    case "price_cross_below":
      return `${symbol} cruza $${config.price} hacia abajo`;
    case "pct_change":
      return `${symbol} se mueve ${config.pct > 0 ? "+" : ""}${config.pct}% en ${config.windowHours ?? 24}h`;
    case "volume_spike":
      return `${symbol} con volumen ${config.multiplier}× el promedio`;
    case "rsi_above":
      return `${symbol} con RSI > ${config.value} (sobrecompra)`;
    case "rsi_below":
      return `${symbol} con RSI < ${config.value} (sobreventa)`;
    case "sma_cross":
      return `${symbol} cruce SMA ${config.fast}/${config.slow}`;
    case "earnings_soon":
      return `${symbol} reporta en ≤ ${config.daysAhead} días`;
  }
}
