/*
  Warnings:

  - You are about to drop the column `manualRepairCost` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `replacementCost` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `isRepaired` on the `RentItem` table. All the data in the column will be lost.
  - You are about to drop the column `isReviewed` on the `RentItem` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Charge` table. All the data in the column will be lost.
  - You are about to drop the column `repairType` on the `Charge` table. All the data in the column will be lost.
  - You are about to drop the column `subType` on the `Charge` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `Payment` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProductVariant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "originalMSRP" REAL NOT NULL DEFAULT 0,
    "originalPurchaseDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "condition" TEXT NOT NULL DEFAULT 'New',
    "quantity" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProductVariant" ("createdAt", "id", "price", "productId", "quantity", "updatedAt") SELECT "createdAt", "id", "price", "productId", "quantity", "updatedAt" FROM "ProductVariant";
DROP TABLE "ProductVariant";
ALTER TABLE "new_ProductVariant" RENAME TO "ProductVariant";
CREATE TABLE "new_RentItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rentId" INTEGER NOT NULL,
    "productVariantId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "deliveryMethod" TEXT NOT NULL,
    "note" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "returnedDamagedQty" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RentItem_rentId_fkey" FOREIGN KEY ("rentId") REFERENCES "Rent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RentItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RentItem" ("createdAt", "deliveryMethod", "endDate", "id", "note", "price", "productVariantId", "quantity", "rentId", "returnedDamagedQty", "startDate", "status", "updatedAt") SELECT "createdAt", "deliveryMethod", "endDate", "id", "note", "price", "productVariantId", "quantity", "rentId", "returnedDamagedQty", "startDate", "status", "updatedAt" FROM "RentItem";
DROP TABLE "RentItem";
ALTER TABLE "new_RentItem" RENAME TO "RentItem";
CREATE TABLE "new_Charge" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rentItemId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT,
    "depreciatedValueAtDamage" REAL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Charge_rentItemId_fkey" FOREIGN KEY ("rentItemId") REFERENCES "RentItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Charge" ("amount", "createdAt", "id", "rentItemId", "type", "updatedAt") SELECT "amount", "createdAt", "id", "rentItemId", "type", "updatedAt" FROM "Charge";
DROP TABLE "Charge";
ALTER TABLE "new_Charge" RENAME TO "Charge";
CREATE TABLE "new_Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "iconKey" TEXT NOT NULL DEFAULT 'default',
    "annualDepreciationRate" REAL NOT NULL DEFAULT 0.20,
    "minimumValuePercent" REAL NOT NULL DEFAULT 0.10,
    "defaultMinorPercent" REAL NOT NULL DEFAULT 0.10,
    "defaultMajorPercent" REAL NOT NULL DEFAULT 0.40,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Category" ("createdAt", "iconKey", "id", "name", "slug", "updatedAt") SELECT "createdAt", "iconKey", "id", "name", "slug", "updatedAt" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE TABLE "new_Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rentItemId" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "penaltyFee" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_rentItemId_fkey" FOREIGN KEY ("rentItemId") REFERENCES "RentItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "createdAt", "id", "penaltyFee", "rentItemId", "status") SELECT "amount", "createdAt", "id", "penaltyFee", "rentItemId", "status" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
