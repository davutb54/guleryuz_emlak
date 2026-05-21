// In-memory rate limiter — Node.js process başına çalışır (tek process / PM2 cluster=1)
// Key bazlı: her key için attempt sayısı + pencere başlangıcı tutulur.

type Entry = { count: number; windowStart: number };
const store = new Map<string, Entry>();

// Eski kayıtları temizle (bellek sızıntısını önle)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now - entry.windowStart > 30 * 60 * 1000) store.delete(key);
  }
}, 5 * 60 * 1000);

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  if (entry.count >= limit) {
    const retryAfterMs = windowMs - (now - entry.windowStart);
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, retryAfterMs: 0 };
}

// Login: 5 deneme / 15 dakika per e-posta
export function checkLoginRateLimit(email: string) {
  return checkRateLimit(`login:${email.toLowerCase()}`, 5, 15 * 60 * 1000);
}

// Kayıt: 3 deneme / 10 dakika per IP
export function checkRegisterRateLimit(ip: string) {
  return checkRateLimit(`register:${ip}`, 3, 10 * 60 * 1000);
}
