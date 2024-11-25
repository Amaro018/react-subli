"use client"
import React, { useState } from "react"
import { LogoutButton } from "../(auth)/components/LogoutButton"
import Link from "next/link"

const Navbar = (props) => {
  const currentUser = props.currentUser
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleClick = () => {
    alert(currentUser.name + " is logged in" + currentUser.role)
  }

  return (
    <nav className="bg-gray-800 text-white sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
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
            <Link href="./">Home</Link>
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
          <li>
            <button onClick={handleClick}>test</button>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
