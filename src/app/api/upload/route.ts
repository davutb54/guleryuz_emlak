import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import sharp from "sharp";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { randomBytes } from "crypto";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const ALLOWED_ROLES = ["AGENT", "ADMIN", "SUPER_ADMIN"];

export async function POST(req: NextRequest) {
  // Auth kontrolü
  const session = await auth();
  if (!session?.user || !ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  // Form verisi oku
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

  // MIME type kontrolü
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Sadece JPEG, PNG, WebP ve AVIF dosyaları kabul edilir" },
      { status: 400 }
    );
  }

  // Boyut kontrolü
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Dosya boyutu 10 MB'ı geçemez" },
      { status: 400 }
    );
  }

  // Buffer oku
  const buffer = Buffer.from(await file.arrayBuffer());

  // Sharp ile metadata kontrol — gerçek görüntü mü?
  let metadata: sharp.Metadata;
  try {
    metadata = await sharp(buffer).metadata();
    if (!metadata.width || !metadata.height) {
      return NextResponse.json({ error: "Geçersiz görüntü dosyası" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Görüntü işlenemedi" }, { status: 400 });
  }

  // Benzersiz dosya adı
  const uniqueName = randomBytes(12).toString("hex");
  const fileName = `${uniqueName}.webp`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  const publicUrl = `/uploads/${fileName}`;

  // Klasörü oluştur (yoksa)
  await mkdir(UPLOAD_DIR, { recursive: true });

  // Sharp: WebP'e dönüştür, boyutlandır, EXIF temizle
  await sharp(buffer)
    .rotate()                           // EXIF orientation'a göre döndür
    .resize(1920, 1080, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toFile(filePath);

  // Thumbnail oluştur
  const thumbName = `${uniqueName}_thumb.webp`;
  const thumbPath = path.join(UPLOAD_DIR, thumbName);

  await sharp(buffer)
    .rotate()
    .resize(480, 360, { fit: "cover" })
    .webp({ quality: 70 })
    .toFile(thumbPath);

  // Veritabanına kaydet (listingId varsa)
  if (listingId) {
    const listing = await db.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "İlan bulunamadı" }, { status: 404 });
    }

    // Eğer isPrimary ise mevcut primary'leri sıfırla
    if (isPrimary) {
      await db.listingImage.updateMany({
        where: { listingId },
        data: { isPrimary: false },
      });
    }

    // Sıra numarasını belirle
    const count = await db.listingImage.count({ where: { listingId } });

    await db.listingImage.create({
      data: {
        listingId,
        url: publicUrl,
        order: count,
        isPrimary: isPrimary || count === 0,
      },
    });
  }

  return NextResponse.json({
    url: publicUrl,
    thumbnail: `/uploads/${thumbName}`,
    width: metadata.width,
    height: metadata.height,
  });
}

// Görsel silme
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

  // Dosyayı sil
  const { unlink } = await import("fs/promises");
  const filePath = path.join(process.cwd(), "public", image.url);
  const thumbPath = filePath.replace(".webp", "_thumb.webp");

  await Promise.allSettled([unlink(filePath), unlink(thumbPath)]);

  await db.listingImage.delete({ where: { id: imageId } });

  return NextResponse.json({ success: true });
}
