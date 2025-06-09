"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { Alert } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "../services/firebase"
import type { Usuario } from "../types/types"

interface AuthContextType {
  user: Usuario | null
  firebaseUser: FirebaseUser | null
  login: (email: string, password: string) => Promise<boolean>
  register: (nome: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser)

      if (fbUser) {
        try {
          // Buscar dados do usuário no Firestore
          const userDoc = await getDoc(doc(db, "usuarios", fbUser.uid))

          if (userDoc.exists()) {
            const userData = userDoc.data() as Usuario
            setUser(userData)
            await AsyncStorage.setItem("user", JSON.stringify(userData))
          } else {
            // Criar novo usuário padrão
            const newUser: Usuario = {
              idUsuario: Date.now(),
              nome: fbUser.displayName || "Usuário",
              email: fbUser.email || "",
              nivelAcesso: "OPERADOR",
              status: "ATIVO",
              dataCriacao: new Date().toISOString(),
              dataAtualizacao: new Date().toISOString(),
            }
            await setDoc(doc(db, "usuarios", fbUser.uid), newUser)
            setUser(newUser)
            await AsyncStorage.setItem("user", JSON.stringify(newUser))
          }
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error)
        }
      } else {
        setUser(null)
        await AsyncStorage.removeItem("user")
      }

      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return true
    } catch (error: any) {
      console.error("Erro no login:", error)
      let msg = "Falha no login. Verifique suas credenciais."
      switch (error.code) {
        case "auth/user-not-found": msg = "Usuário não encontrado."; break
        case "auth/wrong-password": msg = "Senha incorreta."; break
        case "auth/invalid-email": msg = "Email inválido."; break
        case "auth/too-many-requests": msg = "Muitas tentativas. Tente mais tarde."; break
      }
      Alert.alert("Erro", msg)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (nome: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      const fbUser = credential.user

      const newUser: Usuario = {
        idUsuario: Date.now(),
        nome,
        email,
        nivelAcesso: "OPERADOR",
        status: "ATIVO",
        dataCriacao: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString(),
      }
      await setDoc(doc(db, "usuarios", fbUser.uid), newUser)
      return true
    } catch (error: any) {
      console.error("Erro no registro:", error)
      let msg = "Falha no registro. Tente novamente."
      switch (error.code) {
        case "auth/email-already-in-use": msg = "Email já em uso."; break
        case "auth/invalid-email": msg = "Email inválido."; break
        case "auth/weak-password": msg = "Senha deve ter pelo menos 6 caracteres."; break
      }
      Alert.alert("Erro", msg)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth)
      setUser(null)
      setFirebaseUser(null)
      await AsyncStorage.removeItem("user")
    } catch (error) {
      console.error("Erro no logout:", error)
      Alert.alert("Erro", "Falha ao fazer logout. Tente novamente.")
    }
  }

  return (
    <AuthContext.Provider value={{ user, firebaseUser, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider")
  return context
}
