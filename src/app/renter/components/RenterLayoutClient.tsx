"use client"
import React from "react"
import { Sidebar } from "./sidebar"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"

export default function RenterLayoutClient({
  currentUser,
  children,
}: {
  currentUser: any
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f5]">
      {/* Fixed Navbar */}
      <div className="fixed top-0 z-50 w-full">
        <Navbar currentUser={currentUser} />
      </div>

      {/* Main Container */}
      <div className="mx-auto flex w-full max-w-[1400px] flex-1 pt-16">
        {/* Desktop Sidebar */}
        <div className="h-[calc(100vh-4rem)] sticky top-16 hidden md:block">
          <Sidebar currentUser={currentUser} />
        </div>

        {/* Main Content Area */}
        <main className="scrollbar-sidebar h-[calc(100vh-4rem)] flex min-w-0 flex-1 flex-col overflow-y-auto bg-white shadow-sm md:border-l md:border-gray-200">
          {/* Content Area */}
          <div className="flex-1 p-4 md:p-8">{children}</div>

          {/* Footer */}
          <Footer />
        </main>
      </div>
    </div>
  )
}
