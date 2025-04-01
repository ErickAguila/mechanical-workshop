"use client"

import { useEffect, useState } from "react"
import { useMaintenanceStore } from "./../store/maintenance-store"
import { useVehiclesStore } from "./../store/vehicles-store"
import { useUsersStore } from "./../store/users-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./../components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./../components/ui/tabs"
import { BarChart, PieChart } from "./../components/ui/chart"
import React from "react"

export default function ReportsPage() {
  const { maintenances, fetchMaintenances } = useMaintenanceStore()
  const { vehicles, fetchVehicles } = useVehiclesStore()
  const { users, fetchUsers } = useUsersStore()
  const [selectedTechnician, setSelectedTechnician] = useState<string>("")
  const [selectedVehicle, setSelectedVehicle] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchMaintenances(), fetchVehicles(), fetchUsers()])
      setIsLoading(false)
    }

    loadData()
  }, [fetchMaintenances, fetchVehicles, fetchUsers])

  const technicians = users.filter((user) => user.role === "technician")
  const years = Array.from(new Set(maintenances.map((m) => m.createdAt.getFullYear()))).sort((a, b) => b - a)

  // If no years in data, add current year
  if (years.length === 0) {
    years.push(new Date().getFullYear())
  }

  const filteredMaintenances = maintenances.filter(
    (maintenance) =>
      (selectedTechnician ? maintenance.technicianId === selectedTechnician : true) &&
      (selectedVehicle ? maintenance.vehicleId === selectedVehicle : true) &&
      maintenance.createdAt.getFullYear().toString() === selectedYear,
  )

  // Prepare chart data
  const getMonthlyMaintenanceData = () => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    const selectedYearNum = Number.parseInt(selectedYear)

    const monthlyData = Array(12).fill(0)
    const completedData = Array(12).fill(0)

    filteredMaintenances.forEach((maintenance) => {
      const date = maintenance.createdAt
      if (date.getFullYear() === selectedYearNum) {
        monthlyData[date.getMonth()]++
        if (maintenance.status === "completed") {
          completedData[date.getMonth()]++
        }
      }
    })

    return months.map((month, index) => ({
      name: month,
      total: monthlyData[index],
      completados: completedData[index],
    }))
  }

  const getMaintenanceByTechnicianData = () => {
    const technicianCounts: Record<string, number> = {}

    technicians.forEach((technician) => {
      technicianCounts[technician.id] = 0
    })

    filteredMaintenances.forEach((maintenance) => {
      if (technicianCounts[maintenance.technicianId] !== undefined) {
        technicianCounts[maintenance.technicianId]++
      }
    })

    return Object.entries(technicianCounts)
      .map(([id, count]) => ({
        name: getTechnicianName(id),
        value: count,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
  }

  const getMaintenanceByVehicleData = () => {
    const vehicleCounts: Record<string, number> = {}

    vehicles.forEach((vehicle) => {
      vehicleCounts[vehicle.id] = 0
    })

    filteredMaintenances.forEach((maintenance) => {
      if (vehicleCounts[maintenance.vehicleId] !== undefined) {
        vehicleCounts[maintenance.vehicleId]++
      }
    })

    return Object.entries(vehicleCounts)
      .map(([id, count]) => ({
        name: getVehicleName(id),
        value: count,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) // Top 5
  }

  const getMaintenanceStatusData = () => {
    const pending = filteredMaintenances.filter((m) => m.status === "pending").length
    const inProgress = filteredMaintenances.filter((m) => m.status === "in-progress").length
    const completed = filteredMaintenances.filter((m) => m.status === "completed").length

    return [
      { name: "Pendientes", value: pending },
      { name: "En progreso", value: inProgress },
      { name: "Completados", value: completed },
    ]
  }

  const getTechnicianName = (technicianId: string) => {
    const technician = users.find((u) => u.id === technicianId)
    return technician ? technician.name : "Desconocido"
  }

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    return vehicle ? `${vehicle.brand} ${vehicle.model}` : "Desconocido"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground">Análisis y estadísticas de mantenimientos</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtre los reportes por técnico, vehículo y año</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="grid gap-2">
              <label htmlFor="technician-filter">Técnico</label>
              <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los técnicos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los técnicos</SelectItem>
                  {technicians.map((technician) => (
                    <SelectItem key={technician.id} value={technician.id}>
                      {technician.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="vehicle-filter">Vehículo</label>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los vehículos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los vehículos</SelectItem>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model} ({vehicle.licensePlate})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="year-filter">Año</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar año" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="monthly">Mensual</TabsTrigger>
          <TabsTrigger value="technicians">Por Técnico</TabsTrigger>
          <TabsTrigger value="vehicles">Por Vehículo</TabsTrigger>
          <TabsTrigger value="status">Por Estado</TabsTrigger>
        </TabsList>
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mantenimientos Mensuales ({selectedYear})</CardTitle>
              <CardDescription>Cantidad de mantenimientos registrados por mes</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="min-w-[500px] md:min-w-0">
                <BarChart
                  data={getMonthlyMaintenanceData()}
                  index="name"
                  categories={["total", "completados"]}
                  colors={["blue", "green"]}
                  valueFormatter={(value) => `${value} mantenimientos`}
                  yAxisWidth={40}
                  height={400}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="technicians" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mantenimientos por Técnico</CardTitle>
              <CardDescription>Distribución de mantenimientos por técnico</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="min-w-[500px] md:min-w-0">
                <BarChart
                  data={getMaintenanceByTechnicianData()}
                  index="name"
                  categories={["value"]}
                  colors={["blue"]}
                  valueFormatter={(value) => `${value} mantenimientos`}
                  layout="vertical"
                  height={400}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Vehículos con más Mantenimientos</CardTitle>
              <CardDescription>Vehículos que han requerido más atención</CardDescription>
            </CardHeader>
            <CardContent>
              <PieChart
                data={getMaintenanceByVehicleData()}
                index="name"
                category="value"
                valueFormatter={(value) => `${value} mantenimientos`}
                colors={["blue", "cyan", "indigo", "violet", "purple"]}
                height={400}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estado de Mantenimientos</CardTitle>
              <CardDescription>Distribución de mantenimientos por estado</CardDescription>
            </CardHeader>
            <CardContent>
              <PieChart
                data={getMaintenanceStatusData()}
                index="name"
                category="value"
                valueFormatter={(value) => `${value} mantenimientos`}
                colors={["yellow", "blue", "green"]}
                height={400}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

