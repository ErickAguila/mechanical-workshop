"use client"

import React from "react"

import { useEffect, useState } from "react"
import { useVehiclesStore, type Vehicle } from "./../store/vehicles-store"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./../components/ui/table"
import { useToast } from "./../components/ui/use-toast"
import { Car, Edit, Trash2 } from "lucide-react"

export default function VehiclesPage() {
  const { vehicles, loading, fetchVehicles, addVehicle, updateVehicle, deleteVehicle } = useVehiclesStore()
  const { toast } = useToast()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    licensePlate: "",
    type: "sedan",
  })
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null)

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  const resetForm = () => {
    setFormData({
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      licensePlate: "",
      type: "sedan",
    })
    setEditingVehicleId(null)
  }

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      //TODO: Validar que la patente sea válida
      //TODO: Validar que la patente no esté repetida
      await addVehicle(formData)
      setIsAddDialogOpen(false)
      resetForm()
      toast({
        title: "Vehículo agregado",
        description: "El vehículo ha sido agregado exitosamente.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo agregar el vehículo.",
      })
    }
  }

  const handleEditVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingVehicleId) return

    try {
      await updateVehicle(editingVehicleId, formData)
      setIsEditDialogOpen(false)
      resetForm()
      toast({
        title: "Vehículo actualizado",
        description: "El vehículo ha sido actualizado exitosamente.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el vehículo.",
      })
    }
  }

  const handleDeleteVehicle = async (id: string) => {
    if (confirm("¿Está seguro de eliminar este vehículo?")) {
      try {
        await deleteVehicle(id)
        toast({
          title: "Vehículo eliminado",
          description: "El vehículo ha sido eliminado exitosamente.",
        })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo eliminar el vehículo.",
        })
      }
    }
  }

  const openEditDialog = (vehicle: Vehicle) => {
    setFormData({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate,
      type: vehicle.type,
    })
    setEditingVehicleId(vehicle.id)
    setIsEditDialogOpen(true)
  }

  const vehicleTypes = [
    { value: "sedan", label: "Sedán" },
    { value: "suv", label: "SUV" },
    { value: "pickup", label: "Pickup" },
    { value: "van", label: "Van" },
    { value: "truck", label: "Camión" },
    { value: "motorcycle", label: "Motocicleta" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehículos</h1>
          <p className="text-muted-foreground">Gestión de vehículos del sistema</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Car className="mr-2 h-4 w-4" />
              Agregar Vehículo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Vehículo</DialogTitle>
              <DialogDescription>Complete el formulario para agregar un nuevo vehículo al sistema.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddVehicle}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="brand">Marca</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      maxLength={20}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="model">Modelo</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      maxLength={20}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="year">Año</Label>
                    <Input
                      id="year"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: Number.parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="licensePlate">Placa</Label>
                    <Input
                      id="licensePlate"
                      value={formData.licensePlate}
                      maxLength={6}
                      onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Tipo de Vehículo</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
          <CardTitle>Lista de Vehículos</CardTitle>
          <CardDescription>Administre los vehículos registrados en el sistema.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="min-w-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Marca</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Año</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No hay vehículos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell>{vehicle.brand}</TableCell>
                      <TableCell>{vehicle.model}</TableCell>
                      <TableCell>{vehicle.year}</TableCell>
                      <TableCell>{vehicle.licensePlate}</TableCell>
                      <TableCell>{vehicleTypes.find((t) => t.value === vehicle.type)?.label || vehicle.type}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(vehicle)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteVehicle(vehicle.id)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Vehículo</DialogTitle>
            <DialogDescription>Actualice la información del vehículo.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditVehicle}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-brand">Marca</Label>
                  <Input
                    id="edit-brand"
                    value={formData.brand}
                    maxLength={20}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-model">Modelo</Label>
                  <Input
                    id="edit-model"
                    value={formData.model}
                    maxLength={20}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-year">Año</Label>
                  <Input
                    id="edit-year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number.parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-licensePlate">Placa</Label>
                  <Input
                    id="edit-licensePlate"
                    value={formData.licensePlate}
                    maxLength={6}
                    onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-type">Tipo de Vehículo</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                Actualizar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

