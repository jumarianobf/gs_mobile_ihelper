// screens/ProfileScreen.tsx
"use client"

import React, { useState, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useFocusEffect, useNavigation } from "@react-navigation/native"

import type { Usuario } from "../types/types"
import { apiService } from "../services/ApiService"
import { useAuth } from "../contexts/AuthContext"  // 👉 importe o hook

export default function ProfileScreen() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const { logout } = useAuth()                      
  const navigation = useNavigation()

  const handleLogout = () => {
    Alert.alert("Sair", "Tem certeza que deseja sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          try {
            await logout()  
          } catch (err) {
            console.error("Erro no logout:", err)
          }
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          })
        },
      },
    ])
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—"
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR })
    } catch {
      return "—"
    }
  }

  const loadUsuario = async () => {
    try {
      const lista = await apiService.getUsuarios()
      if (lista.length > 0) setUsuario(lista[0])
    } catch (err) {
      console.error("Erro ao carregar usuário:", err)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadUsuario()
    setRefreshing(false)
  }

  useFocusEffect(
    useCallback(() => {
      loadUsuario()
    }, [])
  )

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <LinearGradient colors={["#00b4d8", "#0077b6"]} style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {usuario?.nome?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
          <Text style={styles.userName}>{usuario?.nome || "—"}</Text>
          <Text style={styles.userEmail}>{usuario?.email || "—"}</Text>
          <Text style={styles.userStatus}>
            {usuario?.nivelAcesso} • {usuario?.status}
          </Text>
        </View>
      </LinearGradient>

      {/* Informações do usuário */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Informações do Usuário</Text>
        <View style={styles.infoCard}>
          <InfoRow label="ID" value={usuario?.idUsuario.toString()} />
          <InfoRow label="Nome" value={usuario?.nome} />
          <InfoRow label="Email" value={usuario?.email} />
          <InfoRow label="Nível de Acesso" value={usuario?.nivelAcesso} />
          <InfoRow label="Status" value={usuario?.status} />
          <InfoRow label="Data de Criação" value={formatDate(usuario?.dataCriacao)} />
          <InfoRow label="Última Atualização" value={formatDate(usuario?.dataAtualizacao)} />
        </View>
      </View>

      {/* Botão de sair */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ff4d4d" />
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "—"}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: { paddingTop: 50, paddingBottom: 40, alignItems: "center" },
  profileInfo: { alignItems: "center" },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "white",
  },
  avatarText: { fontSize: 32, fontWeight: "bold", color: "white" },
  userName: { fontSize: 24, fontWeight: "bold", color: "white", marginBottom: 4 },
  userEmail: { fontSize: 16, color: "rgba(255,255,255,0.8)", marginBottom: 8 },
  userStatus: {
    fontSize: 12,
    color: "white",
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  infoContainer: { padding: 20, marginTop: 20 },
  infoTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: { fontSize: 14, color: "#666" },
  infoValue: { fontSize: 14, fontWeight: "500", color: "#333" },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#ffe5e5",
  },
  logoutText: { marginLeft: 8, color: "#ff4d4d", fontWeight: "bold" },
})
