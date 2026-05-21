-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ListingImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'image',
    "order" INTEGER NOT NULL DEFAULT 0,
    "alt" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ListingImage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ListingImage" ("alt", "id", "isPrimary", "listingId", "order", "url") SELECT "alt", "id", "isPrimary", "listingId", "order", "url" FROM "ListingImage";
DROP TABLE "ListingImage";
ALTER TABLE "new_ListingImage" RENAME TO "ListingImage";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
