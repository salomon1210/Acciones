type CronGlobal = typeof globalThis & { __ic_cron_registered?: boolean };
const g = globalThis as CronGlobal;

export function registerCrons() {
  if (g.__ic_cron_registered) return;
  g.__ic_cron_registered = true;

  setInterval(async () => {
    try {
      const { runAlertCycle } = await import("@/lib/alerts/engine");
      await runAlertCycle();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[cron] alert cycle failed", err);
    }
  }, 60_000);

  let lastBriefingDay = -1;
  setInterval(async () => {
    const now = new Date();
    if (now.getHours() === 8 && now.getMinutes() === 30 && now.getDate() !== lastBriefingDay) {
      lastBriefingDay = now.getDate();
      try {
        const { generateAndPersistBriefing } = await import("@/lib/briefing/service");
        await generateAndPersistBriefing();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("[cron] briefing failed", err);
      }
    }
  }, 60_000);
}
