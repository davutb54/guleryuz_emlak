import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import sharp from "sharp";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { randomBytes } from "crypto";
import {
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
  getCloudinaryThumbnailUrl,
  deleteFromCloudinary,
  getCloudinaryPublicId,
} from "@/lib/cloudinary";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200 MB
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const ALLOWED_ROLES = ["AGENT", "ADMIN", "SUPER_ADMIN"];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  // Rate limit: 200 yükleme / saat per kullanıcı
  const rl = checkRateLimit(`upload:${session.user.id}`, 200, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Çok fazla yükleme isteği. Lütfen bir saat bekleyin." },
      { status: 429 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Geçersiz form verisi" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const listingId = formData.get("listingId") as string | null;
  const isPrimary = formData.get("isPrimary") === "true";

  if (!file) {
    return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
  }

  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    return NextResponse.json({ error: "Desteklenmeyen dosya türü" }, { status: 400 });
  }

  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    return NextResponse.json(
      {
        error: isVideo
          ? "Video boyutu 200 MB'ı geçemez"
          : "Dosya boyutu 50 MB'ı geçemez",
      },
      { status: 400 }
    );
  }

  const useCloud = isCloudinaryConfigured();
  const buffer = Buffer.from(await file.arrayBuffer());

  // ─── Video ───────────────────────────────────────────────────────────────────
  if (isVideo) {
    let videoUrl: string;

    if (useCloud) {
      const result = await uploadBufferToCloudinary(buffer, { resourceType: "video" });
      videoUrl = result.secure_url;
    } else {
      const uniqueName = randomBytes(12).toString("hex");
      const ext = file.type === "video/webm" ? "webm" : "mp4";
      const fileName = `${uniqueName}.${ext}`;
      await mkdir(UPLOAD_DIR, { recursive: true });
      await writeFile(path.join(UPLOAD_DIR, fileName), buffer);
      videoUrl = `/uploads/${fileName}`;
    }

    return NextResponse.json({ url: videoUrl, thumbnail: null, type: "video" });
  }

  // ─── Görüntü ─────────────────────────────────────────────────────────────────
  let metadata: sharp.Metadata;
  try {
    metadata = await sharp(buffer).metadata();
    if (!metadata.width || !metadata.height) {
      return NextResponse.json({ error: "Geçersiz görüntü dosyası" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Görüntü işlenemedi" }, { status: 400 });
  }

  // Sharp: döndür, boyutlandır, WebP'e çevir
  const processedBuffer = await sharp(buffer)
    .rotate()
    .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  let imageUrl: string;
  let thumbUrl: string;

  if (useCloud) {
    // Cloudinary: işlenmiş buffer'ı yükle, thumbnail URL'i transform ile üret
    const result = await uploadBufferToCloudinary(processedBuffer, {
      folder: "guleryuz/uploads",
    });
    imageUrl = result.secure_url;
    thumbUrl = getCloudinaryThumbnailUrl(imageUrl);
  } else {
    // Yerel depolama (geliştirme ortamı — Cloudinary yokken)
    const uniqueName = randomBytes(12).toString("hex");
    const fileName = `${uniqueName}.webp`;
    const thumbName = `${uniqueName}_thumb.webp`;
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, fileName), processedBuffer);
    await sharp(buffer)
      .rotate()
      .resize(480, 360, { fit: "cover" })
      .webp({ quality: 70 })
      .toFile(path.join(UPLOAD_DIR, thumbName));
    imageUrl = `/uploads/${fileName}`;
    thumbUrl = `/uploads/${thumbName}`;
  }

  // Veritabanına kaydet (listingId varsa)
  if (listingId) {
    const listing = await db.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "İlan bulunamadı" }, { status: 404 });
    }

    if (isPrimary) {
      await db.listingImage.updateMany({
        where: { listingId },
        data: { isPrimary: false },
      });
    }

    const count = await db.listingImage.count({ where: { listingId } });

    await db.listingImage.create({
      data: {
        listingId,
        url: imageUrl,
        order: count,
        isPrimary: isPrimary || count === 0,
      },
    });
  }

  return NextResponse.json({
    url: imageUrl,
    thumbnail: thumbUrl,
    width: metadata.width,
    height: metadata.height,
    type: "image",
  });
}

// ─── Silme ───────────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const { imageId } = await req.json();
  if (!imageId) {
    return NextResponse.json({ error: "imageId gerekli" }, { status: 400 });
  }

  const image = await db.listingImage.findUnique({ where: { id: imageId } });
  if (!image) {
    return NextResponse.json({ error: "Görsel bulunamadı" }, { status: 404 });
  }

  if (image.url.startsWith("https://res.cloudinary.com/")) {
    // Cloudinary'den sil
    await deleteFromCloudinary(image.url, "image").catch(() => {});
  } else if (image.url.startsWith("/uploads/")) {
    // Yerel dosyadan sil
    const { unlink } = await import("fs/promises");
    const filePath = path.join(process.cwd(), "public", image.url);
    const thumbPath = filePath.replace(".webp", "_thumb.webp");
    await Promise.allSettled([unlink(filePath), unlink(thumbPath)]);
  }

  await db.listingImage.delete({ where: { id: imageId } });

  return NextResponse.json({ success: true });
}
