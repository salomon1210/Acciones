import { AlertsClient } from "@/components/alerts/AlertsClient";

export const dynamic = "force-dynamic";

export default function AlertsPage() {
  return (
    <div className="p-3 md:p-4 space-y-4 max-w-6xl mx-auto">
      <div>
        <h1 className="text-lg font-semibold text-fg">Alertas</h1>
        <p className="text-xs text-fg-dim mt-0.5">Configurá avisos automáticos para tus tickers. El motor se ejecuta cada 60 segundos.</p>
      </div>
      <AlertsClient />
    </div>
  );
}
