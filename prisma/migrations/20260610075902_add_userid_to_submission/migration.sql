-- AlterTable
ALTER TABLE "ListingSubmission" ADD COLUMN "userId" TEXT;

-- CreateIndex
CREATE INDEX "ListingSubmission_userId_idx" ON "ListingSubmission"("userId");
