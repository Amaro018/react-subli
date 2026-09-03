"use client"
import React, { useEffect, useState } from "react"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import getUser from "../../utils/getUser"
import ViewShop from "../../components/ViewShop"

export default function ShopPage({ params }: any) {
  const { id } = params
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser()
      setCurrentUser(user)
    }
    fetchUser()
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar currentUser={currentUser} />
      <main className="flex-grow w-full max-w-[1400px] mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8">
        <ViewShop shopId={Number(id)} />
      </main>
      <Footer />
    </div>
  )
}
