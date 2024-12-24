import { LoginForm } from "../components/LoginForm"
import getCurrentUser from "../../users/queries/getCurrentUser"
import { invoke, useQuery } from "@blitzjs/rpc"
import Navbar from "../../components/Navbar"

export default async function LoginPage() {
  return (
    <>
      <main>
        <div>
          <Navbar currentUser={null} />
        </div>
        <div className="flex justify-center items-center h-screen">
          <LoginForm />
        </div>
      </main>
    </>
  )
}
