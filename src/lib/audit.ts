import { db } from "./db";
import { headers } from "next/headers";

export async function auditLog(
  userId: string,
  action: string,
  entity: string,
  entityId?: string | null,
  metadata?: Record<string, unknown> | null
) {
  try {
    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    const ipAddress =
      forwarded?.split(",")[0].trim() ??
      headersList.get("x-real-ip") ??
      undefined;
    const userAgent = headersList.get("user-agent") ?? undefined;

    await db.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId: entityId ?? undefined,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
        ipAddress,
        userAgent,
      },
    });
  } catch (err) {
    // Audit log hatası ana akışı kesmemeli
    console.error("[audit] Log yazılamadı:", { userId, action, entity, err });
  }
}
