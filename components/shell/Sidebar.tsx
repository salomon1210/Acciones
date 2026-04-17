"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LineChart,
  Newspaper,
  Briefcase,
  Filter,
  Bell,
  Sunrise,
  BookOpen,
  ChevronLeft,
  Command,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUI } from "@/lib/stores/ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import * as DialogPrimitive from "@radix-ui/react-dialog";

const NAV = [
  { href: "/", label: "Dashboard", icon: Home, desc: "Resumen de mercado y tu portfolio" },
  { href: "/analyzer/AAPL", label: "Analizador", icon: LineChart, desc: "Análisis completo de un activo" },
  { href: "/news", label: "Noticias", icon: Newspaper, desc: "Noticias con sentiment AI" },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase, desc: "Tus posiciones y performance" },
  { href: "/screener", label: "Screener", icon: Filter, desc: "Buscar oportunidades con filtros" },
  { href: "/alerts", label: "Alertas", icon: Bell, desc: "Notificaciones automáticas" },
  { href: "/briefing", label: "Briefing", icon: Sunrise, desc: "Resumen diario del mercado" },
  { href: "/glossary", label: "Glosario", icon: BookOpen, desc: "Términos explicados en criollo" },
];

function NavBody({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { setCommandOpen } = useUI();

  return (
    <>
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-0.5 px-2">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href.split("/").slice(0, 2).join("/"));
            const link = (
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex h-10 md:h-8 items-center gap-2 rounded px-2 text-xs transition-colors",
                  active ? "bg-surface-2 text-fg" : "text-fg-dim hover:bg-surface-2 hover:text-fg",
                  collapsed && "justify-center px-0"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
            return (
              <li key={item.href}>
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right">
                      <div className="space-y-0.5">
                        <div className="font-medium text-fg">{item.label}</div>
                        <div className="text-[11px] text-fg-dim">{item.desc}</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  link
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-2">
        <button
          onClick={() => {
            setCommandOpen(true);
            onNavigate?.();
          }}
          className={cn(
            "flex w-full items-center gap-2 rounded border border-border bg-bg px-2 py-2 md:py-1.5 text-xs text-fg-dim hover:text-fg transition-colors",
            collapsed && "justify-center"
          )}
        >
          <Command className="h-3.5 w-3.5" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">Buscar…</span>
              <span className="chip !px-1.5 !py-0 hidden md:inline">⌘K</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, mobileNavOpen, setMobileNavOpen } = useUI();

  return (
    <>
      {/* Desktop (md+) */}
      <aside
        className={cn(
          "hidden md:flex h-full flex-col border-r border-border bg-surface transition-[width] duration-200",
          sidebarCollapsed ? "w-[56px]" : "w-[220px]"
        )}
      >
        <div className="flex h-12 items-center justify-between border-b border-border px-3">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-fg flex items-center justify-center">
                <span className="text-[10px] font-bold text-bg">IC</span>
              </div>
              <span className="text-sm font-semibold tracking-tight">Investment Cmd</span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="rounded p-1 text-fg-dim hover:bg-surface-2 hover:text-fg"
            aria-label={sidebarCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", sidebarCollapsed && "rotate-180")} />
          </button>
        </div>
        <NavBody collapsed={sidebarCollapsed} />
      </aside>

      {/* Mobile drawer */}
      <DialogPrimitive.Root open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden" />
          <DialogPrimitive.Content
            className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-border bg-surface shadow-xl md:hidden"
            aria-describedby={undefined}
          >
            <DialogPrimitive.Title className="sr-only">Menú</DialogPrimitive.Title>
            <div className="flex h-12 items-center justify-between border-b border-border px-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-fg flex items-center justify-center">
                  <span className="text-[10px] font-bold text-bg">IC</span>
                </div>
                <span className="text-sm font-semibold tracking-tight">Investment Cmd</span>
              </div>
              <DialogPrimitive.Close
                className="rounded p-1 text-fg-dim hover:bg-surface-2 hover:text-fg"
                aria-label="Cerrar menú"
              >
                <ChevronLeft className="h-4 w-4" />
              </DialogPrimitive.Close>
            </div>
            <NavBody collapsed={false} onNavigate={() => setMobileNavOpen(false)} />
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
