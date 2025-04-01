import { create } from "zustand"
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db, auth } from "../lib/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth";

export type UserRole = "admin" | "technician"

export interface User {
  id: string
  rut: string
  name: string
  lastname: string
  email: string
  password: string
  role: UserRole
  createdAt: Date
}

interface UsersState {
  users: User[]
  loading: boolean
  error: string | null
  fetchUsers: () => Promise<void>
  addUser: (user: Omit<User, "id" | "createdAt">) => Promise<void>
  updateUser: (id: string, user: Partial<Omit<User, "id" | "createdAt">>) => Promise<void>
  deleteUser: (id: string) => Promise<void>
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  loading: false,
  error: null,
  fetchUsers: async () => {
    set({ loading: true, error: null })
    try {
      const querySnapshot = await getDocs(collection(db, "users"))
      const users = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      })) as User[]
      set({ users, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },
  addUser: async (user) => {
    set({ loading: true, error: null })
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      if (usersData.length >= 5) {
        set({ error: "No puedes agregar más usuarios", loading: false })
      } else {
        await addDoc(collection(db, "users"), {
          ...user,
          createdAt: new Date(),
        })
        console.log('Usuario creado con éxito en Firestore');
      }

      await get().fetchUsers()
    } catch (error) {
      console.error('Error interno al agregar el usuario o Firestore: ', error);
      set({ error: (error as Error).message, loading: false })
    } finally {
      set({ loading: false })
    }
  },
  updateUser: async (id, user) => {
    set({ loading: true, error: null })
    try {
      const userRef = doc(db, "users", id)
      await updateDoc(userRef, user)
      await get().fetchUsers()
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },
  deleteUser: async (id) => {
    set({ loading: true, error: null })
    try {
      await deleteDoc(doc(db, "users", id))
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
        loading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },
}))

