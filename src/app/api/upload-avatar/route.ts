import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import sharp from "sharp";
import path from "path";
import { mkdir } from "fs/promises";
import { randomBytes } from "crypto";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Giriş yapmanız gerekiyor" }, { status: 401 });
  }

  // 5 yükleme / saat per kullanıcı
  const rl = checkRateLimit(`avatar:${session.user.id}`, 5, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Çok fazla yükleme isteği. Lütfen bekleyin." }, { status: 429 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Geçersiz form verisi" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Sadece JPEG, PNG veya WebP kabul edilir" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Dosya boyutu 5 MB'ı geçemez" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const meta = await sharp(buffer).metadata();
    if (!meta.width || !meta.height) {
      return NextResponse.json({ error: "Geçersiz görüntü dosyası" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Görüntü işlenemedi" }, { status: 400 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const uniqueName = randomBytes(12).toString("hex");
  const fileName = `avatar_${uniqueName}.webp`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  // Kare crop + 400×400 WebP
  await sharp(buffer)
    .rotate()
    .resize(400, 400, { fit: "cover", position: "center" })
    .webp({ quality: 85 })
    .toFile(filePath);

  return NextResponse.json({ url: `/uploads/${fileName}` });
}
