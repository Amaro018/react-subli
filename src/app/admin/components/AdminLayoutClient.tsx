// d:\Users\Jayzel\react repos\react-subli\src\app\admin\components\DashboardLayout.tsx
"use client"
import React, { useState } from "react"
import { Sidebar } from "./Sidebar"
import Header from "./Header"
import Footer from "../../components/Footer"

interface DashboardLayoutProps {
  children: React.ReactNode
  currentUser: any
}

export default function DashboardLayout({ children, currentUser }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleToggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setIsCollapsed(!isCollapsed)
    } else {
      setSidebarOpen(!sidebarOpen)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        currentUser={currentUser}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isCollapsed={isCollapsed}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header toggleSidebar={handleToggleSidebar} />
        <main className="flex-1 flex flex-col overflow-x-hidden overflow-y-auto bg-gray-100 scrollbar-seamless">
          <div className="flex-1 p-4 md:p-6">{children}</div>
          <Footer />
        </main>
      </div>
    </div>
  )
}
