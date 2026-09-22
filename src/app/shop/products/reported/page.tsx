import { invoke } from "../../../blitz-server"
import getCurrentUser from "../../../users/queries/getCurrentUser"
import ErrorMessage from "../../../renter/components/ErrorMessage"
import ReportedProductList from "../../components/ReportedProductList"

export default async function ReportedProductsPage() {
  const currentUser = await invoke(getCurrentUser, null)
  if (!currentUser?.shop) {
    return (
      <ErrorMessage
        title="Shop Required"
        message="You need a registered shop to view product reports."
        currentUser={currentUser}
      />
    )
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto w-full">
      <ReportedProductList />
    </div>
  )
}
