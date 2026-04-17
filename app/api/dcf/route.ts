import { NextResponse } from "next/server";
import { pyDcf } from "@/lib/api/py";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await pyDcf(body);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "DCF failed" },
      { status: 502 }
    );
  }
}
