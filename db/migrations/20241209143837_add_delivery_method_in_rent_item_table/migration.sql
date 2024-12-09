/*
  Warnings:

  - Added the required column `deliveryMethod` to the `RentItem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RentItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rentId" INTEGER NOT NULL,
    "productVariantId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "deliveryMethod" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RentItem_rentId_fkey" FOREIGN KEY ("rentId") REFERENCES "Rent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RentItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RentItem" ("createdAt", "endDate", "id", "price", "productVariantId", "quantity", "rentId", "startDate", "status", "updatedAt") SELECT "createdAt", "endDate", "id", "price", "productVariantId", "quantity", "rentId", "startDate", "status", "updatedAt" FROM "RentItem";
DROP TABLE "RentItem";
ALTER TABLE "new_RentItem" RENAME TO "RentItem";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
