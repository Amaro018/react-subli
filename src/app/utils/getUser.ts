import { invoke } from "@blitzjs/rpc"
import getCurrentUser from "@/src/app/users/queries/getCurrentUser"
export default async function getUser() {
  const user = await invoke(getCurrentUser, null)
  return user
}
