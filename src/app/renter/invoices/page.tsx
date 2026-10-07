import InvoicesList from "../components/InvoicesList"

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-xl font-medium text-gray-800">Billing &amp; Invoices</h1>
        <span className="text-sm text-gray-500">View your invoices and payment status</span>
      </div>

      <div className="mt-2">
        <InvoicesList />
      </div>
    </div>
  )
}
