-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProductVariant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "size" TEXT,
    "colorId" INTEGER,
    "quantity" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "replacementCost" REAL,
    "repairCost" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductVariant_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProductVariant" ("colorId", "createdAt", "id", "price", "productId", "quantity", "repairCost", "replacementCost", "size", "updatedAt") SELECT "colorId", "createdAt", "id", "price", "productId", "quantity", "repairCost", "replacementCost", "size", "updatedAt" FROM "ProductVariant";
DROP TABLE "ProductVariant";
ALTER TABLE "new_ProductVariant" RENAME TO "ProductVariant";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
