import path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { hash } from "@node-rs/argon2";

const dbUrl = path.resolve(process.cwd(), "prisma/dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const db = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@guleryuzgayrimenkul.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "GuleryuzAdmin2026!";
  const name = process.env.SEED_ADMIN_NAME ?? "Sistem Yöneticisi";

  const passwordHash = await hash(password, {
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
    outputLen: 32,
  });

  const user = await db.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      name,
      role: "SUPER_ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log(`✅ SUPER_ADMIN oluşturuldu/mevcut: ${user.email} (id: ${user.id})`);
  console.log(`   Rol: ${user.role}`);

  await db.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      contactEmail: "info@guleryuzgayrimenkul.com",
      contactPhone: "+90 222 000 00 00",
      address: "Eskişehir, Türkiye",
      workingHours: "Pazartesi–Cumartesi: 09:00–18:00",
      socialLinks: JSON.stringify({
        instagram: "",
        facebook: "",
        youtube: "",
        whatsapp: "",
      }),
      aboutTr: "Güleryüz Gayrimenkul, Eskişehir'de yıllardır güvenilir ve kaliteli emlak hizmeti sunmaktadır.",
      aboutEn: "Güleryüz Real Estate has been providing reliable and quality real estate services in Eskişehir for years.",
    },
  });

  console.log("✅ SiteSettings oluşturuldu/mevcut.");
  console.log("");
  console.log("─────────────────────────────────────────");
  console.log("  Giriş bilgileri:");
  console.log(`  E-posta : ${email}`);
  console.log(`  Şifre   : ${password}`);
  console.log("  ⚠️  Üretime geçmeden önce şifreyi değiştirin!");
  console.log("─────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed hatası:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
