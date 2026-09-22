import { invoke } from "../../blitz-server"
import getCurrentUser from "../../users/queries/getCurrentUser"
import InvoicesList from "../components/InvoicesList"

export default async function BillingPage() {
  await invoke(getCurrentUser, null)

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1400px] mx-auto w-full">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">
            View your rental invoices, payment status, and itemized billing statements.
          </p>
        </div>
      </div>

      <InvoicesList />
    </div>
  )
}
