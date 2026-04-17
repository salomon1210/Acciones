// Claude integration layer.
// Models: claude-opus-4-7 for deep analysis, claude-haiku-4-5-20251001 for
// sentiment / news summary at scale.

import Anthropic from "@anthropic-ai/sdk";

export const OPUS = "claude-opus-4-7";
export const HAIKU = "claude-haiku-4-5-20251001";

const KEY = process.env.ANTHROPIC_API_KEY;

export const claudeAvailable = () => !!KEY;

function client(): Anthropic | null {
  if (!KEY) return null;
  return new Anthropic({ apiKey: KEY });
}

const SYSTEM_ANALYST = `Sos un equity analyst senior con CFA charter. Tenés un sesgo por valor y por rigor cuantitativo.
Cuando analizás algo, citás siempre las fuentes concretas (P/E = X, margen Y, etc.). No inventás números ni reemplazás data faltante con suposiciones.
Si los datos no alcanzan para formar una opinión, decís que no alcanzan.
Escribís en español argentino neutro, en lenguaje claro y accesible para alguien que no es experto financiero.
Evitás jerga innecesaria. Si usás un término técnico lo explicás en una frase.
NUNCA das consejos financieros directos; tu output es análisis educativo.`;

type AnalyzeFundamentalsArgs = {
  symbol: string;
  fundamentals: Record<string, unknown>;
  peers?: Array<Record<string, unknown>>;
};

async function extractJson<T>(raw: string): Promise<T | null> {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    return null;
  }
}

export async function analyzeFundamentals(args: AnalyzeFundamentalsArgs) {
  const a = client();
  if (!a) return null;
  const prompt = `Analizá los fundamentals de ${args.symbol}.
Data clave en JSON: ${JSON.stringify(args.fundamentals).slice(0, 6000)}.
Devolvé un JSON con: { "strengths": string[], "weaknesses": string[], "quality": "alta"|"media"|"baja", "rationale": string }.`;
  const msg = await a.messages.create({
    model: OPUS,
    max_tokens: 800,
    system: SYSTEM_ANALYST,
    messages: [{ role: "user", content: prompt }],
  });
  const text = msg.content.map((c) => (c.type === "text" ? c.text : "")).join("");
  return extractJson<{ strengths: string[]; weaknesses: string[]; quality: string; rationale: string }>(text);
}

export async function evaluateMoats(args: { symbol: string; summary: string; metrics: Record<string, unknown> }) {
  const a = client();
  if (!a) return null;
  const prompt = `Evaluá las ventajas competitivas ("moats") de ${args.symbol}.
Descripción del negocio: ${args.summary}.
Métricas: ${JSON.stringify(args.metrics).slice(0, 3000)}.
Devolvé JSON: { "intangibles": {score: 0-5, rationale: string}, "network": {score, rationale}, "cost": {score, rationale}, "switching": {score, rationale}, "overall": "ancho"|"medio"|"angosto"|"sin moat" }.`;
  const msg = await a.messages.create({
    model: OPUS,
    max_tokens: 900,
    system: SYSTEM_ANALYST,
    messages: [{ role: "user", content: prompt }],
  });
  const text = msg.content.map((c) => (c.type === "text" ? c.text : "")).join("");
  return extractJson<{
    intangibles: { score: number; rationale: string };
    network: { score: number; rationale: string };
    cost: { score: number; rationale: string };
    switching: { score: number; rationale: string };
    overall: string;
  }>(text);
}

export async function summarizeNews(args: { headline: string; summary?: string; tickers?: string[] }) {
  const a = client();
  if (!a) return null;
  const prompt = `Resumí y dame el impacto esperado de esta noticia para inversores en máximo 4 frases.
Titular: ${args.headline}.
${args.summary ? `Descripción: ${args.summary}.` : ""}
${args.tickers?.length ? `Tickers: ${args.tickers.join(", ")}.` : ""}
Devolvé JSON: { "summary": string (2 frases), "impact": string (2 frases sobre impacto corto plazo y si es material) }.`;
  const msg = await a.messages.create({
    model: HAIKU,
    max_tokens: 400,
    system: "Sos un analista financiero que explica noticias en criollo, en español argentino, con precisión pero sin jerga.",
    messages: [{ role: "user", content: prompt }],
  });
  const text = msg.content.map((c) => (c.type === "text" ? c.text : "")).join("");
  return extractJson<{ summary: string; impact: string }>(text);
}

export async function classifySentiment(headline: string, summary?: string): Promise<"positive" | "neutral" | "negative" | null> {
  const a = client();
  if (!a) return null;
  const msg = await a.messages.create({
    model: HAIKU,
    max_tokens: 10,
    system: "Clasificás noticias financieras por sentiment para inversores de la empresa. Respondés solo con una palabra: positive, negative o neutral.",
    messages: [{ role: "user", content: `Titular: ${headline}\n${summary ?? ""}` }],
  });
  const text = msg.content.map((c) => (c.type === "text" ? c.text : "")).join("").toLowerCase().trim();
  if (text.includes("positive")) return "positive";
  if (text.includes("negative")) return "negative";
  if (text.includes("neutral")) return "neutral";
  return null;
}

export async function synthesizeVerdict(args: {
  symbol: string;
  fundamentals: Record<string, unknown>;
  technicals: Record<string, unknown>;
  risk: Record<string, unknown>;
  newsHeadlines: string[];
}) {
  const a = client();
  if (!a) return null;
  const prompt = `Construí un veredicto de inversión integrado para ${args.symbol}.
Combiná fundamentals, técnico, riesgo y noticias recientes.
Data:
- Fundamentals: ${JSON.stringify(args.fundamentals).slice(0, 4000)}
- Técnico: ${JSON.stringify(args.technicals).slice(0, 1500)}
- Riesgo: ${JSON.stringify(args.risk).slice(0, 1000)}
- Últimos titulares: ${args.newsHeadlines.slice(0, 8).join(" | ")}

Devolvé JSON: {
  "verdict": "comprar"|"mantener"|"evitar",
  "confidence": number 0-1,
  "bull": string[3],
  "bear": string[3],
  "summary": string (3 frases redactadas en criollo, para alguien no-experto)
}`;
  const msg = await a.messages.create({
    model: OPUS,
    max_tokens: 1000,
    system: SYSTEM_ANALYST,
    messages: [{ role: "user", content: prompt }],
  });
  const text = msg.content.map((c) => (c.type === "text" ? c.text : "")).join("");
  return extractJson<{
    verdict: "comprar" | "mantener" | "evitar";
    confidence: number;
    bull: string[];
    bear: string[];
    summary: string;
  }>(text);
}

export async function extractRisks(args: { symbol: string; filingText: string }) {
  const a = client();
  if (!a) return null;
  const prompt = `Del siguiente extracto de un 10-K/10-Q de ${args.symbol}, listá los 5 factores de riesgo más relevantes para un inversor, en español, priorizando los que son materiales y no genéricos.
Texto: ${args.filingText.slice(0, 8000)}
Devolvé JSON: { "risks": [{"title": string, "summary": string, "severity": "alta"|"media"|"baja"}] }.`;
  const msg = await a.messages.create({
    model: OPUS,
    max_tokens: 1200,
    system: SYSTEM_ANALYST,
    messages: [{ role: "user", content: prompt }],
  });
  const text = msg.content.map((c) => (c.type === "text" ? c.text : "")).join("");
  return extractJson<{ risks: Array<{ title: string; summary: string; severity: string }> }>(text);
}

export async function generateBriefing(args: {
  date: string;
  indices: Record<string, { change: number; price: number }>;
  portfolioMovers: Array<{ symbol: string; pct: number }>;
  topNews: string[];
  earningsToday: Array<{ symbol: string; when: string }>;
  portfolioYtd?: number;
  spyYtd?: number;
}) {
  const a = client();
  if (!a) return null;
  const prompt = `Generá el briefing diario de mercados en español argentino neutro para un inversor de perfil generalista.
Fecha: ${args.date}
Índices: ${JSON.stringify(args.indices)}
Movimientos del portfolio / watchlist: ${JSON.stringify(args.portfolioMovers).slice(0, 1500)}
Top noticias: ${args.topNews.slice(0, 8).join(" | ")}
Earnings de hoy: ${JSON.stringify(args.earningsToday).slice(0, 800)}
${args.portfolioYtd != null ? `Portfolio YTD: ${(args.portfolioYtd * 100).toFixed(1)}%` : ""}
${args.spyYtd != null ? `S&P YTD: ${(args.spyYtd * 100).toFixed(1)}%` : ""}

Formato en Markdown con secciones:
1. Resumen de mercados (2-3 frases)
2. Qué mirar hoy (bullets)
3. Portfolio / watchlist highlights
4. Earnings del día
5. Una pregunta provocadora para pensar

Tono: profesional pero cercano. Sin jerga innecesaria.`;
  const msg = await a.messages.create({
    model: OPUS,
    max_tokens: 2000,
    system: SYSTEM_ANALYST,
    messages: [{ role: "user", content: prompt }],
  });
  return msg.content.map((c) => (c.type === "text" ? c.text : "")).join("");
}
