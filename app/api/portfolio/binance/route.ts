import { NextResponse } from "next/server";
import { syncBinancePositions } from "@/lib/portfolio/service";
import { binanceAvailable } from "@/lib/api/binance";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!binanceAvailable()) {
    return NextResponse.json(
      { error: "Binance no está configurado. Agregá BINANCE_API_KEY y BINANCE_API_SECRET en .env.local." },
      { status: 503 }
    );
  }
  const res = await syncBinancePositions();
  return NextResponse.json(res);
}
