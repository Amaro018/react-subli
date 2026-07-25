"use client"
import React, { useState } from "react"
import { Sidebar } from "./sidebar"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import { Drawer, IconButton } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"

export default function RenterLayoutClient({
  currentUser,
  children,
}: {
  currentUser: any
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f5]">
      {/* Fixed Navbar */}
      <div className="fixed top-0 z-50 w-full">
        <Navbar currentUser={currentUser} />
      </div>

      {/* Mobile Header (Fixed at top-16) */}
      <div className="fixed left-0 right-0 top-16 z-40 flex items-center justify-between bg-white px-4 py-2 shadow-sm md:hidden">
        <span className="font-bold text-[#1b2a80]">My Dashboard</span>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="end"
          onClick={handleDrawerToggle}
          sx={{ color: "#1b2a80" }}
        >
          <MenuIcon />
        </IconButton>
      </div>

      {/* Main Container */}
      <div className="mx-auto flex w-full max-w-[1400px] flex-1 pt-20 md:pt-16">
        {/* Desktop Sidebar (Leftmost, No Border Radius) */}
        <div className="h-[calc(100vh-4rem)] sticky top-16 hidden md:block">
          <Sidebar currentUser={currentUser} />
        </div>

        {/* Mobile Drawer Sidebar */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: 280 },
          }}
        >
          <Sidebar currentUser={currentUser} onMobileClose={handleDrawerToggle} />
        </Drawer>

        {/* Main Content Area */}
        {/* Added 'pt-16' to mobile to create space 
                   under the 'My Dashboard' fixed header 
                */}
        <main className="scrollbar-sidebar h-[calc(100vh-4rem)] flex min-w-0 flex-1 flex-col overflow-y-auto bg-white shadow-sm md:border-l md:border-gray-200">
          {/* Content Area */}
          <div className="flex-1 p-4 pt-16 md:p-8">{children}</div>

          {/* Footer */}
          <Footer />
        </main>
      </div>
    </div>
  )
}
