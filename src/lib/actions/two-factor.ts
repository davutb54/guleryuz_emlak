"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { auditLog } from "@/lib/audit";
import {
  generateTOTPSecret,
  generateQRDataUrl,
  verifyTOTP,
  setSetupCookie,
  getSetupCookie,
  clearSetupCookie,
  set2FAVerifiedCookie,
  clear2FAVerifiedCookie,
} from "@/lib/two-factor";

type ActionResult = { success: true } | { success: false; error: string };

export async function initiate2FASetup(): Promise<
  { success: true; qrDataUrl: string; secretBase32: string } | { success: false; error: string }
> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Oturum bulunamadı" };

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });
  if (!user) return { success: false, error: "Kullanıcı bulunamadı" };

  const { secretBase32, uri } = generateTOTPSecret(user.email ?? session.user.id);
  const qrDataUrl = await generateQRDataUrl(uri);
  await setSetupCookie(session.user.id, secretBase32);

  return { success: true, qrDataUrl, secretBase32 };
}

export async function confirm2FASetup(code: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Oturum bulunamadı" };

  const pending = await getSetupCookie();
  if (!pending) return { success: false, error: "Kurulum süresi dolmuş, tekrar başlatın" };
  if (pending.userId !== session.user.id) return { success: false, error: "Geçersiz kurulum" };

  if (!verifyTOTP(pending.secretBase32, code)) {
    return { success: false, error: "Hatalı kod — uygulamanızı kontrol edin" };
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { twoFactorEnabled: true, twoFactorSecret: pending.secretBase32 },
  });
  await clearSetupCookie();
  await set2FAVerifiedCookie(session.user.id);
  await auditLog(session.user.id, "user.2fa_enable", "User", session.user.id);

  return { success: true };
}

export async function disable2FA(code: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Oturum bulunamadı" };

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorEnabled: true, twoFactorSecret: true },
  });
  if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
    return { success: false, error: "2FA zaten devre dışı" };
  }

  if (!verifyTOTP(user.twoFactorSecret, code)) {
    return { success: false, error: "Hatalı kod" };
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { twoFactorEnabled: false, twoFactorSecret: null },
  });
  await clear2FAVerifiedCookie();
  await auditLog(session.user.id, "user.2fa_disable", "User", session.user.id);

  return { success: true };
}

export async function verify2FALogin(code: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Oturum bulunamadı" };

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorEnabled: true, twoFactorSecret: true },
  });
  if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
    return { success: false, error: "Bu hesapta 2FA etkin değil" };
  }

  if (!verifyTOTP(user.twoFactorSecret, code)) {
    return { success: false, error: "Hatalı kod — lütfen tekrar deneyin" };
  }

  await set2FAVerifiedCookie(session.user.id);
  return { success: true };
}
