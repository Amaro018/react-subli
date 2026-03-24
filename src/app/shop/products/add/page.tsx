import { invoke } from "src/app/blitz-server"
import getCurrentUser from "src/app/users/queries/getCurrentUser"
import CreateProductForm from "../../components/CreateProductForm"

export default async function Page() {
  const currentUser = await invoke(getCurrentUser, null)
  return (
    <div className="w-full">
      <CreateProductForm currentUser={currentUser} />
    </div>
  )
}
