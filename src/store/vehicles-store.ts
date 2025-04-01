import { create } from "zustand"
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "../lib/firebase"

export interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  licensePlate: string
  type: string
  createdAt: Date
}

interface VehiclesState {
  vehicles: Vehicle[]
  loading: boolean
  error: string | null
  fetchVehicles: () => Promise<void>
  addVehicle: (vehicle: Omit<Vehicle, "id" | "createdAt">) => Promise<void>
  updateVehicle: (id: string, vehicle: Partial<Omit<Vehicle, "id" | "createdAt">>) => Promise<void>
  deleteVehicle: (id: string) => Promise<void>
}

export const useVehiclesStore = create<VehiclesState>((set, get) => ({
  vehicles: [],
  loading: false,
  error: null,
  fetchVehicles: async () => {
    set({ loading: true, error: null })
    try {
      const querySnapshot = await getDocs(collection(db, "vehicles"))
      const vehicles = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Vehicle[]
      set({ vehicles, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },
  addVehicle: async (vehicle) => {
    set({ loading: true, error: null })
    try {
      await addDoc(collection(db, "vehicles"), {
        ...vehicle,
        createdAt: new Date(),
      })
      await get().fetchVehicles()
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },
  updateVehicle: async (id, vehicle) => {
    set({ loading: true, error: null })
    try {
      const vehicleRef = doc(db, "vehicles", id)
      await updateDoc(vehicleRef, vehicle)
      await get().fetchVehicles()
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },
  deleteVehicle: async (id) => {
    set({ loading: true, error: null })
    try {
      await deleteDoc(doc(db, "vehicles", id))
      set((state) => ({
        vehicles: state.vehicles.filter((vehicle) => vehicle.id !== id),
        loading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },
}))

