import { IndicesBar } from "@/components/dashboard/IndicesBar";
import { PortfolioSummary } from "@/components/dashboard/PortfolioSummary";
import { TopMovers } from "@/components/dashboard/TopMovers";
import { NewsMini } from "@/components/dashboard/NewsMini";
import { AlertsStatus } from "@/components/dashboard/AlertsStatus";

export default function DashboardPage() {
  return (
    <div className="space-y-4 p-3 md:p-6">
      <div>
        <h1 className="text-lg font-semibold text-fg">Dashboard</h1>
        <p className="text-xs text-fg-dim mt-0.5">
          Tu panorama diario: índices globales, tu portfolio, alertas y noticias.
        </p>
      </div>

      <IndicesBar />

      <div className="grid gap-4 lg:grid-cols-3">
        <PortfolioSummary />
        <TopMovers />
        <AlertsStatus />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <NewsMini />
        <div className="card p-6 flex flex-col justify-center">
          <div className="text-[10px] uppercase tracking-wider text-fg-muted">Briefing diario</div>
          <h2 className="text-sm font-semibold text-fg mt-1">Todavía no generaste el briefing de hoy</h2>
          <p className="text-xs text-fg-dim mt-2 leading-relaxed">
            Cada mañana la AI resume el movimiento de mercados, las noticias relevantes para tu portfolio, earnings del día y eventos macro — todo en un mismo lugar.
          </p>
          <a href="/briefing" className="mt-4 inline-block text-xs text-fg hover:underline">
            Generar ahora →
          </a>
        </div>
      </div>
    </div>
  );
}
