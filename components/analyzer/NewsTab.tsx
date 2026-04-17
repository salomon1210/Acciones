import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Criollo } from "@/components/ui/explain";
import { Badge } from "@/components/ui/badge";
import { relativeTime } from "@/lib/utils/format";

export type TickerNewsItem = {
  headline: string;
  url: string;
  source: string;
  summary?: string | null;
  datetime: number; // ms or seconds
  sentiment?: "pos" | "neu" | "neg" | null;
};

function sentimentBadge(s: TickerNewsItem["sentiment"]) {
  if (s === "pos") return { variant: "pos" as const, text: "positiva" };
  if (s === "neg") return { variant: "neg" as const, text: "negativa" };
  if (s === "neu") return { variant: "default" as const, text: "neutra" };
  return null;
}

export function NewsTab({ news }: { news: TickerNewsItem[] }) {
  return (
    <div className="space-y-4">
      <Criollo>
        Últimas noticias de la empresa. El sentiment es una estimación automática de si el titular es positivo, negativo o neutro para la acción.
      </Criollo>

      <Card>
        <CardHeader>
          <CardTitle>Últimas {news.length || 0} noticias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {news.length === 0 ? (
            <div className="p-4 text-xs text-fg-dim text-center">
              No encontré noticias para este ticker. Configurá FINNHUB_API_KEY o MARKETAUX_API_KEY para feed completo.
            </div>
          ) : (
            news.map((n, i) => {
              const badge = sentimentBadge(n.sentiment ?? null);
              const ts = n.datetime > 1e12 ? n.datetime : n.datetime * 1000;
              return (
                <a
                  key={i}
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border border-border rounded-md p-3 hover:bg-surface-2 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-sm text-fg leading-snug">{n.headline}</div>
                      {n.summary && (
                        <p className="text-[11px] text-fg-dim mt-1 line-clamp-2 leading-relaxed">{n.summary}</p>
                      )}
                      <div className="flex items-center gap-2 text-[10px] text-fg-muted mt-2">
                        <span>{n.source}</span>
                        <span>·</span>
                        <span>{relativeTime(ts)}</span>
                      </div>
                    </div>
                    {badge && <Badge variant={badge.variant}>{badge.text}</Badge>}
                  </div>
                </a>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
