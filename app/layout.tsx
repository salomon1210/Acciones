import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopBar } from "@/components/shell/TopBar";
import { CommandBar } from "@/components/shell/CommandBar";
import { OnboardingTour } from "@/components/shell/OnboardingTour";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Investment Command",
  description: "Mesa de análisis de inversiones — análisis fundamental, técnico y AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} font-sans bg-bg text-fg antialiased`}>
        <TooltipProvider delayDuration={150}>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <TopBar />
              <main className="flex-1 overflow-y-auto">{children}</main>
              <footer className="border-t border-border bg-surface px-6 py-2 text-[11px] text-fg-dim">
                Herramienta educativa y de análisis personal. No constituye asesoramiento financiero. Las inversiones pueden perder valor.
              </footer>
            </div>
          </div>
          <CommandBar />
          <OnboardingTour />
          <Toaster theme="dark" richColors position="bottom-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}
