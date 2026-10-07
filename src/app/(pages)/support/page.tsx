import { invoke } from "../../blitz-server"
import getCurrentUser from "../../users/queries/getCurrentUser"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import HelpCenter from "../../components/HelpCenter"

interface SupportPageProps {
  searchParams?: {
    orderRef?: string
    itemId?: string
    itemName?: string
  }
}

export default async function SupportPage({ searchParams }: SupportPageProps) {
  const currentUser = await invoke(getCurrentUser, null)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar currentUser={currentUser} />
      <HelpCenter
        key={`${searchParams?.orderRef ?? ""}-${searchParams?.itemId ?? ""}`}
        orderReference={searchParams?.orderRef}
        itemId={searchParams?.itemId}
        itemName={searchParams?.itemName}
      />
      <Footer />
    </div>
  )
}
