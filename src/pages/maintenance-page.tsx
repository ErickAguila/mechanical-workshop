"use client"

import React from "react"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useMaintenanceStore, type MaintenanceStatus } from "./../store/maintenance-store"
import { useVehiclesStore } from "./../store/vehicles-store"
import { useUsersStore } from "./../store/users-store"
import { Button } from "./../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./../components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./../components/ui/dialog"
import { Input } from "./../components/ui/input"
import { Label } from "./../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./../components/ui/select"
import { Textarea } from "./../components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./../components/ui/table"
import { useToast } from "./../components/ui/use-toast"
import { Badge } from "./../components/ui/badge"
import { Camera, CheckCircle, Eye, Image, PenToolIcon as Tool } from "lucide-react"

export default function MaintenancePage() {
  const { maintenances, loading, fetchMaintenances, addMaintenance, completeMaintenance, deleteMaintenance } =
    useMaintenanceStore()
  const { vehicles, fetchVehicles } = useVehiclesStore()
  const { users, fetchUsers } = useUsersStore()
  const { toast } = useToast()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    vehicleId: "",
    technicianId: "",
    description: "",
    status: "pending" as MaintenanceStatus,
    photos: [] as File[],
  })
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchMaintenances(), fetchVehicles(), fetchUsers()])
    }

    loadData()
  }, [fetchMaintenances, fetchVehicles, fetchUsers])

  const resetForm = () => {
    setFormData({
      vehicleId: "",
      technicianId: "",
      description: "",
      status: "pending",
      photos: [],
    })
    setPreviewUrls([])
  }

  const handleAddMaintenance = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addMaintenance(formData)
      setIsAddDialogOpen(false)
      resetForm()
      toast({
        title: "Mantenimiento registrado",
        description: "El mantenimiento ha sido registrado exitosamente.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo registrar el mantenimiento.",
      })
    }
  }

  const handleCompleteMaintenance = async (id: string) => {
    if (confirm("¿Está seguro de marcar este mantenimiento como completado?")) {
      try {
        await completeMaintenance(id)
        toast({
          title: "Mantenimiento completado",
          description: "El mantenimiento ha sido marcado como completado.",
        })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo completar el mantenimiento.",
        })
      }
    }
  }

  const handleDeleteMaintenance = async (id: string) => {
    if (confirm("¿Está seguro de eliminar este registro de mantenimiento?")) {
      try {
        await deleteMaintenance(id)
        toast({
          title: "Mantenimiento eliminado",
          description: "El registro de mantenimiento ha sido eliminado.",
        })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo eliminar el mantenimiento.",
        })
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setFormData({ ...formData, photos: [...formData.photos, ...filesArray] })

      // Create preview URLs
      const newPreviewUrls = filesArray.map((file) => URL.createObjectURL(file))
      setPreviewUrls([...previewUrls, ...newPreviewUrls])
    }
  }

  const removePhoto = (index: number) => {
    const newPhotos = [...formData.photos]
    newPhotos.splice(index, 1)

    const newPreviewUrls = [...previewUrls]
    URL.revokeObjectURL(newPreviewUrls[index])
    newPreviewUrls.splice(index, 1)

    setFormData({ ...formData, photos: newPhotos })
    setPreviewUrls(newPreviewUrls)
  }

  const getStatusBadge = (status: MaintenanceStatus) => {
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

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    return vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})` : "Desconocido"
  }

  const getTechnicianName = (technicianId: string) => {
    const technician = users.find((u) => u.id === technicianId)
    return technician ? technician.name : "Desconocido"
  }

  const technicians = users.filter((user) => user.role === "technician")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mantenimientos</h1>
          <p className="text-muted-foreground">Registro y seguimiento de mantenimientos de vehículos</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Tool className="mr-2 h-4 w-4" />
              Registrar Mantenimiento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Mantenimiento</DialogTitle>
              <DialogDescription>Complete el formulario para registrar un nuevo mantenimiento.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddMaintenance}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="vehicle">Vehículo</Label>
                    <Select
                      value={formData.vehicleId}
                      onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un vehículo" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.brand} {vehicle.model} ({vehicle.licensePlate})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="technician">Técnico</Label>
                    <Select
                      value={formData.technicianId}
                      onValueChange={(value) => setFormData({ ...formData, technicianId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un técnico" />
                      </SelectTrigger>
                      <SelectContent>
                        {technicians.map((technician) => (
                          <SelectItem key={technician.id} value={technician.id}>
                            {technician.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: MaintenanceStatus) => setFormData({ ...formData, status: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="in-progress">En progreso</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="photos">Fotos</Label>
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="photos"
                      className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium hover:bg-accent hover:text-accent-foreground"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Seleccionar fotos</span>
                      <Input
                        id="photos"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {formData.photos.length} foto(s) seleccionada(s)
                    </span>
                  </div>
                  {previewUrls.length > 0 && (
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url || "/placeholder.svg"}
                            alt={`Preview ${index}`}
                            className="h-20 w-full rounded-md object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute right-1 top-1 h-5 w-5"
                            onClick={() => removePhoto(index)}
                          >
                            <span className="sr-only">Eliminar</span>×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  Guardar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Mantenimientos</CardTitle>
          <CardDescription>Administre los mantenimientos registrados en el sistema.</CardDescription>
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
                  <TableHead>Fotos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No hay mantenimientos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  maintenances.map((maintenance) => (
                    <TableRow key={maintenance.id}>
                      <TableCell>{getVehicleName(maintenance.vehicleId)}</TableCell>
                      <TableCell>{getTechnicianName(maintenance.technicianId)}</TableCell>
                      <TableCell>{getStatusBadge(maintenance.status)}</TableCell>
                      <TableCell>{maintenance.createdAt.toLocaleDateString()}</TableCell>
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
                        {maintenance.status !== "completed" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCompleteMaintenance(maintenance.id)}
                            title="Marcar como completado"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span className="sr-only">Completar</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteMaintenance(maintenance.id)}
                          title="Eliminar"
                        >
                          <span className="sr-only">Eliminar</span>×
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

