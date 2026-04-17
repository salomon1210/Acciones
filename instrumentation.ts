// Server-side instrumentation hook.
// Alert polling runs client-side every 60s via /api/alerts/check.
// Daily briefing is triggered manually or by an external cron/scheduler.
export async function register() {
  // No-op. Kept for future use (e.g. OTEL tracing).
}
