"use client"

import { Outlet } from "react-router-dom"
import { Sidebar } from "./sidebar"
import { useAuthStore } from "./../store/auth-store"
import React, { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "./../components/ui/button"

export default function DashboardLayout() {
  const { user } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-muted/40 relative">
      {/* Sidebar para móvil (drawer) */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden ${sidebarOpen ? "block" : "hidden"}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 transform md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <main className="flex-1 overflow-auto p-4 md:p-6">
        {/* Botón de menú para móvil */}
        <div className="md:hidden mb-4">
          <Button variant="outline" size="icon" onClick={() => setSidebarOpen(true)} className="mb-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menú</span>
          </Button>
        </div>
        <Outlet />
      </main>
    </div>
  )
}

