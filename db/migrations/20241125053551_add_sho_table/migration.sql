-- CreateTable
CREATE TABLE "Shop" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "shopName" TEXT NOT NULL,
    "tradeName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "bio" TEXT,
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

-- CreateIndex
CREATE UNIQUE INDEX "Shop_userId_key" ON "Shop"("userId");
