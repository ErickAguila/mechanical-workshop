"use client"

import React from "react"

import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useMaintenanceStore } from "./../store/maintenance-store"
import { useVehiclesStore } from "./../store/vehicles-store"
import { useUsersStore } from "./../store/users-store"
import { Button } from "./../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./../components/ui/card"
import { Input } from "./../components/ui/input"
import { Label } from "./../components/ui/label"
import { Textarea } from "./../components/ui/textarea"
import { Badge } from "./../components/ui/badge"
import { useToast } from "./../components/ui/use-toast"
import { ArrowLeft, Camera, CheckCircle, Save, Trash2 } from "lucide-react"

export default function MaintenanceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const {
    currentMaintenance,
    loading,
    error,
    fetchMaintenanceById,
    updateMaintenanceDescription,
    addMaintenancePhotos,
    completeMaintenance,
    deleteMaintenance,
  } = useMaintenanceStore()
  const { vehicles, fetchVehicles } = useVehiclesStore()
  const { users, fetchUsers } = useUsersStore()

  const [description, setDescription] = useState("")
  const [newPhotos, setNewPhotos] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        await Promise.all([fetchMaintenanceById(id), fetchVehicles(), fetchUsers()])
      }
    }

    loadData()
  }, [id, fetchMaintenanceById, fetchVehicles, fetchUsers])

  useEffect(() => {
    if (currentMaintenance) {
      setDescription(currentMaintenance.description)
    }
  }, [currentMaintenance])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setNewPhotos([...newPhotos, ...filesArray])

      // Create preview URLs
      const newPreviewUrls = filesArray.map((file) => URL.createObjectURL(file))
      setPreviewUrls([...previewUrls, ...newPreviewUrls])
    }
  }

  const removeNewPhoto = (index: number) => {
    const newPhotosList = [...newPhotos]
    newPhotosList.splice(index, 1)

    const newPreviewUrlsList = [...previewUrls]
    URL.revokeObjectURL(newPreviewUrlsList[index])
    newPreviewUrlsList.splice(index, 1)

    setNewPhotos(newPhotosList)
    setPreviewUrls(newPreviewUrlsList)
  }

  const handleSaveDescription = async () => {
    if (!id) return

    setSaving(true)
    try {
      await updateMaintenanceDescription(id, description)
      toast({
        title: "Descripción actualizada",
        description: "La descripción ha sido actualizada exitosamente.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la descripción.",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSavePhotos = async () => {
    if (!id || newPhotos.length === 0) return

    setSaving(true)
    try {
      await addMaintenancePhotos(id, newPhotos)
      toast({
        title: "Fotos agregadas",
        description: "Las fotos han sido agregadas exitosamente.",
      })
      setNewPhotos([])
      setPreviewUrls([])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron agregar las fotos.",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCompleteMaintenance = async () => {
    if (!id) return

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

  const handleDeleteMaintenance = async () => {
    if (!id) return

    if (confirm("¿Está seguro de eliminar este registro de mantenimiento?")) {
      try {
        await deleteMaintenance(id)
        toast({
          title: "Mantenimiento eliminado",
          description: "El registro de mantenimiento ha sido eliminado.",
        })
        navigate("/maintenance")
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo eliminar el mantenimiento.",
        })
      }
    }
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

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    return vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})` : "Desconocido"
  }

  const getTechnicianName = (technicianId: string) => {
    const technician = users.find((u) => u.id === technicianId)
    return technician ? technician.name : "Desconocido"
  }

  if (loading && !currentMaintenance) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Cargando información del mantenimiento...</p>
      </div>
    )
  }

  if (error || !currentMaintenance) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-destructive">
          Error al cargar el mantenimiento: {error || "No se encontró el mantenimiento"}
        </p>
        <Button asChild>
          <Link to="/maintenance">Volver a la lista</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Detalle de Mantenimiento</h1>
            <p className="text-muted-foreground">Información detallada del mantenimiento</p>
          </div>
        </div>
        <div className="flex gap-2">
          {currentMaintenance.status !== "completed" && (
            <Button variant="outline" onClick={handleCompleteMaintenance} className="hidden sm:flex">
              <CheckCircle className="mr-2 h-4 w-4" />
              Marcar como completado
            </Button>
          )}
          <Button variant="destructive" onClick={handleDeleteMaintenance} className="hidden sm:flex">
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
            <CardDescription>Detalles del mantenimiento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Vehículo</Label>
                <p className="font-medium">{getVehicleName(currentMaintenance.vehicleId)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Técnico</Label>
                <p className="font-medium">{getTechnicianName(currentMaintenance.technicianId)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Estado</Label>
                <div className="mt-1">{getStatusBadge(currentMaintenance.status)}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Fecha de creación</Label>
                <p className="font-medium">{currentMaintenance.createdAt.toLocaleDateString()}</p>
              </div>
            </div>
            {currentMaintenance.completedAt && (
              <div>
                <Label className="text-muted-foreground">Fecha de finalización</Label>
                <p className="font-medium">{currentMaintenance.completedAt.toLocaleDateString()}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between sm:hidden">
            {currentMaintenance.status !== "completed" && (
              <Button variant="outline" onClick={handleCompleteMaintenance} size="sm">
                <CheckCircle className="mr-2 h-4 w-4" />
                Completar
              </Button>
            )}
            <Button variant="destructive" onClick={handleDeleteMaintenance} size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Descripción</CardTitle>
            <CardDescription>Detalles del trabajo realizado</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              disabled={currentMaintenance.status === "completed"}
              placeholder="Ingrese una descripción detallada del mantenimiento..."
            />
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSaveDescription}
              disabled={
                saving || description === currentMaintenance.description || currentMaintenance.status === "completed"
              }
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar Descripción
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Galería de Fotos</CardTitle>
          <CardDescription>Imágenes del mantenimiento</CardDescription>
        </CardHeader>
        <CardContent>
          {currentMaintenance.photos.length === 0 && previewUrls.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
              <p className="text-muted-foreground">No hay fotos disponibles</p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {currentMaintenance.photos.map((photo, index) => (
                  <div
                    key={index}
                    className="group relative aspect-square cursor-pointer overflow-hidden rounded-md border"
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={photo || "/placeholder.svg"}
                      alt={`Foto ${index + 1}`}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>

              {selectedImageIndex !== null && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                  onClick={() => setSelectedImageIndex(null)}
                >
                  <div className="max-h-[90vh] max-w-[90vw]">
                    <img
                      src={currentMaintenance.photos[selectedImageIndex] || "/placeholder.svg"}
                      alt={`Foto ${selectedImageIndex + 1}`}
                      className="max-h-[90vh] max-w-[90vw] object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {currentMaintenance.status !== "completed" && (
        <Card>
          <CardHeader>
            <CardTitle>Agregar Nuevas Fotos</CardTitle>
            <CardDescription>Suba nuevas imágenes del mantenimiento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="new-photos"
                  className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  <Camera className="h-4 w-4" />
                  <span>Seleccionar fotos</span>
                  <Input
                    id="new-photos"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </Label>
                <span className="text-xs text-muted-foreground">{newPhotos.length} foto(s) seleccionada(s)</span>
              </div>

              {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-md border">
                      <img
                        src={url || "/placeholder.svg"}
                        alt={`Nueva foto ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-1 top-1 h-6 w-6"
                        onClick={() => removeNewPhoto(index)}
                      >
                        <span className="sr-only">Eliminar</span>×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSavePhotos} disabled={saving || newPhotos.length === 0}>
              <Save className="mr-2 h-4 w-4" />
              Guardar Fotos
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

