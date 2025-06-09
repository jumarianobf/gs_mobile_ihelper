"use client"

import { useState, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  RefreshControl,
  Alert,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect } from "@react-navigation/native"
import { apiService } from "../services/ApiService"
import type { Sensor } from "../types/types"

export default function SensorsScreen() {
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("all")

  const loadSensors = async () => {
    try {
      setLoading(true)
      const sensorsData = await apiService.getSensores()
      setSensors(sensorsData)
    } catch (error) {
      console.error("Erro ao carregar sensores:", error)
      Alert.alert("Erro", "Não foi possível carregar os sensores")
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadSensors()
    setRefreshing(false)
  }

  useFocusEffect(
    useCallback(() => {
      loadSensors()
    }, []),
  )

  const getSensorIcon = (tipoSensor: string) => {
    switch (tipoSensor?.toLowerCase()) {
      case "temperatura":
        return "thermometer"
      case "umidade":
        return "water"
      case "pressao":
        return "speedometer"
      case "movimento":
        return "walk"
      case "proximidade":
        return "scan"
      default:
        return "radio"
    }
  }

  const getSensorColor = (tipoSensor: string) => {
    switch (tipoSensor?.toLowerCase()) {
      case "temperatura":
        return "#ef4444"
      case "umidade":
        return "#3b82f6"
      case "pressao":
        return "#8b5cf6"
      case "movimento":
        return "#ec4899"
      case "proximidade":
        return "#84cc16"
      default:
        return "#6b7280"
    }
  }

  const getStatusColor = (status: string) => {
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

  const getStatusText = (status: string) => {
    switch (status) {
      case "ATIVO":
        return "Ativo"
      case "INATIVO":
        return "Inativo"
      case "MANUTENCAO":
        return "Manutenção"
      default:
        return status
    }
  }

  const filteredSensors = sensors.filter((sensor) => {
    const matchesSearch =
      sensor.tipoSensor?.toLowerCase().includes(searchText.toLowerCase()) ||
      sensor.descricao?.toLowerCase().includes(searchText.toLowerCase())
    const matchesFilter = selectedFilter === "all" || sensor.status === selectedFilter
    return matchesSearch && matchesFilter
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR")
  }

  const renderSensorCard = ({ item }: { item: Sensor }) => (
    <TouchableOpacity style={styles.sensorCard}>
      <View style={styles.sensorHeader}>
        <View style={styles.sensorLeft}>
          <View style={[styles.sensorIcon, { backgroundColor: getSensorColor(item.tipoSensor) }]}>
            <Ionicons name={getSensorIcon(item.tipoSensor) as any} size={20} color="white" />
          </View>
          <View style={styles.sensorInfo}>
            <Text style={styles.sensorType}>{item.tipoSensor || "Sensor"}</Text>
            <Text style={styles.sensorId}>ID: {item.idSensor}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <Text style={styles.sensorDescription} numberOfLines={2}>
        {item.descricao || "Sem descrição"}
      </Text>

      <View style={styles.sensorDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="speedometer-outline" size={16} color="#666" />
          <Text style={styles.detailText}>Unidade: {item.unidadeMedida || "N/A"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            Instalação: {item.dataInstalacao ? formatDate(item.dataInstalacao) : "N/A"}
          </Text>
        </View>
        {item.area && (
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.detailText}>Área: {item.area.nomeArea}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Carregando sensores...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#00b4d8", "#0077b6"]} style={styles.header}>
        <Text style={styles.headerTitle}>Sensores IoT</Text>
        <Text style={styles.headerSubtitle}>{filteredSensors.length} sensores encontrados</Text>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { borderLeftColor: "#00b4d8" }]}>
          <Text style={styles.statNumber}>{sensors.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: "#10b981" }]}>
          <Text style={styles.statNumber}>{sensors.filter((s) => s.status === "ATIVO").length}</Text>
          <Text style={styles.statLabel}>Ativos</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: "#f59e0b" }]}>
          <Text style={styles.statNumber}>{sensors.filter((s) => s.status === "MANUTENCAO").length}</Text>
          <Text style={styles.statLabel}>Manutenção</Text>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar sensores..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
          <Ionicons name="filter-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Sensors List */}
      <FlatList
        data={filteredSensors}
        renderItem={renderSensorCard}
        keyExtractor={(item) => item.idSensor.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="radio-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum sensor encontrado</Text>
          </View>
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtrar por Status</Text>

            {["all", "ATIVO", "INATIVO", "MANUTENCAO"].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterOption, selectedFilter === filter && styles.selectedFilter]}
                onPress={() => {
                  setSelectedFilter(filter)
                  setFilterModalVisible(false)
                }}
              >
                <Text style={[styles.filterOptionText, selectedFilter === filter && styles.selectedFilterText]}>
                  {filter === "all" ? "Todos" : getStatusText(filter)}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.closeButton} onPress={() => setFilterModalVisible(false)}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f5ff",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: 48,
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#00b4d8",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sensorCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sensorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  sensorLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sensorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sensorInfo: {
    flex: 1,
  },
  sensorType: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  sensorId: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  sensorDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  sensorDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  filterOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#f8f9fa",
  },
  selectedFilter: {
    backgroundColor: "#00b4d8",
  },
  filterOptionText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  selectedFilterText: {
    color: "white",
    fontWeight: "600",
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    fontWeight: "600",
  },
})
