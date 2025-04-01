"use client"

import { useEffect, useState } from "react"
import { useMaintenanceStore } from "./../store/maintenance-store"
import { useVehiclesStore } from "./../store/vehicles-store"
import { useUsersStore } from "./../store/users-store"
import { Button } from "./../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./../components/ui/table"
import { Badge } from "./../components/ui/badge"
import { Calendar } from "./../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./../components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Eye, FileDown, Image } from "lucide-react"
import { Link } from "react-router-dom"
import React from "react"

export default function HistoryPage() {
  const { maintenances, fetchMaintenances, fetchMaintenancesByTechnician } = useMaintenanceStore()
  const { vehicles, fetchVehicles } = useVehiclesStore()
  const { users, fetchUsers } = useUsersStore()
  const [selectedTechnician, setSelectedTechnician] = useState<string>("")
  const [selectedVehicle, setSelectedVehicle] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchMaintenances(), fetchVehicles(), fetchUsers()])
      setIsLoading(false)
    }

    loadData()
  }, [fetchMaintenances, fetchVehicles, fetchUsers])

  useEffect(() => {
    const loadFilteredData = async () => {
      setIsLoading(true)
      if (selectedTechnician) {
        await fetchMaintenancesByTechnician(selectedTechnician)
      } else {
        await fetchMaintenances()
      }
      setIsLoading(false)
    }

    loadFilteredData()
  }, [selectedTechnician, fetchMaintenancesByTechnician, fetchMaintenances])

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    return vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})` : "Desconocido"
  }

  const getTechnicianName = (technicianId: string) => {
    const technician = users.find((u) => u.id === technicianId)
    return technician ? technician.name : "Desconocido"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            Pendiente
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            En progreso
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Completado
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const technicians = users.filter((user) => user.role === "technician")

  const filteredMaintenances = maintenances.filter(
    (maintenance) =>
      (selectedVehicle ? maintenance.vehicleId === selectedVehicle : true) &&
      (selectedDate
        ? maintenance.createdAt.getDate() === selectedDate.getDate() &&
          maintenance.createdAt.getMonth() === selectedDate.getMonth() &&
          maintenance.createdAt.getFullYear() === selectedDate.getFullYear()
        : true),
  )

  const handleExportPDF = () => {
    alert("Funcionalidad de exportación a PDF en desarrollo")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historial de Mantenimientos</h1>
          <p className="text-muted-foreground">Consulte el historial de mantenimientos realizados</p>
        </div>
        <Button onClick={handleExportPDF}>
          <FileDown className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtre el historial por técnico, vehículo o fecha</CardDescription>
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
              <label>Fecha</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Mantenimientos</CardTitle>
          <CardDescription>{filteredMaintenances.length} mantenimiento(s) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="min-w-[700px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Técnico</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Fotos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaintenances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No hay mantenimientos que coincidan con los filtros
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMaintenances.map((maintenance) => (
                    <TableRow key={maintenance.id}>
                      <TableCell>{getVehicleName(maintenance.vehicleId)}</TableCell>
                      <TableCell>{getTechnicianName(maintenance.technicianId)}</TableCell>
                      <TableCell>{getStatusBadge(maintenance.status)}</TableCell>
                      <TableCell>{maintenance.createdAt.toLocaleDateString()}</TableCell>
                      <TableCell className="max-w-xs truncate">{maintenance.description}</TableCell>
                      <TableCell>
                        {maintenance.photos.length > 0 ? (
                          <div className="flex items-center gap-1">
                            <Image className="h-4 w-4" />
                            <span>{maintenance.photos.length}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sin fotos</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" title="Ver detalle" asChild>
                          <Link to={`/maintenance/${maintenance.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver detalle</span>
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

