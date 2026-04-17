import { NewsFeed } from "@/components/news/NewsFeed";

export const dynamic = "force-dynamic";

export default function NewsPage() {
  return (
    <div className="p-3 md:p-4 space-y-4 max-w-5xl mx-auto">
      <div>
        <h1 className="text-lg font-semibold text-fg">Noticias</h1>
        <p className="text-xs text-fg-dim mt-0.5">Feed en vivo con sentiment. Hacé clic en una noticia para ver qué significa.</p>
      </div>
      <NewsFeed />
    </div>
  );
}
