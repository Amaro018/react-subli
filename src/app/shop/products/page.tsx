import { invoke } from "./../../blitz-server"
import getCurrentUser from "../../users/queries/getCurrentUser"
import ProductList from "../components/ProductList"

export default async function Page() {
  const currentUser = await invoke(getCurrentUser, null)
  return <ProductList currentUser={currentUser} />
}
