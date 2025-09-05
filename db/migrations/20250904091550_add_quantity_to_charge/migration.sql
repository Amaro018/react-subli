-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Charge" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rentItemId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Charge_rentItemId_fkey" FOREIGN KEY ("rentItemId") REFERENCES "RentItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Charge" ("amount", "createdAt", "id", "rentItemId", "type", "updatedAt") SELECT "amount", "createdAt", "id", "rentItemId", "type", "updatedAt" FROM "Charge";
DROP TABLE "Charge";
ALTER TABLE "new_Charge" RENAME TO "Charge";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
