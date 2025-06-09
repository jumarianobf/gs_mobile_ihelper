"use client"

import { useState, useCallback } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { FontAwesome, Ionicons } from "@expo/vector-icons"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { apiService } from "../services/ApiService"
import type { Drone, AreaRisco, Alerta } from "../types/types"
import { useAuth } from "../contexts/AuthContext"

const { width } = Dimensions.get("window")

export default function DashboardScreen() {
  const navigation = useNavigation()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({
    totalMissoes: 0,
    missoesConcluidas: 0,
    dronesManutencao: 0,
    dronesAtivos: 0,
  })
  const [drones, setDrones] = useState<Drone[]>([])
  const [areasRisco, setAreasRisco] = useState<AreaRisco[]>([])
  const [recentAlerts, setRecentAlerts] = useState<Alerta[]>([])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      const [dronesData, areasData, alertasData] = await Promise.all([
        apiService.getDrones(),
        apiService.getAreasRisco(),
        apiService.getAlertas(),
      ])

      setDrones(dronesData)
      setAreasRisco(areasData)


      setStats({
        totalMissoes: dronesData.length * 5, // Simulado
        missoesConcluidas: dronesData.filter((d) => d.status === "ATIVO").length * 3,
        dronesManutencao: dronesData.filter((d) => d.status === "MANUTENCAO").length,
        dronesAtivos: dronesData.filter((d) => d.status === "ATIVO").length,
      })

      // Alertas recentes ordenados por dataHora
      const sortedAlerts = alertasData
        .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime())
        .slice(0, 3)
      setRecentAlerts(sortedAlerts)
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
  }

  useFocusEffect(
    useCallback(() => {
      loadDashboardData()
    }, []),
  )

  const quickActions = [
    {
      title: "Controlar Drones",
      icon: "airplane",
      color: "#00b4d8",
      screen: "Drones",
    },
    {
      title: "Ver Mapa",
      icon: "map",
      color: "#10b981",
      screen: "Map",
    },
    {
      title: "Áreas de Risco",
      icon: "warning",
      color: "#ef4444",
      screen: "AreasRisco",
    },
    {
      title: "Sensores",
      icon: "radio",
      color: "#f59e0b",
      screen: "Sensores",
    },
  ]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <LinearGradient colors={["#00b4d8", "#0077b6"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Dashboard</Text>
            <Text style={styles.subtitle}>Monitoramento em tempo real - iHelperDrone</Text>
          </View>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderLeftColor: "#00b4d8" }]}>
            <View style={[styles.statIcon, { backgroundColor: "#00b4d8" }]}>
                <FontAwesome name="crosshairs" size={24} color="white" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>{stats.totalMissoes}</Text>
              <Text style={styles.statLabel}>Total de Missões</Text>
            </View>
          </View>
          <View style={[styles.statCard, { borderLeftColor: "#10b981" }]}>
            <View style={[styles.statIcon, { backgroundColor: "#10b981" }]}>
              <Ionicons name="checkmark-circle" size={24} color="white" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>{stats.missoesConcluidas}</Text>
              <Text style={styles.statLabel}>Missões Concluídas</Text>
            </View>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderLeftColor: "#ef4444" }]}>
            <View style={[styles.statIcon, { backgroundColor: "#ef4444" }]}>
              <Ionicons name="construct" size={24} color="white" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>{stats.dronesManutencao}</Text>
              <Text style={styles.statLabel}>Manutenções Pendentes</Text>
            </View>
          </View>
          <View style={[styles.statCard, { borderLeftColor: "#ffd60a" }]}>
            <View style={[styles.statIcon, { backgroundColor: "#ffd60a" }]}>
              <Ionicons name="airplane" size={24} color="white" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>{stats.dronesAtivos}</Text>
              <Text style={styles.statLabel}>Drones em Campo</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Controles Rápidos</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen as never)}
            >
              <LinearGradient colors={[action.color, action.color + "CC"]} style={styles.actionGradient}>
                <Ionicons name={action.icon as any} size={28} color="white" />
                <Text style={styles.actionTitle}>{action.title}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Drones Status */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Status dos Drones</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Drones" as never)}>
            <Text style={styles.seeAllText}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {drones.slice(0, 3).map((drone) => (
          <View key={drone.idDrone} style={styles.droneCard}>
            <View style={styles.droneHeader}>
              <View style={styles.droneLeft}>
                <View style={[styles.droneIcon, { backgroundColor: getStatusColor(drone.status) }]}>
                  <Ionicons name="airplane" size={16} color="white" />
                </View>
                <View style={styles.droneInfo}>
                  <Text style={styles.droneName}>{drone.nome}</Text>
                  <Text style={styles.droneModel}>{drone.modelo}</Text>
                </View>
              </View>
              <View style={styles.droneRight}>
                <Text style={styles.batteryText}>{drone.bateria}%</Text>
                <View style={styles.batteryBar}>
                  <View
                    style={[
                        styles.batteryFill,
                        {
                        width: `${drone.bateria ?? 0}%`,        // se undefined, usa 0%
                        backgroundColor: getBatteryColor(drone.bateria),
                        },
                    ]}
                    />
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Areas de Risco */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Áreas de Risco</Text>
          <TouchableOpacity onPress={() => navigation.navigate("AreasRisco" as never)}>
            <Text style={styles.seeAllText}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {areasRisco.slice(0, 3).map((area) => (
          <View key={area.idArea} style={styles.areaCard}>
            <View style={styles.areaLeft}>
              <View style={[styles.areaIcon, { backgroundColor: getAreaStatusColor(area.status) }]}>
                <Ionicons name="warning" size={16} color="white" />
              </View>
              <View style={styles.areaInfo}>
                <Text style={styles.areaName}>{area.nomeArea}</Text>
                <Text style={styles.areaStatus}>{area.status || "ATIVA"}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </View>
        ))}
      </View>

      {/* Recent Alerts */}
      {recentAlerts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Alertas Recentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Alerts" as never)}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {recentAlerts.map((alert) => (
            <View key={alert.idAlerta} style={styles.alertCard}>
              <View style={styles.alertLeft}>
                <View style={[styles.alertIcon, { backgroundColor: getPriorityColor(alert.gravidade) }]}>
                  <Ionicons name="warning" size={16} color="white" />
                </View>
                <View style={styles.alertInfo}>
                  <Text style={styles.alertTitle}>{alert.tipoAlerta}</Text>
                  <Text style={styles.alertLocation}>{alert.area.nomeArea}</Text>
                </View>
              </View>
              <Text style={styles.alertTime}>{formatDate(alert.dataHora)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Map Preview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mapa de Operações</Text>
        <TouchableOpacity style={styles.mapPreview} onPress={() => navigation.navigate("Map" as never)}>
          <LinearGradient colors={["rgba(0, 180, 216, 0.1)", "rgba(0, 119, 182, 0.1)"]} style={styles.mapGradient}>
            <Ionicons name="map-outline" size={48} color="#00b4d8" />
            <Text style={styles.mapText}>Ver Mapa Completo</Text>
            <Text style={styles.mapSubtext}>
              {drones.length} drones • {areasRisco.length} áreas
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )

  function getStatusColor(status: string) {
    switch (status) {
      case "ATIVO":
        return "#10b981"
      case "INATIVO":
        return "#ef4444"
      case "MANUTENCAO":
        return "#f59e0b"
      default:
        return "#6c757d"
    }
  }

  function getBatteryColor(battery: number) {
    if (battery > 60) return "#10b981"
    if (battery > 30) return "#ffd60a"
    return "#ef4444"
  }

  function getAreaStatusColor(status: string) {
    switch (status) {
      case "EMERGENCIA":
        return "#ef4444"
      case "MONITORAMENTO":
        return "#f59e0b"
      case "ATIVA":
        return "#10b981"
      default:
        return "#6c757d"
    }
  }

  function getPriorityColor(gravidade: string) {
    switch (gravidade?.toUpperCase()) {
      case "ALTA":
        return "#ef4444"
      case "MEDIA":
        return "#f59e0b"
      case "BAIXA":
        return "#10b981"
      default:
        return "#6c757d"
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f5ff",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: -15,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  seeAllText: {
    fontSize: 14,
    color: "#00b4d8",
    fontWeight: "600",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: (width - 60) / 2,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionGradient: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  actionTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  droneCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  droneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  droneLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  droneIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  droneInfo: {
    flex: 1,
  },
  droneName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  droneModel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  droneRight: {
    alignItems: "flex-end",
  },
  batteryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  batteryBar: {
    width: 60,
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    overflow: "hidden",
  },
  batteryFill: {
    height: "100%",
    borderRadius: 2,
  },
  areaCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  areaLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  areaIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  areaInfo: {
    flex: 1,
  },
  areaName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  areaStatus: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  alertCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alertLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  alertIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  alertLocation: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  alertTime: {
    fontSize: 12,
    color: "#999",
  },
  mapPreview: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 30,
  },
  mapGradient: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  mapText: {
    fontSize: 16,
    color: "#00b4d8",
    fontWeight: "600",
    marginTop: 8,
  },
  mapSubtext: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
})
