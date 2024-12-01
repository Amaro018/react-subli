import { invoke } from "./blitz-server"

import getCurrentUser from "./users/queries/getCurrentUser"
import Navbar from "./components/Navbar"

import ProductList from "./components/ProductList"

export default async function Home() {
  const currentUser = await invoke(getCurrentUser, null)
  return (
    <>
      <Navbar currentUser={currentUser} />

      <ProductList />
    </>
  )
}
