import { invoke } from "@blitzjs/rpc"
import getCurrentUser from "../utils/getCurrentUser"
import Navbar from "./Navbar"

export default async function GetTheNavBar() {
  const currentUser = await invoke(getCurrentUser, null)
  return (
    <div>
      <Navbar currentUser={currentUser} />
    </div>
  )
}
