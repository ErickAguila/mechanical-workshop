"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./../components/ui/tabs"
import { useVehiclesStore } from "./../store/vehicles-store"
import { useUsersStore } from "./../store/users-store"
import { useMaintenanceStore } from "./../store/maintenance-store"
import { BarChart, LineChart, PieChart } from "./../components/ui/chart"
import { Car, CheckCircle, Clock, Users } from "lucide-react"
import React from "react"

export default function DashboardPage() {
  const { vehicles, fetchVehicles } = useVehiclesStore()
  const { users, fetchUsers } = useUsersStore()
  const { maintenances, fetchMaintenances } = useMaintenanceStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchVehicles(), fetchUsers(), fetchMaintenances()])
      setIsLoading(false)
    }

    loadData()
  }, [fetchVehicles, fetchUsers, fetchMaintenances])

  // Calculate statistics
  const technicianCount = users.filter((user) => user.role === "technician").length
  const pendingMaintenances = maintenances.filter((m) => m.status === "pending").length
  const completedMaintenances = maintenances.filter((m) => m.status === "completed").length
  const inProgressMaintenances = maintenances.filter((m) => m.status === "in-progress").length

  // Prepare chart data
  const getMonthlyMaintenanceData = () => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    const currentYear = new Date().getFullYear()

    const monthlyData = Array(12).fill(0)

    maintenances.forEach((maintenance) => {
      const date = maintenance.createdAt
      if (date.getFullYear() === currentYear) {
        monthlyData[date.getMonth()]++
      }
    })

    return months.map((month, index) => ({
      name: month,
      total: monthlyData[index],
    }))
  }

  const getMaintenanceStatusData = () => {
    return [
      { name: "Pendientes", value: pendingMaintenances },
      { name: "En progreso", value: inProgressMaintenances },
      { name: "Completados", value: completedMaintenances },
    ]
  }

  const getVehicleTypeData = () => {
    const vehicleTypes: Record<string, number> = {}

    vehicles.forEach((vehicle) => {
      if (vehicleTypes[vehicle.type]) {
        vehicleTypes[vehicle.type]++
      } else {
        vehicleTypes[vehicle.type] = 1
      }
    })

    return Object.entries(vehicleTypes).map(([name, value]) => ({
      name,
      value,
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de la gestión de mantenimiento de vehículos</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehículos Registrados</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
            <p className="text-xs text-muted-foreground">Vehículos en el sistema</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Técnicos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{technicianCount}</div>
            <p className="text-xs text-muted-foreground">Técnicos activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mantenimientos Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingMaintenances}</div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mantenimientos Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedMaintenances}</div>
            <p className="text-xs text-muted-foreground">Finalizados con éxito</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-full md:col-span-4">
              <CardHeader>
                <CardTitle>Mantenimientos Mensuales</CardTitle>
              </CardHeader>
              <CardContent className="pl-2 overflow-x-auto">
                <div className="min-w-[500px] md:min-w-0">
                  <BarChart
                    data={getMonthlyMaintenanceData()}
                    index="name"
                    categories={["total"]}
                    colors={["blue"]}
                    valueFormatter={(value) => `${value} mantenimientos`}
                    yAxisWidth={40}
                    height={350}
                  />
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-full md:col-span-3">
              <CardHeader>
                <CardTitle>Estado de Mantenimientos</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart
                  data={getMaintenanceStatusData()}
                  index="name"
                  category="value"
                  valueFormatter={(value) => `${value} mantenimientos`}
                  colors={["yellow", "blue", "green"]}
                  height={350}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-full md:col-span-4">
              <CardHeader>
                <CardTitle>Tipos de Vehículos</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart
                  data={getVehicleTypeData()}
                  index="name"
                  category="value"
                  valueFormatter={(value) => `${value} vehículos`}
                  colors={["blue", "cyan", "indigo", "violet"]}
                  height={350}
                />
              </CardContent>
            </Card>
            <Card className="col-span-full md:col-span-3">
              <CardHeader>
                <CardTitle>Tendencia de Mantenimientos</CardTitle>
              </CardHeader>
              <CardContent className="pl-2 overflow-x-auto">
                <div className="min-w-[500px] md:min-w-0">
                  <LineChart
                    data={getMonthlyMaintenanceData()}
                    index="name"
                    categories={["total"]}
                    colors={["blue"]}
                    valueFormatter={(value) => `${value} mantenimientos`}
                    yAxisWidth={40}
                    height={350}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

