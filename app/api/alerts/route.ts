import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { AlertConfig, AlertType } from "@/lib/alerts/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const alerts = await prisma.alert.findMany({ orderBy: { createdAt: "desc" } });
  const events = await prisma.alertEvent.findMany({ orderBy: { firedAt: "desc" }, take: 50 });
  return NextResponse.json({
    alerts: alerts.map((a) => ({ ...a, config: JSON.parse(a.config) })),
    events,
  });
}

export async function POST(req: Request) {
  const body = (await req.json()) as { symbol: string; type: AlertType; config: AlertConfig };
  if (!body.symbol || !body.type || !body.config) {
    return NextResponse.json({ error: "payload invalido" }, { status: 400 });
  }
  const alert = await prisma.alert.create({
    data: {
      symbol: body.symbol.toUpperCase(),
      type: body.type,
      config: JSON.stringify(body.config),
    },
  });
  return NextResponse.json({ alert: { ...alert, config: body.config } });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = Number(url.searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  await prisma.alert.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}

export async function PATCH(req: Request) {
  const body = (await req.json()) as { id: number; active?: boolean };
  if (!body.id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  const alert = await prisma.alert.update({
    where: { id: body.id },
    data: { active: body.active },
  });
  return NextResponse.json({ alert });
}
