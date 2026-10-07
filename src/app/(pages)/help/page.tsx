import { invoke } from "../../blitz-server"
import getCurrentUser from "../../users/queries/getCurrentUser"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import HelpCenter from "../../components/HelpCenter"

export default async function HelpPage() {
  const currentUser = await invoke(getCurrentUser, null)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar currentUser={currentUser} />
      <HelpCenter />
      <Footer />
    </div>
  )
}
