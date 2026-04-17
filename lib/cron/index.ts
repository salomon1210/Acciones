import cron from "node-cron";
import { runAlertCycle } from "@/lib/alerts/engine";

// Global guard so we never register the same cron task twice across
// hot-reloads in dev mode or across Next.js instrumentation boots.
type CronGlobal = typeof globalThis & { __ic_cron_registered?: boolean };
const g = globalThis as CronGlobal;

export function registerCrons() {
  if (g.__ic_cron_registered) return;
  g.__ic_cron_registered = true;

  // Alerts: every minute.
  cron.schedule("* * * * *", async () => {
    try {
      await runAlertCycle();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[cron] alert cycle failed", err);
    }
  });

  // Daily briefing: 08:30 local time.
  cron.schedule("30 8 * * *", async () => {
    try {
      const { generateAndPersistBriefing } = await import("@/lib/briefing/service");
      await generateAndPersistBriefing();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[cron] briefing failed", err);
    }
  });
}
