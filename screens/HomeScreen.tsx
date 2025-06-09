"use client"

import { useState, useCallback } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import type { Alerta } from "../types/types"
import { apiService } from "../services/ApiService"
import { useAuth } from "../contexts/AuthContext"

export default function HomeScreen() {
  const navigation = useNavigation()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({
    drones: 0,
    dronesAtivos: 0,
    alertasAtivos: 0,
    sensoresAtivos: 0,
    areasRisco: 0,
  })
  const [recentAlerts, setRecentAlerts] = useState<Alerta[]>([])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Carregar dados em paralelo
      const [drones, alertas, sensores, areas] = await Promise.all([
        apiService.getDrones(),
        apiService.getAlertas(),
        apiService.getSensores(),
        apiService.getAreasRisco(),
      ])

      // Calcular estatísticas
      setStats({
        drones: drones.length,
        dronesAtivos: drones.filter((d) => d.status === "ATIVO").length,
        alertasAtivos: alertas.filter((a) => a.status === "ATIVO").length,
        sensoresAtivos: sensores.filter((s) => s.status === "ATIVO").length,
        areasRisco: areas.length,
      })

      // Pegar os 3 alertas mais recentes
      const sortedAlerts = alertas
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
      title: "Ver Drones",
      icon: "airplane",
      color: "#00b4d8",
      screen: "Drones",
    },
    {
      title: "Alertas",
      icon: "warning",
      color: "#ff6b6b",
      screen: "Alerts",
    },
    {
      title: "Sensores",
      icon: "radio",
      color: "#51cf66",
      screen: "Sensors",
    },
    {
      title: "Áreas de Risco",
      icon: "location",
      color: "#ffd43b",
      screen: "Areas",
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

  const getGravidadeColor = (gravidade: string) => {
    switch (gravidade) {
      case "ALTA":
        return "#ff6b6b"
      case "MEDIA":
        return "#ffd43b"
      case "BAIXA":
        return "#51cf66"
      default:
        return "#666"
    }
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <LinearGradient colors={["#00b4d8", "#0077b6"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Olá, {user?.nome || user?.email?.split("@")[0] || "Usuário"}!</Text>
            <Text style={styles.subtitle}>Sistema de Resgate com Drones</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate("ProfileScreen" as never)}>
            <Ionicons name="person-circle-outline" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderLeftColor: "#00b4d8" }]}>
            <Text style={styles.statNumber}>{stats.drones}</Text>
            <Text style={styles.statLabel}>Total Drones</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: "#51cf66" }]}>
            <Text style={styles.statNumber}>{stats.dronesAtivos}</Text>
            <Text style={styles.statLabel}>Drones Ativos</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderLeftColor: "#ff6b6b" }]}>
            <Text style={styles.statNumber}>{stats.alertasAtivos}</Text>
            <Text style={styles.statLabel}>Alertas Ativos</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: "#ffd43b" }]}>
            <Text style={styles.statNumber}>{stats.sensoresAtivos}</Text>
            <Text style={styles.statLabel}>Sensores Ativos</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen as never)}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                <Ionicons name={action.icon as any} size={24} color="white" />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Alerts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Alertas Recentes</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Alerts" as never)}>
            <Text style={styles.seeAllText}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {recentAlerts.length > 0 ? (
          recentAlerts.map((alert) => (
            <View key={alert.idAlerta} style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <View style={styles.alertLeft}>
                  <View style={[styles.alertIcon, { backgroundColor: getGravidadeColor(alert.gravidade) }]}>
                    <Ionicons name="warning" size={16} color="white" />
                  </View>
                  <View style={styles.alertInfo}>
                    <Text style={styles.alertTitle}>{alert.tipoAlerta}</Text>
                    <Text style={styles.alertDescription} numberOfLines={1}>
                      {alert.descricao}
                    </Text>
                    <Text style={styles.alertLocation}>{alert.area?.nomeArea || "Área não especificada"}</Text>
                  </View>
                </View>
                <View style={styles.alertRight}>
                  <Text style={styles.alertTime}>{formatDate(alert.dataHora)}</Text>
                  <Text style={[styles.alertGravidade, { color: getGravidadeColor(alert.gravidade) }]}>
                    {alert.gravidade}
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={48} color="#51cf66" />
            <Text style={styles.emptyText}>Nenhum alerta recente</Text>
          </View>
        )}
      </View>

      {/* System Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status do Sistema</Text>
        <View style={styles.statusCard}>
          <View style={styles.statusItem}>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: "#51cf66" }]} />
              <Text style={styles.statusText}>Sistema Operacional</Text>
            </View>
            <Ionicons name="checkmark-circle" size={20} color="#51cf66" />
          </View>

          <View style={styles.statusItem}>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: "#51cf66" }]} />
              <Text style={styles.statusText}>Conexão API</Text>
            </View>
            <Ionicons name="checkmark-circle" size={20} color="#51cf66" />
          </View>

          <View style={styles.statusItem}>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: stats.areasRisco > 0 ? "#ffd43b" : "#51cf66" }]} />
              <Text style={styles.statusText}>Áreas de Risco: {stats.areasRisco}</Text>
            </View>
            <Ionicons
              name={stats.areasRisco > 0 ? "warning" : "checkmark-circle"}
              size={20}
              color={stats.areasRisco > 0 ? "#ffd43b" : "#51cf66"}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
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
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
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
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
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
    width: "48%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
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
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  alertLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    marginRight: 12,
  },
  alertIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  alertDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  alertLocation: {
    fontSize: 12,
    color: "#999",
  },
  alertRight: {
    alignItems: "flex-end",
  },
  alertTime: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  alertGravidade: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
  },
  statusCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 30,
  },
  statusItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  statusText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
})
