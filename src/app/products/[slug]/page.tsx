"use client"
import React, { useEffect, useState } from "react"
import getUser from "@/src/app/utils/getUser"
import Navbar from "@/src/app/components/Navbar"
import Footer from "../../components/Footer"
import ViewProduct from "../../components/ViewProduct"

const ProductPage = ({ params }: any) => {
  const [currentUser, setCurrentUser] = useState<any>(null)

  const getCurrentUser = async () => {
    const user = await getUser()
    setCurrentUser(user)
  }
  useEffect(() => {
    getCurrentUser()
  }, [])

  const { slug } = params
  const id = slug

  return (
    <div className="flex flex-col h-screen bg-white overflow-y-auto scrollbar-seamless">
      <Navbar currentUser={currentUser} />
      <main className="flex-grow">
        <ViewProduct productId={id} currentUser={currentUser} />
      </main>
      <Footer />
    </div>
  )
}
export default ProductPage
