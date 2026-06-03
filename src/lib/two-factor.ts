import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_SETUP = "guleryuz-2fa-setup";
const COOKIE_VERIFIED = "guleryuz-2fa-verified";
const VERIFIED_TTL = 8 * 60 * 60; // 8 hours

// Cookie Secure flag'i sadece HTTPS'te aktif — HTTP production'da false olmalı
const useSecureCookies = process.env.NEXT_PUBLIC_BASE_URL?.startsWith("https://") ?? false;

function hmac(data: string): string {
  return crypto
    .createHmac("sha256", process.env.AUTH_SECRET ?? "fallback-dev-secret")
    .update(data)
    .digest("hex");
}

export function generateTOTPSecret(email: string) {
  const secret = new OTPAuth.Secret({ size: 20 });
  const totp = new OTPAuth.TOTP({
    issuer: "Güleryüz Gayrimenkul",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret,
  });
  return { secretBase32: secret.base32, uri: totp.toString() };
}

export async function generateQRDataUrl(uri: string): Promise<string> {
  return QRCode.toDataURL(uri, { width: 240, margin: 2, color: { dark: "#0A1628", light: "#F5F1E8" } });
}

export function verifyTOTP(secretBase32: string, token: string): boolean {
  try {
    const secret = OTPAuth.Secret.fromBase32(secretBase32);
    const totp = new OTPAuth.TOTP({
      issuer: "Güleryüz Gayrimenkul",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret,
    });
    return totp.validate({ token: token.replace(/\s/g, ""), window: 1 }) !== null;
  } catch {
    return false;
  }
}

// --- Setup cookie: stores pending secret during enrollment ---

export async function setSetupCookie(userId: string, secretBase32: string) {
  const payload = `${userId}|${secretBase32}`;
  const sig = hmac(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_SETUP, `${payload}|${sig}`, {
    httpOnly: true,
    secure: useSecureCookies,
    sameSite: "lax",
    maxAge: 10 * 60,
    path: "/",
  });
}

export async function getSetupCookie(): Promise<{ userId: string; secretBase32: string } | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_SETUP)?.value;
  if (!raw) return null;
  const idx = raw.lastIndexOf("|");
  if (idx < 0) return null;
  const payload = raw.slice(0, idx);
  const sig = raw.slice(idx + 1);
  if (hmac(payload) !== sig) return null;
  const parts = payload.split("|");
  if (parts.length !== 2) return null;
  return { userId: parts[0], secretBase32: parts[1] };
}

export async function clearSetupCookie() {
  (await cookies()).delete(COOKIE_SETUP);
}

// --- Verified cookie: marks 2FA as passed for this session ---

export async function set2FAVerifiedCookie(userId: string) {
  const exp = Math.floor(Date.now() / 1000) + VERIFIED_TTL;
  const payload = `${userId}|${exp}`;
  const sig = hmac(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_VERIFIED, `${payload}|${sig}`, {
    httpOnly: true,
    secure: useSecureCookies,
    sameSite: "lax",
    maxAge: VERIFIED_TTL,
    path: "/",
  });
}

export async function is2FAVerified(userId: string): Promise<boolean> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_VERIFIED)?.value;
  if (!raw) return false;
  const idx = raw.lastIndexOf("|");
  if (idx < 0) return false;
  const payload = raw.slice(0, idx);
  const sig = raw.slice(idx + 1);
  if (hmac(payload) !== sig) return false;
  const parts = payload.split("|");
  if (parts.length !== 2) return false;
  const [cookieUserId, expStr] = parts;
  if (cookieUserId !== userId) return false;
  const exp = parseInt(expStr, 10);
  return !isNaN(exp) && exp > Math.floor(Date.now() / 1000);
}

export async function clear2FAVerifiedCookie() {
  (await cookies()).delete(COOKIE_VERIFIED);
}
