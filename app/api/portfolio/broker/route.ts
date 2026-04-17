import { NextResponse } from "next/server";
import { parseBrokerCsv, importBrokerPositions } from "@/lib/portfolio/service";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";
  let text: string;
  if (contentType.includes("application/json")) {
    const body = (await req.json()) as { csv?: string };
    text = body.csv ?? "";
  } else {
    text = await req.text();
  }
  if (!text.trim()) {
    return NextResponse.json({ error: "CSV vacío" }, { status: 400 });
  }
  const rows = parseBrokerCsv(text);
  if (rows.length === 0) {
    return NextResponse.json({ error: "No pude parsear filas. Verificá el formato." }, { status: 400 });
  }
  const imported = await importBrokerPositions(rows);
  return NextResponse.json({ imported });
}

export async function DELETE() {
  await prisma.position.deleteMany({ where: { source: "broker-csv" } });
  return NextResponse.json({ deleted: true });
}
