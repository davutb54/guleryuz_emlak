-- CreateTable
CREATE TABLE "ListingSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "titleTr" TEXT NOT NULL,
    "descriptionTr" TEXT,
    "price" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "city" TEXT NOT NULL DEFAULT 'Eskişehir',
    "district" TEXT NOT NULL,
    "neighborhood" TEXT,
    "address" TEXT,
    "area" REAL NOT NULL,
    "netArea" REAL,
    "rooms" TEXT,
    "bathrooms" INTEGER,
    "buildingAge" INTEGER,
    "floor" INTEGER,
    "totalFloors" INTEGER,
    "heating" TEXT,
    "furnished" BOOLEAN,
    "hasBalcony" BOOLEAN,
    "hasElevator" BOOLEAN,
    "hasParking" BOOLEAN,
    "hasSecurity" BOOLEAN,
    "hasPool" BOOLEAN,
    "inSite" BOOLEAN,
    "facade" TEXT,
    "creditEligible" BOOLEAN,
    "deedStatus" TEXT,
    "zoningStatus" TEXT,
    "islandNumber" TEXT,
    "parcelNumber" TEXT,
    "adminNote" TEXT,
    "reviewedAt" DATETIME,
    "reviewedById" TEXT,
    "listingId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "ListingSubmission_status_idx" ON "ListingSubmission"("status");

-- CreateIndex
CREATE INDEX "ListingSubmission_createdAt_idx" ON "ListingSubmission"("createdAt");
