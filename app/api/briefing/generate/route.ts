import { NextResponse } from "next/server";
import { generateAndPersistBriefing } from "@/lib/briefing/service";

export const dynamic = "force-dynamic";

export async function POST() {
  const briefing = await generateAndPersistBriefing();
  return NextResponse.json({ briefing });
}
