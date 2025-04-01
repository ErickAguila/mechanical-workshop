import { create } from "zustand"
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDoc,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "../lib/firebase"

export type MaintenanceStatus = "pending" | "in-progress" | "completed"

export interface Maintenance {
  id: string
  vehicleId: string
  technicianId: string
  description: string
  status: MaintenanceStatus
  photos: string[]
  createdAt: Date
  completedAt?: Date
}

interface MaintenanceState {
  maintenances: Maintenance[]
  currentMaintenance: Maintenance | null
  loading: boolean
  error: string | null
  fetchMaintenances: () => Promise<void>
  fetchMaintenancesByTechnician: (technicianId: string) => Promise<void>
  fetchMaintenanceById: (id: string) => Promise<Maintenance | null>
  addMaintenance: (maintenance: Omit<Maintenance, "id" | "createdAt" | "photos"> & { photos: File[] }) => Promise<void>
  updateMaintenance: (id: string, maintenance: Partial<Omit<Maintenance, "id" | "createdAt">>) => Promise<void>
  updateMaintenanceDescription: (id: string, description: string) => Promise<void>
  addMaintenancePhotos: (id: string, photos: File[]) => Promise<void>
  completeMaintenance: (id: string) => Promise<void>
  deleteMaintenance: (id: string) => Promise<void>
}

export const useMaintenanceStore = create<MaintenanceState>((set, get) => ({
  maintenances: [],
  currentMaintenance: null,
  loading: false,
  error: null,
  fetchMaintenances: async () => {
    set({ loading: true, error: null })
    try {
      const q = query(collection(db, "maintenances"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      const maintenances = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        completedAt: doc.data().completedAt ? doc.data().completedAt.toDate() : undefined,
      })) as Maintenance[]
      set({ maintenances, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },
  fetchMaintenancesByTechnician: async (technicianId) => {
    set({ loading: true, error: null })
    try {
      const q = query(
        collection(db, "maintenances"),
        where("technicianId", "==", technicianId),
        orderBy("createdAt", "desc"),
      )
      const querySnapshot = await getDocs(q)
      const maintenances = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        completedAt: doc.data().completedAt ? doc.data().completedAt.toDate() : undefined,
      })) as Maintenance[]
      set({ maintenances, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },
  fetchMaintenanceById: async (id) => {
    set({ loading: true, error: null })
    try {
      const docRef = doc(db, "maintenances", id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const maintenanceData = docSnap.data()
        const maintenance = {
          id: docSnap.id,
          ...maintenanceData,
          createdAt: maintenanceData.createdAt.toDate(),
          completedAt: maintenanceData.completedAt ? maintenanceData.completedAt.toDate() : undefined,
        } as Maintenance

        set({ currentMaintenance: maintenance, loading: false })
        return maintenance
      } else {
        set({ currentMaintenance: null, loading: false, error: "Mantenimiento no encontrado" })
        return null
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false, currentMaintenance: null })
      return null
    }
  },
  addMaintenance: async (maintenance) => {
    set({ loading: true, error: null })
    try {
      // Upload photos
      const photoUrls: string[] = []
      for (const photo of maintenance.photos) {
        const storageRef = ref(storage, `maintenance-photos/${Date.now()}-${photo.name}`)
        await uploadBytes(storageRef, photo)
        const url = await getDownloadURL(storageRef)
        photoUrls.push(url)
      }

      // Add maintenance record with photo URLs
      await addDoc(collection(db, "maintenances"), {
        vehicleId: maintenance.vehicleId,
        technicianId: maintenance.technicianId,
        description: maintenance.description,
        status: maintenance.status,
        photos: photoUrls,
        createdAt: new Date(),
      })

      await get().fetchMaintenances()
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },
  updateMaintenance: async (id, maintenance) => {
    set({ loading: true, error: null })
    try {
      const maintenanceRef = doc(db, "maintenances", id)
      await updateDoc(maintenanceRef, maintenance)
      await get().fetchMaintenances()

      // Update current maintenance if it's the one being edited
      if (get().currentMaintenance?.id === id) {
        await get().fetchMaintenanceById(id)
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },
  updateMaintenanceDescription: async (id, description) => {
    set({ loading: true, error: null })
    try {
      const maintenanceRef = doc(db, "maintenances", id)
      await updateDoc(maintenanceRef, { description })

      // Update current maintenance if it's the one being edited
      if (get().currentMaintenance?.id === id) {
        const currentMaintenance = get().currentMaintenance
        set({
          currentMaintenance: currentMaintenance ? { ...currentMaintenance, description } : null,
          loading: false,
        })
      }

      // Update the maintenance in the list
      const updatedMaintenances = get().maintenances.map((maintenance) =>
        maintenance.id === id ? { ...maintenance, description } : maintenance,
      )
      set({ maintenances: updatedMaintenances, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },
  addMaintenancePhotos: async (id, photos) => {
    set({ loading: true, error: null })
    try {
      // Upload new photos
      const photoUrls: string[] = []
      for (const photo of photos) {
        const storageRef = ref(storage, `maintenance-photos/${Date.now()}-${photo.name}`)
        await uploadBytes(storageRef, photo)
        const url = await getDownloadURL(storageRef)
        photoUrls.push(url)
      }

      // Get current maintenance
      const maintenanceRef = doc(db, "maintenances", id)
      const maintenanceSnap = await getDoc(maintenanceRef)

      if (maintenanceSnap.exists()) {
        const currentPhotos = maintenanceSnap.data().photos || []

        // Update with combined photos
        await updateDoc(maintenanceRef, {
          photos: [...currentPhotos, ...photoUrls],
        })

        // Update current maintenance if it's the one being edited
        if (get().currentMaintenance?.id === id) {
          const currentMaintenance = get().currentMaintenance
          set({
            currentMaintenance: currentMaintenance
              ? { ...currentMaintenance, photos: [...currentMaintenance.photos, ...photoUrls] }
              : null,
            loading: false,
          })
        }

        // Update the maintenance in the list
        const updatedMaintenances = get().maintenances.map((maintenance) =>
          maintenance.id === id ? { ...maintenance, photos: [...maintenance.photos, ...photoUrls] } : maintenance,
        )
        set({ maintenances: updatedMaintenances, loading: false })
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },
  completeMaintenance: async (id) => {
    set({ loading: true, error: null })
    try {
      const maintenanceRef = doc(db, "maintenances", id)
      await updateDoc(maintenanceRef, {
        status: "completed",
        completedAt: new Date(),
      })

      // Update current maintenance if it's the one being completed
      if (get().currentMaintenance?.id === id) {
        const currentMaintenance = get().currentMaintenance
        const completedAt = new Date()
        set({
          currentMaintenance: currentMaintenance ? { ...currentMaintenance, status: "completed", completedAt } : null,
          loading: false,
        })
      }

      // Update the maintenance in the list
      const updatedMaintenances = get().maintenances.map((maintenance) =>
        maintenance.id === id ? { ...maintenance, status: "completed" as MaintenanceStatus, completedAt: new Date() } : maintenance,
      ) as Maintenance[]
      set({ maintenances: updatedMaintenances, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },
  deleteMaintenance: async (id) => {
    set({ loading: true, error: null })
    try {
      await deleteDoc(doc(db, "maintenances", id))
      set((state) => ({
        maintenances: state.maintenances.filter((maintenance) => maintenance.id !== id),
        currentMaintenance: state.currentMaintenance?.id === id ? null : state.currentMaintenance,
        loading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },
}))

