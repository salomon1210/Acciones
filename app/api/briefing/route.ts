import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const briefings = await prisma.briefing.findMany({
    orderBy: { date: "desc" },
    take: 30,
  });
  return NextResponse.json({ briefings });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = Number(url.searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  await prisma.briefing.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
