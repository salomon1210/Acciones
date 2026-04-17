export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NODE_ENV === "test") return;
  const { registerCrons } = await import("@/lib/cron");
  registerCrons();
}
