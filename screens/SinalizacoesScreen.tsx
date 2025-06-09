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

// Tipo para Sinalização (baseado no HTML)
interface Sinalizacao {
  idSinalizacao: number
  tipoSinalizacao: string
  descricao: string
  status: "ativo" | "inativo" | "manutencao"
  dataInstalacao: string
  area?: {
    idArea: number
    nomeArea: string
  }
}

export default function SinalizacoesScreen() {
  const [sinalizacoes, setSinalizacoes] = useState<Sinalizacao[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("all")

  const loadSinalizacoes = async () => {
    try {
      setLoading(true)
      const data = await apiService.getSinalizacoes()
      setSinalizacoes(data)
    } catch (error) {
      console.error("Erro ao carregar sinalizações:", error)
      Alert.alert("Erro", "Não foi possível carregar as sinalizações")
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadSinalizacoes()
    setRefreshing(false)
  }

  useFocusEffect(
    useCallback(() => {
      loadSinalizacoes()
    }, []),
  )

  const getSinalizacaoIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case "placa de alerta":
        return "warning"
      case "semáforo":
        return "traffic-light"
      case "cone de sinalização":
        return "triangle"
      case "sinalização luminosa":
        return "bulb"
      case "barreira de proteção":
        return "shield"
      case "faixa refletiva":
        return "eye"
      default:
        return "alert-circle"
    }
  }

  const getSinalizacaoColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case "placa de alerta":
        return "#ef4444"
      case "semáforo":
        return
      case "placa de alerta":
        return "#ef4444"
      case "semáforo":
        return "#ffd60a"
      case "cone de sinalização":
        return "#f59e0b"
      case "sinalização luminosa":
        return "#3b82f6"
      case "barreira de proteção":
        return "#10b981"
      case "faixa refletiva":
        return "#8b5cf6"
      default:
        return "#6b7280"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "#10b981"
      case "inativo":
        return "#ef4444"
      case "manutencao":
        return "#f59e0b"
      default:
        return "#6c757d"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "ativo":
        return "Ativo"
      case "inativo":
        return "Inativo"
      case "manutencao":
        return "Manutenção"
      default:
        return status
    }
  }

  const filteredSinalizacoes = sinalizacoes.filter((sinalizacao) => {
    const matchesSearch =
      sinalizacao.tipoSinalizacao?.toLowerCase().includes(searchText.toLowerCase()) ||
      sinalizacao.descricao?.toLowerCase().includes(searchText.toLowerCase())
    const matchesFilter = selectedFilter === "all" || sinalizacao.status === selectedFilter
    return matchesSearch && matchesFilter
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR")
  }

  const renderSinalizacaoCard = ({ item }: { item: Sinalizacao }) => (
    <TouchableOpacity style={styles.sinalizacaoCard}>
      <View style={styles.sinalizacaoHeader}>
        <View style={styles.sinalizacaoLeft}>
          <View style={[styles.sinalizacaoIcon, { backgroundColor: getSinalizacaoColor(item.tipoSinalizacao) }]}>
            <Ionicons name={getSinalizacaoIcon(item.tipoSinalizacao) as any} size={20} color="white" />
          </View>
          <View style={styles.sinalizacaoInfo}>
            <Text style={styles.sinalizacaoType}>{item.tipoSinalizacao}</Text>
            <Text style={styles.sinalizacaoId}>ID: {item.idSinalizacao}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <Text style={styles.sinalizacaoDescription} numberOfLines={2}>
        {item.descricao}
      </Text>

      <View style={styles.sinalizacaoDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.detailText}>Área: {item.area?.nomeArea || "N/A"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>Instalação: {formatDate(item.dataInstalacao)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Carregando sinalizações...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#00b4d8", "#0077b6"]} style={styles.header}>
        <Text style={styles.headerTitle}>Sinalizações</Text>
        <Text style={styles.headerSubtitle}>{filteredSinalizacoes.length} sinalizações encontradas</Text>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { borderLeftColor: "#00b4d8" }]}>
          <Text style={styles.statNumber}>{sinalizacoes.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: "#10b981" }]}>
          <Text style={styles.statNumber}>{sinalizacoes.filter((s) => s.status === "ativo").length}</Text>
          <Text style={styles.statLabel}>Ativas</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: "#f59e0b" }]}>
          <Text style={styles.statNumber}>{sinalizacoes.filter((s) => s.status === "manutencao").length}</Text>
          <Text style={styles.statLabel}>Manutenção</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: "#ef4444" }]}>
          <Text style={styles.statNumber}>{sinalizacoes.filter((s) => s.status === "inativo").length}</Text>
          <Text style={styles.statLabel}>Inativas</Text>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar sinalizações..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
          <Ionicons name="filter-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Sinalizações List */}
      <FlatList
        data={filteredSinalizacoes}
        renderItem={renderSinalizacaoCard}
        keyExtractor={(item) => item.idSinalizacao.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
            name={"traffic-light-outline" as any}
            size={64}
            color="#ccc"
            />

            <Text style={styles.emptyText}>Nenhuma sinalização encontrada</Text>
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

            {["all", "ativo", "inativo", "manutencao"].map((filter) => (
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
  sinalizacaoCard: {
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
  sinalizacaoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  sinalizacaoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sinalizacaoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sinalizacaoInfo: {
    flex: 1,
  },
  sinalizacaoType: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  sinalizacaoId: {
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
  sinalizacaoDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  sinalizacaoDetails: {
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
