"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { apiService } from "../services/ApiService"



const AlertsScreen = () => {
  const navigation = useNavigation()
  const [alerts, setAlerts] = useState<Alerta[]>([])
  const [searchText, setSearchText] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")

 useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await apiService.getAlertas()
        setAlerts(data)
      } catch (error) {
        console.error("Erro ao carregar alertas:", error)
        Alert.alert("Erro", "Não foi possível carregar os alertas")
      } finally {
        setLoading(false)
      }
    }

    loadAlerts()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "#ef4444"
      case "pendente":
        return "#f59e0b"
      case "concluido":
        return "#10b981"
      default:
        return "#6c757d"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "ativo":
        return "Ativo"
      case "pendente":
        return "Pendente"
      case "concluido":
        return "Concluído"
      default:
        return "Desconhecido"
    }
  }

  const getPriorityColor = (gravidade: string) => {
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

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.tipoAlerta?.toLowerCase().includes(searchText.toLowerCase()) ||
      alert.descricao?.toLowerCase().includes(searchText.toLowerCase()) ||
      alert.area.nomeArea?.toLowerCase().includes(searchText.toLowerCase())
    const matchesFilter = selectedFilter === "all" || alert.gravidade === selectedFilter
    return matchesSearch && matchesFilter
  })

  const renderAlertCard = ({ item }: { item: Alerta }) => (
    <TouchableOpacity style={styles.alertCard}>
      <View style={styles.alertHeader}>
        <View style={styles.alertLeft}>
          <View style={[styles.alertIcon, { backgroundColor: getPriorityColor(item.gravidade) }]}>
            <Ionicons name="warning" size={20} color="white" />
          </View>
          <View style={styles.alertInfo}>
            <Text style={styles.alertTitle}>{item.tipoAlerta}</Text>
            <Text style={styles.alertId}>ID: {item.idAlerta}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <Text style={styles.alertDescription} numberOfLines={2}>
        {item.descricao}
      </Text>

      <View style={styles.alertDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.detailText}>Área: {item.area.nomeArea}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>Data: {formatDate(item.dataHora)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="alert-circle-outline" size={16} color="#666" />
          <Text style={styles.detailText}>Gravidade: {item.gravidade}</Text>
        </View>
        {item.drone && (
          <View style={styles.detailRow}>
            <Ionicons name="airplane-outline" size={16} color="#666" />
            <Text style={styles.detailText}>Drone: {item.drone.nome}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Alertas</Text>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar alertas..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <View style={styles.filterBar}>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === "all" && styles.filterButtonActive]}
            onPress={() => setSelectedFilter("all")}
          >
            <Text style={[styles.filterText, selectedFilter === "all" && styles.filterTextActive]}>Todos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === "ALTA" && styles.filterButtonActive]}
            onPress={() => setSelectedFilter("ALTA")}
          >
            <Text style={[styles.filterText, selectedFilter === "ALTA" && styles.filterTextActive]}>Alta</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === "MEDIA" && styles.filterButtonActive]}
            onPress={() => setSelectedFilter("MEDIA")}
          >
            <Text style={[styles.filterText, selectedFilter === "MEDIA" && styles.filterTextActive]}>Média</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === "BAIXA" && styles.filterButtonActive]}
            onPress={() => setSelectedFilter("BAIXA")}
          >
            <Text style={[styles.filterText, selectedFilter === "BAIXA" && styles.filterTextActive]}>Baixa</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredAlerts}
          renderItem={renderAlertCard}
          keyExtractor={(item) => item.idAlerta}
          contentContainerStyle={styles.alertList}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f4f4f4",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: 40,
  },
  filterBar: {
    flexDirection: "row",
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#ddd",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#3498db",
  },
  filterText: {
    fontSize: 14,
    color: "#555",
  },
  filterTextActive: {
    color: "white",
  },
  alertList: {
    paddingBottom: 16,
  },
  alertCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  alertLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  alertIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  alertInfo: {
    flexDirection: "column",
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  alertId: {
    fontSize: 12,
    color: "#777",
  },
  statusBadge: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  alertDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  alertDetails: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
})

export default AlertsScreen
