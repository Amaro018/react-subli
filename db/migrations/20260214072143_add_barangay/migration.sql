-- CreateTable
CREATE TABLE "Barangay" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Legazpi City',
    "zipCode" TEXT NOT NULL DEFAULT '4500'
);

-- CreateIndex
CREATE UNIQUE INDEX "Barangay_name_key" ON "Barangay"("name");
