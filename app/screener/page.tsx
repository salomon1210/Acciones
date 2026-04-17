import { ScreenerClient } from "@/components/screener/ScreenerClient";

export const dynamic = "force-dynamic";

export default function ScreenerPage() {
  return (
    <div className="p-4 space-y-4 max-w-6xl mx-auto">
      <div>
        <h1 className="text-lg font-semibold text-fg">Screener</h1>
        <p className="text-xs text-fg-dim mt-0.5">Filtros multi-factor sobre un universo de empresas grandes. Usá presets o armá tu propia combinación.</p>
      </div>
      <ScreenerClient />
    </div>
  );
}
