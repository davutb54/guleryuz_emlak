-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN "kvkkText" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "privacyText" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "termsText" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "title" TEXT;
