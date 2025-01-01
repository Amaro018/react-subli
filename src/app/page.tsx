import { invoke } from "./blitz-server"

import getCurrentUser from "./users/queries/getCurrentUser"
import Navbar from "./components/Navbar"
import getUser from "@/src/app/utils/getUser"

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
      <Navbar currentUser={currentUser} />
      <div className="h-full">
        <ProductList />
      </div>
      <Footer />
    </>
  )
}
