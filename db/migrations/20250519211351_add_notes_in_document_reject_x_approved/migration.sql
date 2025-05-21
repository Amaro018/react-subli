-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Shop" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "shopName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "description" TEXT,
    "imageProfile" TEXT,
    "imageBg" TEXT,
    "documentDTI" TEXT,
    "dtiStatus" TEXT NOT NULL DEFAULT 'pending',
    "dtiNotes" TEXT NOT NULL DEFAULT 'pending',
    "documentPermit" TEXT,
    "permitStatus" TEXT NOT NULL DEFAULT 'pending',
    "permitNotes" TEXT NOT NULL DEFAULT 'pending',
    "documentTax" TEXT,
    "taxStatus" TEXT NOT NULL DEFAULT 'pending',
    "taxNotes" TEXT NOT NULL DEFAULT 'pending',
    "linkFacebook" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Shop_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Shop" ("city", "contact", "country", "createdAt", "description", "documentDTI", "documentPermit", "documentTax", "dtiStatus", "email", "id", "imageBg", "imageProfile", "linkFacebook", "permitStatus", "region", "shopName", "status", "street", "taxStatus", "updatedAt", "userId", "zipCode") SELECT "city", "contact", "country", "createdAt", "description", "documentDTI", "documentPermit", "documentTax", "dtiStatus", "email", "id", "imageBg", "imageProfile", "linkFacebook", "permitStatus", "region", "shopName", "status", "street", "taxStatus", "updatedAt", "userId", "zipCode" FROM "Shop";
DROP TABLE "Shop";
ALTER TABLE "new_Shop" RENAME TO "Shop";
CREATE UNIQUE INDEX "Shop_userId_key" ON "Shop"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
