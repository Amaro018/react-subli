/*
  Warnings:

  - You are about to drop the column `region` on the `Shop` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `PersonalInfo` table. All the data in the column will be lost.
  - Added the required column `barangay` to the `Shop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province` to the `Shop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `barangay` to the `PersonalInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province` to the `PersonalInfo` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "ReportShop" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shopId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReportShop_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReportShop_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

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
INSERT INTO "new_Shop" ("city", "contact", "country", "createdAt", "description", "documentDTI", "documentPermit", "documentTax", "dtiNotes", "dtiStatus", "email", "id", "imageBg", "imageProfile", "linkFacebook", "permitNotes", "permitStatus", "shopName", "status", "street", "taxNotes", "taxStatus", "updatedAt", "userId", "zipCode") SELECT "city", "contact", "country", "createdAt", "description", "documentDTI", "documentPermit", "documentTax", "dtiNotes", "dtiStatus", "email", "id", "imageBg", "imageProfile", "linkFacebook", "permitNotes", "permitStatus", "shopName", "status", "street", "taxNotes", "taxStatus", "updatedAt", "userId", "zipCode" FROM "Shop";
DROP TABLE "Shop";
ALTER TABLE "new_Shop" RENAME TO "Shop";
CREATE UNIQUE INDEX "Shop_userId_key" ON "Shop"("userId");
CREATE TABLE "new_PersonalInfo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "birthDate" DATETIME NOT NULL,
    "phoneNumber" TEXT,
    "street" TEXT NOT NULL,
    "barangay" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "PersonalInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PersonalInfo" ("birthDate", "city", "country", "createdAt", "firstName", "id", "lastName", "middleName", "phoneNumber", "street", "updatedAt", "userId", "zipCode") SELECT "birthDate", "city", "country", "createdAt", "firstName", "id", "lastName", "middleName", "phoneNumber", "street", "updatedAt", "userId", "zipCode" FROM "PersonalInfo";
DROP TABLE "PersonalInfo";
ALTER TABLE "new_PersonalInfo" RENAME TO "PersonalInfo";
CREATE UNIQUE INDEX "PersonalInfo_userId_key" ON "PersonalInfo"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
