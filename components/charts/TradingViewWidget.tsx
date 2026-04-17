"use client";

import { useEffect, useRef, memo } from "react";

type Props = {
  symbol: string;
  height?: number;
  interval?: "D" | "W" | "M" | "60" | "240";
};

function TradingViewWidgetBase({ symbol, height = 420, interval = "D" }: Props) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval,
      timezone: "America/Argentina/Buenos_Aires",
      theme: "dark",
      style: "1",
      locale: "es",
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: false,
      save_image: false,
      studies: ["RSI@tv-basicstudies", "MACD@tv-basicstudies"],
      support_host: "https://www.tradingview.com",
    });
    container.current.appendChild(script);
  }, [symbol, interval]);

  return (
    <div className="tradingview-widget-container" style={{ height, width: "100%" }}>
      <div ref={container} className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }} />
    </div>
  );
}

export const TradingViewWidget = memo(TradingViewWidgetBase);
