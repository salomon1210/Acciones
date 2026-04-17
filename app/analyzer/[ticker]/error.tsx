"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AnalyzerError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-warn">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-sm font-semibold">No pude cargar el análisis</h2>
          </div>
          <p className="text-xs text-fg-dim leading-relaxed">
            Algo falló trayendo los datos del ticker. Puede ser que el servidor de yfinance esté lento, que el ticker no exista, o que la clave de API esté vencida. Probá de nuevo en unos segundos.
          </p>
          {process.env.NODE_ENV === "development" && (
            <pre className="text-[10px] text-fg-muted bg-surface-2 p-2 rounded overflow-x-auto">{error.message}</pre>
          )}
          <Button size="sm" onClick={reset}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reintentar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
