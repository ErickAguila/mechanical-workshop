"use client"

import { useEffect } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { Toaster } from "@/components/ui/toaster"
import { useAuthStore } from "./store/auth-store"
import LoginPage from "./pages/login-page"
import DashboardLayout from "./layouts/dashboard-layout"
import DashboardPage from "./pages/dashboard-page"
import UsersPage from "./pages/users-page"
import VehiclesPage from "./pages/vehicles-page"
import MaintenancePage from "./pages/maintenance-page"
import MaintenanceDetailPage from "./pages/maintenance-detail-page"
import HistoryPage from "./pages/history-page"
import ReportsPage from "./pages/reports-page"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./lib/firebase"

function App() {
  const { user, setUser } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [setUser])

  return (
    <>
      <Routes>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <DashboardLayout /> : <Navigate to="/login" />}>
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="maintenance/:id" element={<MaintenanceDetailPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}

export default App

