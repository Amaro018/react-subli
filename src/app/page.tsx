import Link from "next/link"
import { invoke } from "./blitz-server"
import { LogoutButton } from "./(auth)/components/LogoutButton"
import styles from "./styles/Home.module.css"
import getCurrentUser from "./users/queries/getCurrentUser"
import Navbar from "./components/Navbar"
import { getUsers } from "./queries/getUsers"
import { useQuery } from "@blitzjs/rpc"
import Footer from "./components/Footer"

export default async function Home() {
  const currentUser = await invoke(getCurrentUser, null)
  return (
    <>
      <Navbar currentUser={currentUser} />
      <main>hi</main>
      <div className="relative">
        <div className="absolute bottom-0">
          <Footer />
        </div>
      </div>
    </>
  )
}
