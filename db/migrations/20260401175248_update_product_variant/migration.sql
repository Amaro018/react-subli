-- AlterTable
ALTER TABLE "DamagePolicies" ADD COLUMN "description" TEXT;

-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN "isThumbnail" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Rent" ADD COLUMN "securityDeposit" REAL;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "iconKey" TEXT NOT NULL DEFAULT 'default',
    "annualDepreciationRate" REAL NOT NULL DEFAULT 0.10,
    "minimumValuePercent" REAL NOT NULL DEFAULT 0.05,
    "defaultMinorPercent" REAL NOT NULL DEFAULT 0.15,
    "defaultModeratePercent" REAL NOT NULL DEFAULT 0.30,
    "defaultMajorPercent" REAL NOT NULL DEFAULT 0.60,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Category" ("annualDepreciationRate", "createdAt", "defaultMajorPercent", "defaultMinorPercent", "iconKey", "id", "minimumValuePercent", "name", "slug", "updatedAt") SELECT "annualDepreciationRate", "createdAt", "defaultMajorPercent", "defaultMinorPercent", "iconKey", "id", "minimumValuePercent", "name", "slug", "updatedAt" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
