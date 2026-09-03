-- CreateTable
CREATE TABLE "ShopAuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shopId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "adminId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ShopAuditLog_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ShopAuditLog_shopId_idx" ON "ShopAuditLog"("shopId");

-- CreateIndex
CREATE INDEX "ShopAuditLog_createdAt_idx" ON "ShopAuditLog"("createdAt");
