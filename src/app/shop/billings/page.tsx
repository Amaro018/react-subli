import { invoke } from "../../blitz-server"
import getCurrentUser from "../../users/queries/getCurrentUser"
import ErrorMessage from "../../renter/components/ErrorMessage"
import InvoicesList from "../components/InvoicesList"

export default async function ShopBillingsPage() {
  const currentUser = await invoke(getCurrentUser, null)
  if (!currentUser?.shop) {
    return (
      <ErrorMessage
        title="Shop Required"
        message="You need a registered shop to access billing."
        currentUser={currentUser}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1400px] mx-auto w-full">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Shop Billing & Invoices</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track invoices, payments, and balances for your shop's rentals.
        </p>
      </div>
      <InvoicesList />
    </div>
  )
}
