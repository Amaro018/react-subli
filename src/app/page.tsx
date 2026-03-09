import { invoke } from "./blitz-server"

import getCurrentUser from "./users/queries/getCurrentUser"
import Navbar from "./components/Navbar"
import { redirect } from "next/navigation"
import CategorySection from "./components/pages/CategorySection"

import Footer from "./components/Footer"

export default async function Home() {
  const currentUser = await invoke(getCurrentUser, null)

  if (currentUser && currentUser.role === "ADMIN") {
    redirect("/admin")
  }

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Navbar currentUser={currentUser} />
        <CategorySection />
        <Footer />
      </div>
    </>
  )
}
