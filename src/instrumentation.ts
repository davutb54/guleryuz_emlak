export async function register() {
  // Sadece Node.js runtime'da çalış (Edge runtime'da değil)
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const cron = await import("node-cron");
  const { checkSearchAlerts } = await import("./lib/cron");

  // Her gün 22:00'de arama alarmlarını kontrol et (Türkiye saati)
  cron.default.schedule("0 22 * * *", checkSearchAlerts, {
    timezone: "Europe/Istanbul",
  });

  console.log("[instrumentation] Arama alarm cron'u kayıt edildi (her gün 22:00).");
}
