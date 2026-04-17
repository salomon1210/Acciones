import { NextResponse } from "next/server";
import { runAlertCycle } from "@/lib/alerts/engine";

export const dynamic = "force-dynamic";

export async function POST() {
  const fired = await runAlertCycle();
  return NextResponse.json({ fired });
}

export async function GET() {
  const fired = await runAlertCycle();
  return NextResponse.json({ fired });
}
