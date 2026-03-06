import { invoke } from "./blitz-server"

import getCurrentUser from "./users/queries/getCurrentUser"
import Navbar from "./components/Navbar"
import getUser from "@/src/app/utils/getUser"
import HeroSection from "./components/pages/HeroSection"
import CategorySection from "./components/pages/CategorySection"

import ProductList from "./components/ProductList"
import { Drawer } from "@mui/material"
import React, { useEffect, useState } from "react"
import DrawerCart from "./components/DrawerCart"
import Footer from "./components/Footer"

export default async function Home() {
  // const [currentUser, setCurrentUser] = useState<any>(null)
  const currentUser = await invoke(getCurrentUser, null)

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
