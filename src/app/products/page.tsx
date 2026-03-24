import React from "react"
import { invoke } from "../blitz-server"
import getCurrentUser from "../users/queries/getCurrentUser"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import ProductsList from "../components/ProductsList"

export default async function ProductsPage() {
  const currentUser = await invoke(getCurrentUser, null)

  return (
    <div className="flex h-full flex-col overflow-y-auto scrollbar-seamless">
      <Navbar currentUser={currentUser} />

      <main className="flex-grow bg-gray-50">
        <ProductsList />
      </main>

      <Footer />
    </div>
  )
}
