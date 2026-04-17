// Generic Claude passthrough for experimental prompts from the UI.
// Gated behind ANTHROPIC_API_KEY and hard limits.

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { OPUS, HAIKU, claudeAvailable } from "@/lib/api/claude";

export const dynamic = "force-dynamic";

type Body = {
  prompt: string;
  system?: string;
  fast?: boolean;
  maxTokens?: number;
};

export async function POST(req: Request) {
  if (!claudeAvailable()) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY missing" }, { status: 503 });
  }
  const body = (await req.json()) as Body;
  if (!body.prompt) return NextResponse.json({ error: "missing prompt" }, { status: 400 });

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const msg = await client.messages.create({
    model: body.fast ? HAIKU : OPUS,
    max_tokens: Math.min(body.maxTokens ?? 1500, 3000),
    system: body.system,
    messages: [{ role: "user", content: body.prompt }],
  });
  const text = msg.content.map((c) => (c.type === "text" ? c.text : "")).join("");
  return NextResponse.json({ text });
}
