-- `securityDeposit` has historically held the required upfront rental payment.
-- It must not be charged a second time in invoice totals.
UPDATE "Invoice"
SET
  "totalAmount" = "subtotal" + "extraCharges",
  "balanceDue" = CASE
    WHEN ("subtotal" + "extraCharges" - "amountPaid") > 0
      THEN ("subtotal" + "extraCharges" - "amountPaid")
    ELSE 0
  END,
  "status" = CASE
    WHEN ("subtotal" + "extraCharges" - "amountPaid") <= 0 THEN 'PAID'
    WHEN "amountPaid" > 0 THEN 'PARTIALLY_PAID'
    ELSE 'UNPAID'
  END;
