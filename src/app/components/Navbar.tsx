"use client"
import React, { useState } from "react"
import { LogoutButton } from "../(auth)/components/LogoutButton"
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag"
import getAllCartItem from "../queries/getAllCartItem"
import { useQuery } from "@blitzjs/rpc"
const Navbar = ({ currentUser, toggleDrawer }) => {
  //  const currentUser = props.currentUser
  //  const {toggleDrawer} = props
  const [isOpen, setIsOpen] = useState(false)
  const [cartItems] = useQuery(getAllCartItem, null)

  const toggleTest = () => {
    toggleDrawer(true)
    console.log("test")
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleClick = () => {
    alert(currentUser.name + " is logged in" + currentUser.role)
  }

  return (
    <nav className="bg-gray-800 text-white fixed top-0 z-10 w-full shadow px-24">
      <div className="container flex justify-evenly items-center px-16 py-4">
        <h1 className="text-2xl font-bold">MyApp</h1>
        {/* Hamburger Menu Button */}
        <button
          className="sm:hidden md:hidden block text-2xl focus:outline-none"
          onClick={toggleMenu}
        >
          {isOpen ? "✖" : "☰"}
        </button>
        {/* Navbar Links */}
        <ul
          className={`sm:flex flex-col sm:flex-row sm:static absolute top-full right-0 w-full sm:w-auto bg-gray-800 sm:bg-transparent transition-transform transform duration-300 ease-in-out ${
            isOpen ? "translate-y-0" : "hidden"
          }`}
        >
          <li className="px-4 py-2 hover:bg-gray-700 sm:hover:bg-transparent">
            <a href="/">Home</a>
          </li>
          <li className="px-4 py-2 hover:bg-gray-700 sm:hover:bg-transparent">
            <a href="#about">About</a>
          </li>
          <li className="px-4 py-2 hover:bg-gray-700 sm:hover:bg-transparent">
            <a href="#services">Products</a>
          </li>
          <li className="px-4 py-2 hover:bg-gray-700 sm:hover:bg-transparent">
            <a href="#contact">Contact</a>
          </li>

          {currentUser ? (
            <>
              {currentUser.role === "ADMIN" ? (
                <li className="px-4 py-2 hover:bg-gray-700 sm:hover:bg-transparent">
                  <a href="/admin">Admin Dashboard</a>{" "}
                </li>
              ) : currentUser.role === "USER" ? (
                <li className="px-4 py-2 hover:bg-gray-700 sm:hover:bg-transparent">
                  <a href="/renter">Dashboard</a>
                </li>
              ) : currentUser.role === "SHOP" ? (
                <li className="px-4 py-2 hover:bg-gray-700 sm:hover:bg-transparent">
                  <a href="/shop">Dashboard</a>
                </li>
              ) : (
                <a href="/">Home</a>
              )}

              <li className="px-4 py-2 hover:bg-gray-700 sm:hover:bg-transparent">
                <LogoutButton />
              </li>
            </>
          ) : (
            <>
              <li className="px-4 py-2 hover:bg-gray-700 sm:hover:bg-transparent">
                <a href="/login">Login</a>
              </li>
              <li className="px-4 py-2 hover:bg-gray-700 sm:hover:bg-transparent">
                <a href="/signup">Register</a>
              </li>
            </>
          )}
        </ul>
        <div>
          <div className="relative">
            <button onClick={toggleDrawer}>
              <ShoppingBagIcon />
            </button>
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {cartItems?.length || 0}
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
