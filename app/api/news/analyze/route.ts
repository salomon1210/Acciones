import { NextResponse } from "next/server";
import { claudeAvailable, summarizeNews } from "@/lib/api/claude";

export const dynamic = "force-dynamic";

type Body = {
  headline: string;
  summary?: string;
  tickers?: string[];
};

function heuristicReading(b: Body) {
  const text = (b.headline + " " + (b.summary ?? "")).toLowerCase();
  const positive = /beat|surge|soar|record|grows|strong|upgrade|rally|raise|boost|expand/.test(text);
  const negative = /miss|fall|plunge|drop|cut|downgrade|warns|loss|probe|lawsuit|fraud|weak|decline/.test(text);
  const target = b.tickers?.[0] ? `la acción de ${b.tickers[0]}` : "el activo relacionado";

  let impact: string;
  if (positive && !negative) {
    impact = `La noticia tiene tono positivo. Puede generar presión compradora sobre ${target} en el corto plazo, aunque el efecto depende de si ya estaba descontado en el precio.`;
  } else if (negative && !positive) {
    impact = `La noticia trae un tono negativo. Puede presionar ${target} a la baja. Mirá si es un problema puntual o estructural antes de operar.`;
  } else {
    impact = `El titular es neutro o mixto. Por sí solo no debería mover fuerte ${target}, pero conviene revisar si forma parte de una serie de noticias en la misma dirección.`;
  }

  return {
    summary: `${b.headline}. ${b.summary ?? ""}`.trim(),
    impact,
    aiPowered: false,
  };
}

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  if (!body.headline) return NextResponse.json({ error: "missing headline" }, { status: 400 });

  if (!claudeAvailable()) {
    return NextResponse.json(heuristicReading(body));
  }

  const res = await summarizeNews(body).catch(() => null);
  if (!res) {
    return NextResponse.json(heuristicReading(body));
  }
  return NextResponse.json({ ...res, aiPowered: true });
}
