-- Split newly recalculated invoices by shop. Existing invoice rows are retained
-- until their rental is next recalculated, then replaced by shop-scoped rows.
ALTER TABLE "Invoice" ADD COLUMN "shopId" INTEGER;

CREATE INDEX "Invoice_shopId_idx" ON "Invoice"("shopId");
CREATE UNIQUE INDEX "Invoice_rentId_shopId_key" ON "Invoice"("rentId", "shopId");
