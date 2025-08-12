-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN "manualRepairCost" REAL;
ALTER TABLE "ProductVariant" ADD COLUMN "replacementCost" REAL;

-- CreateTable
CREATE TABLE "DamagePolicies" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productVariantId" INTEGER NOT NULL,
    "damageSeverity" TEXT NOT NULL,
    "damageSeverityPercent" REAL NOT NULL,
    CONSTRAINT "DamagePolicies_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
