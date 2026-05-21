"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { commentCreateSchema } from "@/lib/validations/comment";
import { revalidatePath } from "next/cache";
import { sendCommentApprovedEmail } from "@/lib/email";
import { auditLog } from "@/lib/audit";

export async function createComment(raw: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Yorum yazmak için giriş yapmanız gerekiyor." };
  }

  const parsed = commentCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz yorum." };
  }

  const { listingId, content, rating } = parsed.data;

  // İlan aktif mi kontrol et
  const listing = await db.listing.findUnique({
    where: { id: listingId, status: "ACTIVE" },
    select: { id: true },
  });
  if (!listing) {
    return { error: "İlan bulunamadı." };
  }

  await db.comment.create({
    data: {
      userId: session.user.id,
      listingId,
      content,
      rating: rating ?? null,
      approved: true,
    },
  });

  revalidatePath("/");
  return { success: true };
}

export async function approveComment(commentId: string): Promise<void> {
  const session = await auth();
  if (
    !session?.user?.role ||
    !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)
  ) {
    return;
  }

  const comment = await db.comment.update({
    where: { id: commentId },
    data: { approved: true },
    include: {
      user: { select: { name: true, email: true } },
      listing: { select: { titleTr: true, slug: true } },
    },
  });

  sendCommentApprovedEmail({
    to: comment.user.email,
    userName: comment.user.name,
    listingTitle: comment.listing.titleTr,
    listingSlug: comment.listing.slug,
  });

  revalidatePath("/");
}

export async function toggleApproveComment(commentId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.role || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) return;

  const comment = await db.comment.findUnique({ where: { id: commentId }, select: { approved: true } });
  if (!comment) return;

  await db.comment.update({ where: { id: commentId }, data: { approved: !comment.approved } });
  await auditLog(session.user.id, comment.approved ? "comment.hide" : "comment.approve", "Comment", commentId);
  revalidatePath("/");
}

export async function deleteComment(commentId: string): Promise<void> {
  const session = await auth();
  if (
    !session?.user?.role ||
    !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)
  ) {
    return;
  }

  await db.comment.delete({ where: { id: commentId } });
  await auditLog(session.user.id, "comment.delete", "Comment", commentId);
  revalidatePath("/");
}
