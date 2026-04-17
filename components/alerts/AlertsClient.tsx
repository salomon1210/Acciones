"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Criollo, Explain } from "@/components/ui/explain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Bell, BellRing, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import type { AlertConfig, AlertType } from "@/lib/alerts/types";
import { describeAlert } from "@/lib/alerts/types";
import { relativeTime } from "@/lib/utils/format";

type AlertRow = {
  id: number;
  symbol: string;
  type: AlertType;
  active: boolean;
  config: AlertConfig;
  lastTriggered: string | null;
  createdAt: string;
};

type AlertEvent = {
  id: number;
  alertId: number;
  message: string;
  firedAt: string;
  payload: string;
};

const TYPE_LABELS: Record<AlertType, string> = {
  price_cross_above: "Precio cruza hacia arriba",
  price_cross_below: "Precio cruza hacia abajo",
  pct_change: "% cambio diario",
  volume_spike: "Pico de volumen",
  rsi_above: "RSI sobre nivel",
  rsi_below: "RSI bajo nivel",
  sma_cross: "Cruce de medias móviles",
  earnings_soon: "Reporte próximo",
};

const TYPE_HINTS: Record<AlertType, string> = {
  price_cross_above: "Te avisa cuando el precio de la acción sube y atraviesa el nivel que marcaste.",
  price_cross_below: "Te avisa cuando el precio cae por debajo del nivel que marcaste.",
  pct_change: "Te avisa si el activo se mueve más que cierto porcentaje en el día.",
  volume_spike: "Te avisa cuando el volumen operado es mucho mayor al promedio (posible noticia).",
  rsi_above: "RSI > nivel sugiere sobrecompra. Útil para tomar ganancias o cerrar posiciones.",
  rsi_below: "RSI < nivel sugiere sobreventa. A veces hay oportunidad de compra.",
  sma_cross: "Avisa cruces entre media rápida y lenta (golden/death cross).",
  earnings_soon: "Avisa si la empresa reporta resultados dentro del rango de días que elijas.",
};

const DEFAULT_CONFIG: Record<AlertType, AlertConfig> = {
  price_cross_above: { type: "price_cross_above", price: 0 },
  price_cross_below: { type: "price_cross_below", price: 0 },
  pct_change: { type: "pct_change", pct: 5 },
  volume_spike: { type: "volume_spike", multiplier: 2 },
  rsi_above: { type: "rsi_above", value: 70 },
  rsi_below: { type: "rsi_below", value: 30 },
  sma_cross: { type: "sma_cross", fast: 20, slow: 50 },
  earnings_soon: { type: "earnings_soon", daysAhead: 7 },
};

export function AlertsClient() {
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [creating, setCreating] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [type, setType] = useState<AlertType>("price_cross_above");
  const [config, setConfig] = useState<AlertConfig>(DEFAULT_CONFIG["price_cross_above"]);
  const lastEventRef = useRef<number>(0);
  const notifiedRef = useRef<boolean>(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/alerts");
      if (!res.ok) return;
      const data = (await res.json()) as { alerts: AlertRow[]; events: AlertEvent[] };
      setAlerts(data.alerts);
      // notify on new events (ones not seen before)
      if (data.events.length > 0) {
        const newest = data.events[0];
        if (newest && newest.id > lastEventRef.current) {
          if (lastEventRef.current !== 0) {
            for (const ev of data.events) {
              if (ev.id <= lastEventRef.current) break;
              toast(`Alerta: ${ev.message}`, { icon: "🔔" });
              if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                new Notification("Investment Command", { body: ev.message });
              }
            }
          }
          lastEventRef.current = newest.id;
        }
      }
      setEvents(data.events);
    } finally {
      setLoading(false);
    }
  }, []);

  const check = useCallback(async () => {
    try {
      await fetch("/api/alerts/check", { method: "POST" });
      await load();
    } catch {
      // silent
    }
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [check]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && !notifiedRef.current) {
      notifiedRef.current = true;
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => undefined);
      }
    }
  }, []);

  useEffect(() => {
    setConfig(DEFAULT_CONFIG[type]);
  }, [type]);

  async function triggerCheck() {
    setChecking(true);
    try {
      const res = await fetch("/api/alerts/check", { method: "POST" });
      const data = (await res.json()) as { fired: unknown[] };
      await load();
      if (data.fired.length > 0) {
        toast.success(`${data.fired.length} alerta${data.fired.length > 1 ? "s" : ""} disparada${data.fired.length > 1 ? "s" : ""}.`);
      } else {
        toast("Sin disparos en este ciclo.");
      }
    } catch {
      toast.error("No pude ejecutar el chequeo.");
    } finally {
      setChecking(false);
    }
  }

  async function createAlert() {
    const clean = symbol.trim().toUpperCase();
    if (!clean) {
      toast.error("Ingresá un ticker.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: clean, type, config }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "No pude crear la alerta.");
      } else {
        toast.success(`Alerta creada para ${clean}.`);
        setSymbol("");
        await load();
      }
    } finally {
      setCreating(false);
    }
  }

  async function toggleAlert(alert: AlertRow) {
    await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: alert.id, active: !alert.active }),
    });
    await load();
  }

  async function deleteAlert(alert: AlertRow) {
    await fetch(`/api/alerts?id=${alert.id}`, { method: "DELETE" });
    toast.success(`Alerta para ${alert.symbol} eliminada.`);
    await load();
  }

  return (
    <div className="space-y-4">
      <Criollo>
        Creá alertas para que te avisemos cuando un activo cruce un precio, tenga un volumen raro, entre en sobrecompra/sobreventa, o reporte resultados próximamente. Las alertas se chequean cada 60 segundos; si el navegador lo permite, mostramos notificación.
      </Criollo>

      <Card>
        <CardContent className="p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-fg font-medium">Nueva alerta</div>
            <Button size="sm" variant="outline" onClick={triggerCheck} disabled={checking}>
              {checking ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1" />}
              Chequear ahora
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-fg-muted">Ticker</label>
              <Input
                placeholder="AAPL, BTC-USD..."
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="h-8 ticker mt-0.5"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-fg-muted">Tipo</label>
              <Select value={type} onValueChange={(v) => setType(v as AlertType)}>
                <SelectTrigger className="mt-0.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(TYPE_LABELS) as AlertType[]).map((t) => (
                    <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ConfigInputs type={type} config={config} onChange={setConfig} />
          </div>
          <p className="text-[11px] text-fg-dim leading-snug">{TYPE_HINTS[type]}</p>
          <div>
            <Button size="sm" onClick={createAlert} disabled={creating}>
              {creating ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
              Crear alerta
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-fg-dim" />
            <div className="text-xs text-fg font-medium">Alertas activas</div>
            <Badge variant="outline" className="text-[10px]">{alerts.length}</Badge>
          </div>
          {loading ? (
            <div className="text-xs text-fg-dim py-3">Cargando...</div>
          ) : alerts.length === 0 ? (
            <div className="text-xs text-fg-dim py-3">Todavía no creaste alertas. Usá el formulario de arriba.</div>
          ) : (
            <div className="divide-y divide-border/60">
              {alerts.map((a) => (
                <div key={a.id} className="flex items-center gap-3 py-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/analyzer/${a.symbol}`} className="ticker text-fg hover:text-pos">
                        {a.symbol}
                      </Link>
                      {!a.active && <Badge variant="outline" className="text-[10px] opacity-60">pausada</Badge>}
                      {a.lastTriggered && (
                        <span className="text-[10px] text-fg-muted">Último disparo: hace {relativeTime(a.lastTriggered)}</span>
                      )}
                    </div>
                    <div className="text-[11px] text-fg-dim truncate">{describeAlert(a.symbol, a.config)}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => toggleAlert(a)}>
                    {a.active ? "Pausar" : "Activar"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteAlert(a)}>
                    <Trash2 className="w-3.5 h-3.5 text-neg" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <BellRing className="w-3.5 h-3.5 text-fg-dim" />
            <div className="text-xs text-fg font-medium">Últimos disparos</div>
            <Badge variant="outline" className="text-[10px]">{events.length}</Badge>
          </div>
          {events.length === 0 ? (
            <div className="text-xs text-fg-dim py-3">Ninguna alerta se disparó todavía.</div>
          ) : (
            <div className="divide-y divide-border/60">
              {events.map((ev) => (
                <div key={ev.id} className="flex items-start gap-3 py-2 text-xs">
                  <span className="text-[10px] text-fg-muted num whitespace-nowrap mt-0.5">
                    {relativeTime(ev.firedAt)}
                  </span>
                  <span className="text-fg flex-1">{ev.message}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-fg-muted leading-snug pt-1">
            <Explain term="debounce" override={{ label: "debounce", short: "Para no ser molesta, cada alerta se puede disparar como máximo una vez cada 4 horas aunque la condición se mantenga.", long: "Si un precio queda oscilando alrededor del nivel, sólo recibirás una notificación cada 4h hasta que la condición vuelva a ser nueva." }}>
              Debounce 4h
            </Explain>
            {" "}entre disparos de la misma alerta.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ConfigInputs({
  type,
  config,
  onChange,
}: {
  type: AlertType;
  config: AlertConfig;
  onChange: (c: AlertConfig) => void;
}) {
  switch (type) {
    case "price_cross_above":
    case "price_cross_below":
      return (
        <NumField
          label="Precio objetivo (USD)"
          value={(config as { price: number }).price}
          onChange={(v) => onChange({ type, price: v })}
          step={0.01}
        />
      );
    case "pct_change":
      return (
        <NumField
          label="% mínimo (ej. 5 o -5)"
          value={(config as { pct: number }).pct}
          onChange={(v) => onChange({ type: "pct_change", pct: v })}
          step={0.5}
        />
      );
    case "volume_spike":
      return (
        <NumField
          label="Multiplicador vs promedio 20d"
          value={(config as { multiplier: number }).multiplier}
          onChange={(v) => onChange({ type: "volume_spike", multiplier: v })}
          step={0.5}
        />
      );
    case "rsi_above":
    case "rsi_below":
      return (
        <NumField
          label="Nivel RSI (0-100)"
          value={(config as { value: number }).value}
          onChange={(v) => onChange({ type, value: v })}
        />
      );
    case "sma_cross":
      return (
        <>
          <NumField
            label="Media rápida (días)"
            value={(config as { fast: number }).fast}
            onChange={(v) => onChange({ type: "sma_cross", fast: v, slow: (config as { slow: number }).slow })}
          />
          <NumField
            label="Media lenta (días)"
            value={(config as { slow: number }).slow}
            onChange={(v) => onChange({ type: "sma_cross", fast: (config as { fast: number }).fast, slow: v })}
          />
        </>
      );
    case "earnings_soon":
      return (
        <NumField
          label="Días de anticipación"
          value={(config as { daysAhead: number }).daysAhead}
          onChange={(v) => onChange({ type: "earnings_soon", daysAhead: v })}
        />
      );
  }
}

function NumField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-fg-muted">{label}</label>
      <Input
        type="number"
        value={value}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-8 num mt-0.5"
      />
    </div>
  );
}
