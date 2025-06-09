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
import type { AreaRisco } from "../types/types"
import { apiService } from "../services/ApiService"

export default function AreasRiscoScreen() {
  const [areas, setAreas] = useState<AreaRisco[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("all")

  const loadAreas = async () => {
    try {
      setLoading(true)
      const areasData = await apiService.getAreasRisco()
      setAreas(areasData)
    } catch (error) {
      console.error("Erro ao carregar áreas de risco:", error)
      Alert.alert("Erro", "Não foi possível carregar as áreas de risco")
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadAreas()
    setRefreshing(false)
  }

  useFocusEffect(
    useCallback(() => {
      loadAreas()
    }, []),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ATIVA":
        return "#10b981"
      case "INATIVA":
        return "#6c757d"
      case "MONITORAMENTO":
        return "#f59e0b"
      case "EMERGENCIA":
        return "#ef4444"
      default:
        return "#6c757d"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "ATIVA":
        return "Ativa"
      case "INATIVA":
        return "Inativa"
      case "MONITORAMENTO":
        return "Monitoramento"
      case "EMERGENCIA":
        return "Emergência"
      default:
        return status || "Ativa"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ATIVA":
        return "checkmark-circle"
      case "INATIVA":
        return "close-circle"
      case "MONITORAMENTO":
        return "eye"
      case "EMERGENCIA":
        return "warning"
      default:
        return "shield"
    }
  }

  const filteredAreas = areas.filter((area) => {
    const matchesSearch =
      area.nomeArea?.toLowerCase().includes(searchText.toLowerCase()) ||
      area.descricao?.toLowerCase().includes(searchText.toLowerCase())
    const matchesFilter = selectedFilter === "all" || (area.status || "ATIVA") === selectedFilter
    return matchesSearch && matchesFilter
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR")
  }

  const renderAreaCard = ({ item }: { item: AreaRisco }) => {
    const status = item.status || "ATIVA"
    return (
      <TouchableOpacity style={styles.areaCard}>
        <View style={styles.areaHeader}>
          <View style={styles.areaLeft}>
            <View style={[styles.areaIcon, { backgroundColor: getStatusColor(status) }]}>
              <Ionicons name={getStatusIcon(status) as any} size={20} color="white" />
            </View>
            <View style={styles.areaInfo}>
              <Text style={styles.areaName}>{item.nomeArea}</Text>
              <Text style={styles.areaId}>ID: {item.idArea}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
            <Text style={styles.statusText}>{getStatusText(status)}</Text>
          </View>
        </View>

        <Text style={styles.areaDescription} numberOfLines={2}>
          {item.descricao || "Sem descrição"}
        </Text>

        <View style={styles.areaDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              Coordenadas:{" "}
              {item.latitude && item.longitude
                ? `${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}`
                : "Não definidas"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="resize-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              Raio: {item.raioCobertura ? `${item.raioCobertura}m` : "Não definido"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.detailText}>Cadastro: {item.dataCadastro ? formatDate(item.dataCadastro) : "N/A"}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Carregando áreas de risco...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#00b4d8", "#0077b6"]} style={styles.header}>
        <Text style={styles.headerTitle}>Áreas de Risco</Text>
        <Text style={styles.headerSubtitle}>{filteredAreas.length} áreas encontradas</Text>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { borderLeftColor: "#00b4d8" }]}>
          <Text style={styles.statNumber}>{areas.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: "#10b981" }]}>
          <Text style={styles.statNumber}>{areas.filter((a) => (a.status || "ATIVA") === "ATIVA").length}</Text>
          <Text style={styles.statLabel}>Ativas</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: "#f59e0b" }]}>
          <Text style={styles.statNumber}>{areas.filter((a) => (a.status || "ATIVA") === "MONITORAMENTO").length}</Text>
          <Text style={styles.statLabel}>Monitoramento</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: "#ef4444" }]}>
          <Text style={styles.statNumber}>{areas.filter((a) => (a.status || "ATIVA") === "EMERGENCIA").length}</Text>
          <Text style={styles.statLabel}>Emergência</Text>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar áreas..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
          <Ionicons name="filter-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Areas List */}
      <FlatList
        data={filteredAreas}
        renderItem={renderAreaCard}
        keyExtractor={(item) => item.idArea.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="warning-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Nenhuma área de risco encontrada</Text>
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

            {["all", "ATIVA", "INATIVA", "MONITORAMENTO", "EMERGENCIA"].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterOption, selectedFilter === filter && styles.selectedFilter]}
                onPress={() => {
                  setSelectedFilter(filter)
                  setFilterModalVisible(false)
                }}
              >
                <Text style={[styles.filterOptionText, selectedFilter === filter && styles.selectedFilterText]}>
                  {filter === "all" ? "Todas" : getStatusText(filter)}
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
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 10,
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
  areaCard: {
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
  areaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  areaLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  areaIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  areaInfo: {
    flex: 1,
  },
  areaName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  areaId: {
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
  areaDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  areaDetails: {
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
    flex: 1,
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
