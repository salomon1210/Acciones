import { prisma } from "@/lib/db/prisma";
import { BriefingClient } from "@/components/briefing/BriefingClient";

export const dynamic = "force-dynamic";

export default async function BriefingPage() {
  const rows = await prisma.briefing.findMany({
    orderBy: { date: "desc" },
    take: 30,
  });
  const initial = rows.map((r) => ({
    id: r.id,
    date: r.date.toISOString(),
    markdown: r.markdown,
    metadata: r.metadata,
  }));

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">
      <div>
        <h1 className="text-lg font-semibold text-fg">Briefing diario</h1>
        <p className="text-xs text-fg-dim mt-0.5">Tu resumen AI del mercado, portfolio y noticias. Se genera automáticamente a las 08:30 hora local.</p>
      </div>
      <BriefingClient initial={initial} />
    </div>
  );
}
