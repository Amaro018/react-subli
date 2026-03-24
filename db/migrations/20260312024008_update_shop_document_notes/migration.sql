-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Shop" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "shopName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "barangay" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "description" TEXT,
    "imageProfile" TEXT,
    "imageBg" TEXT,
    "documentDTI" TEXT,
    "dtiStatus" TEXT NOT NULL DEFAULT 'pending',
    "dtiNotes" TEXT,
    "documentPermit" TEXT,
    "permitStatus" TEXT NOT NULL DEFAULT 'pending',
    "permitNotes" TEXT,
    "documentTax" TEXT,
    "taxStatus" TEXT NOT NULL DEFAULT 'pending',
    "taxNotes" TEXT,
    "linkFacebook" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "rejectionReason" TEXT,
    CONSTRAINT "Shop_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Shop" ("barangay", "city", "contact", "country", "createdAt", "description", "documentDTI", "documentPermit", "documentTax", "dtiNotes", "dtiStatus", "email", "id", "imageBg", "imageProfile", "linkFacebook", "permitNotes", "permitStatus", "province", "rejectionReason", "shopName", "status", "street", "taxNotes", "taxStatus", "updatedAt", "userId", "zipCode") SELECT "barangay", "city", "contact", "country", "createdAt", "description", "documentDTI", "documentPermit", "documentTax", "dtiNotes", "dtiStatus", "email", "id", "imageBg", "imageProfile", "linkFacebook", "permitNotes", "permitStatus", "province", "rejectionReason", "shopName", "status", "street", "taxNotes", "taxStatus", "updatedAt", "userId", "zipCode" FROM "Shop";
DROP TABLE "Shop";
ALTER TABLE "new_Shop" RENAME TO "Shop";
CREATE UNIQUE INDEX "Shop_userId_key" ON "Shop"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
