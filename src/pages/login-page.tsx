"use client"

import React from "react"

import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "./../lib/firebase"
import { Button } from "./../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./../components/ui/card"
import { Input } from "./../components/ui/input"
import { Label } from "./../components/ui/label"
import { useToast } from "./../components/ui/use-toast"
import { ClipboardList } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("admin@admin.com")
  const [password, setPassword] = useState("123123")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al sistema de gestión de mantenimiento",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de inicio de sesión",
        description: "Credenciales incorrectas. Intente nuevamente.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <ClipboardList className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-xl sm:text-2xl">Gestión de Mantenimiento</CardTitle>
          <CardDescription>Ingrese sus credenciales para acceder al sistema</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                maxLength={100}
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Button variant="link" className="h-auto p-0 text-xs">
                  ¿Olvidó su contraseña?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                maxLength={50}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

