import { Metadata } from "next"
import ChangePassword from "../components/ChangePassword"

export const metadata: Metadata = {
  title: "Change Password",
}

export default async function Page() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-xl font-medium text-gray-800">Change Password</h1>
        <span className="text-sm text-gray-500">Update your account password</span>
      </div>
      <ChangePassword />
    </div>
  )
}
