"use client"
import { invoke } from "./blitz-server"

import getCurrentUser from "./users/queries/getCurrentUser"
import Navbar from "./components/Navbar"
import getUser from "@/src/app/utils/getUser"

import ProductList from "./components/ProductList"
import { Drawer } from "@mui/material"
import React, { useEffect, useState } from "react"
import DrawerCart from "./components/DrawerCart"

export default function Home() {
  const [currentUser, setCurrentUser] = useState<any>(null)

  const getCurrentUser = async () => {
    const user = await getUser()
    setCurrentUser(user)
  }
  useEffect(() => {
    getCurrentUser()
  }, [])

  const [isOpen, setIsOpen] = useState(false)

  const toggleDrawer = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      <Navbar currentUser={currentUser} toggleDrawer={toggleDrawer} />
      <ProductList />
      <Drawer anchor="right" open={isOpen} onClose={toggleDrawer}>
        <DrawerCart />
      </Drawer>
    </>
  )
}
