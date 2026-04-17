import { PortfolioClient } from "@/components/portfolio/PortfolioClient";
import { getPortfolioSummary } from "@/lib/portfolio/service";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const summary = await getPortfolioSummary();
  return (
    <div className="p-4 space-y-4 max-w-6xl mx-auto">
      <div>
        <h1 className="text-lg font-semibold text-fg">Portfolio</h1>
        <p className="text-xs text-fg-dim mt-0.5">Todo tu patrimonio en un lugar. Sincronizá Binance y subí un CSV con tus posiciones de broker.</p>
      </div>
      <PortfolioClient initial={summary} />
    </div>
  );
}
