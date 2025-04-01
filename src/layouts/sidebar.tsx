"use client"

import { Link, useLocation } from "react-router-dom"
import { signOut } from "firebase/auth"
import { auth } from "./../lib/firebase"
import { useAuthStore } from "./../store/auth-store"
import { Button } from "./../components/ui/button"
import { ModeToggle } from "./../components/mode-toggle"
import { BarChart3, Car, ClipboardList, History, Home, LogOut, PenToolIcon as Tool, Users, X } from "lucide-react"
import React, { useEffect, useState } from "react"

interface SidebarProps {
  onClose?: () => void
}

const menuBase = [
  { path: "/", label: "Dashboard", icon: Home },
  { path: "/users", label: "Usuarios", icon: Users },
  { path: "/vehicles", label: "Vehículos", icon: Car },
  { path: "/maintenance", label: "Mantenimientos", icon: Tool },
  { path: "/history", label: "Historial", icon: History },
  { path: "/reports", label: "Reportes", icon: BarChart3 },
]

export function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation()
  const { user } = useAuthStore()
  const [menuItems, setMenuItems] = useState(menuBase)

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }
  useEffect(() => {
    if (user?.email?.includes("@tecnico")) {
      setMenuItems([
        { path: "/", label: "Dashboard", icon: Home },
        { path: "/vehicles", label: "Vehículos", icon: Car },
        { path: "/maintenance", label: "Mantenimientos", icon: Tool },
        { path: "/history", label: "Historial", icon: History },
      ])
    } else {
      setMenuItems(menuBase)
    }
  }, [user])

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-14 items-center justify-between border-b px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <Car className="h-5 w-5" />
          <span>Taller mecanico</span>
        </Link>
        {/* Botón de cierre para móvil */}
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${isActive(item.path)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              onClick={onClose}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs font-medium">{user?.email?.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <p className="text-xs font-medium truncate max-w-[120px]">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <ModeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Cerrar sesión</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

