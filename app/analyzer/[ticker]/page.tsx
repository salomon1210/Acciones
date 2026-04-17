import { formatTicker } from "@/lib/utils/format";

export default async function AnalyzerPlaceholder({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold ticker">{formatTicker(ticker)}</h1>
      <p className="text-xs text-fg-dim mt-1">
        Analizador de 10 pestañas — disponible en Fase 3.
      </p>
    </div>
  );
}
