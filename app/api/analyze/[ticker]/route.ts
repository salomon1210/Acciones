import { NextResponse } from "next/server";
import { getFundamentals } from "@/lib/api/unified";

// Phase 3 stub. In Phase 6 this is replaced with a full Claude call
// that reads fundamentals, technicals, news and filings.
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY missing" },
      { status: 503 }
    );
  }
  const fundamentals = await getFundamentals(ticker);
  if (!fundamentals) {
    return NextResponse.json({ error: "no data" }, { status: 404 });
  }
  // Real Claude integration lands in Phase 6. Returning a minimal stub for now.
  return NextResponse.json({
    verdict: "mantener",
    confidence: 0.5,
    bull: [
      "Análisis profundo disponible en Fase 6.",
      "La estructura y el flujo ya está lista.",
      "Configuración con Claude pendiente.",
    ],
    bear: [
      "Sin integración completa a Claude todavía.",
      "El veredicto heurístico se usa de base.",
      "Falta combinar técnicos + macro + news.",
    ],
    summary: "La capa AI se activa completa en la Fase 6. Por ahora el veredicto heurístico del lado cliente es el que vale.",
    aiPowered: false,
  });
}
