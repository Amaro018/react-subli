import { invoke } from "../../blitz-server"
import getCurrentUser from "../../users/queries/getCurrentUser"
import OrderList from "../components/OrderList"
import ErrorMessage from "../../renter/components/ErrorMessage"

export default async function Page() {
  const currentUser = await invoke(getCurrentUser, null)

  if (!currentUser) {
    return <ErrorMessage message="Access denied" title="Login Required" currentUser={null} />
  }

  if (!currentUser.shop) {
    return (
      <ErrorMessage
        message="You need a registered shop to access this page."
        title="Shop Required"
        currentUser={currentUser}
      />
    )
  }

  return <OrderList />
}
