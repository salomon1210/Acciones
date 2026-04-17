import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-fg">
            <Compass className="h-5 w-5 text-fg-dim" />
            <h2 className="text-sm font-semibold">No encontré esta página</h2>
          </div>
          <p className="text-xs text-fg-dim leading-relaxed">
            La ruta que buscás no existe. Volvé al dashboard o usá Cmd/Ctrl+K para buscar un ticker.
          </p>
          <Link href="/">
            <Button size="sm">Volver al dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
