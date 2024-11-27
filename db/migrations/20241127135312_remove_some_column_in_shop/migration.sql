/*
  Warnings:

  - You are about to drop the column `address` on the `Shop` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `Shop` table. All the data in the column will be lost.
  - You are about to drop the column `tradeName` on the `Shop` table. All the data in the column will be lost.
  - Added the required column `city` to the `Shop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Shop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `region` to the `Shop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street` to the `Shop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipCode` to the `Shop` table without a default value. This is not possible if the table is not empty.

*/
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
    "documentPermit" TEXT,
    "permitStatus" TEXT NOT NULL DEFAULT 'pending',
    "documentTax" TEXT,
    "taxStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Shop_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Shop" ("contact", "createdAt", "documentDTI", "documentPermit", "documentTax", "dtiStatus", "email", "id", "imageBg", "imageProfile", "permitStatus", "shopName", "status", "taxStatus", "updatedAt", "userId") SELECT "contact", "createdAt", "documentDTI", "documentPermit", "documentTax", "dtiStatus", "email", "id", "imageBg", "imageProfile", "permitStatus", "shopName", "status", "taxStatus", "updatedAt", "userId" FROM "Shop";
DROP TABLE "Shop";
ALTER TABLE "new_Shop" RENAME TO "Shop";
CREATE UNIQUE INDEX "Shop_userId_key" ON "Shop"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
