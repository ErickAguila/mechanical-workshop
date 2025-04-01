"use client"

import { useEffect, useState } from "react"

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Función para verificar si la pantalla es móvil
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Verificar inicialmente
    checkMobile()

    // Agregar listener para cambios de tamaño de ventana
    window.addEventListener("resize", checkMobile)

    // Limpiar listener al desmontar
    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  return isMobile
}

