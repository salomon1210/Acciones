import { Badge } from "@/components/ui/badge";
import type { Sentiment } from "@/lib/api/news-unified";

export function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  if (!sentiment) return <Badge variant="default">neutra</Badge>;
  if (sentiment === "positive") return <Badge variant="pos">positiva</Badge>;
  if (sentiment === "negative") return <Badge variant="neg">negativa</Badge>;
  return <Badge variant="default">neutra</Badge>;
}
