import { Sidebar } from "./../components/sidebar"
import { invoke } from "./../../blitz-server"
import getCurrentUser from "../../users/queries/getCurrentUser"
import CreateProductForm from "./../components/CreateProductForm"
import ProductList from "../components/ProductList"
import GetRentItemsByShopInput from "../../queries/getRentItemsByShop"
import { useQuery } from "@blitzjs/rpc"
import OrderList from "../components/OrderList"

export default async function Page() {
  const currentUser = await invoke(getCurrentUser, null)
  return (
    <div className="flex flex-row w-full gap-2 ">
      <div className="relative">
        <Sidebar currentUser={currentUser} />
      </div>
      <div className="ml-36 p-16 w-full">
        <div>
          <OrderList />
        </div>
      </div>
    </div>
  )
}
