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
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { apiService } from "../services/ApiService"
import type { Drone } from "../types/types"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { DronesStackParamList } from "../navigation/AppNavigator"

// Tipagem correta para navegação do stack de drones
type DronesScreenNavigationProp = StackNavigationProp<DronesStackParamList, "DronesList">

export default function DronesScreen() {
  const navigation = useNavigation<DronesScreenNavigationProp>()
  const [drones, setDrones] = useState<Drone[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("all")

  const loadDrones = async () => {
    try {
      setLoading(true)
      const dronesData = await apiService.getDrones()
      setDrones(dronesData)
    } catch (error) {
      console.error("Erro ao carregar drones:", error)
      // Usar dados mockados se a API falhar
      setDrones([
        {
          idDrone: 1,
          nome: "Drone Resgate 01",
          modelo: "DJI Mavic Pro",
          status: "ATIVO",
          latitude: -23.5505,
          longitude: -46.6333,
          bateria: 85,
          capacidadeCarga: 5.0,
          dataUltimaManutencao: "2024-01-15T10:30:00",
          horarioOperacao: "08:00 - 18:00",
          dataCadastro: "2024-01-01T00:00:00",
        },
        {
          idDrone: 2,
          nome: "Drone Resgate 02",
          modelo: "DJI Phantom 4",
          status: "MANUTENCAO",
          latitude: -23.5615,
          longitude: -46.6565,
          bateria: 45,
          capacidadeCarga: 3.5,
          dataUltimaManutencao: "2024-01-10T14:20:00",
          horarioOperacao: "06:00 - 20:00",
          dataCadastro: "2024-01-02T00:00:00",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadDrones()
    setRefreshing(false)
  }

  useFocusEffect(
    useCallback(() => {
      loadDrones()
    }, []),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ATIVO":
        return "#51cf66"
      case "INATIVO":
        return "#ffd43b"
      case "MANUTENCAO":
        return "#ff6b6b"
      default:
        return "#666"
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

  const getBatteryColor = (battery: number) => {
    if (battery > 60) return "#51cf66"
    if (battery > 30) return "#ffd43b"
    return "#ff6b6b"
  }

  const filteredDrones = drones.filter((drone) => {
    const matchesSearch =
      drone.nome.toLowerCase().includes(searchText.toLowerCase()) ||
      drone.modelo.toLowerCase().includes(searchText.toLowerCase())
    const matchesFilter = selectedFilter === "all" || drone.status === selectedFilter
    return matchesSearch && matchesFilter
  })

  const formatLocation = (lat?: number, lng?: number) => {
    if (!lat || !lng) return "Localização não disponível"
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  }

  const handleDeleteDrone = async (idDrone: number) => {
    Alert.alert("Confirmar", "Deseja realmente apagar este drone?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Apagar",
        onPress: async () => {
          try {
            await apiService.deleteDrone(idDrone)
            await loadDrones()
            Alert.alert("Sucesso", "Drone apagado com sucesso!")
          } catch (error) {
            Alert.alert("Erro", "Não foi possível apagar o drone")
          }
        },
      },
    ])
  }

  const handleEditDrone = (drone: Drone) => {
    navigation.navigate("DroneForm", { drone })
  }

  const handleAddDrone = () => {
    navigation.navigate("DroneForm", {})
  }

  const renderDroneCard = ({ item }: { item: Drone }) => (
    <TouchableOpacity style={styles.droneCard} onPress={() => navigation.navigate("DroneDetail", { drone: item })}>
      <View style={styles.droneHeader}>
        <View style={styles.droneInfo}>
          <Text style={styles.droneName}>{item.nome}</Text>
          <Text style={styles.droneModel}>{item.modelo}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.droneDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="battery-half-outline" size={16} color={getBatteryColor(item.bateria)} />
          <Text style={styles.detailText}>Bateria: {item.bateria}%</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{formatLocation(item.latitude, item.longitude)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>Horário: {item.horarioOperacao}</Text>
        </View>
      </View>

      <View style={styles.batteryBar}>
        <View style={styles.batteryBackground}>
          <View
            style={[
              styles.batteryFill,
              {
                width: `${item.bateria}%`,
                backgroundColor: getBatteryColor(item.bateria),
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleEditDrone(item)}>
          <Ionicons name="pencil" size={16} color="#fff" />
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteDrone(item.idDrone)}
        >
          <Ionicons name="trash" size={16} color="#fff" />
          <Text style={styles.buttonText}>Apagar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Carregando drones...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#00b4d8", "#0077b6"]} style={styles.header}>
        <Text style={styles.headerTitle}>Drones</Text>
        <Text style={styles.headerSubtitle}>{filteredDrones.length} drones encontrados</Text>
      </LinearGradient>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar drones..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
          <Ionicons name="filter-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Drones List */}
      <FlatList
        data={filteredDrones}
        renderItem={renderDroneCard}
        keyExtractor={(item) => item.idDrone.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="airplane-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum drone encontrado</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddDrone}>
              <Text style={styles.emptyButtonText}>Adicionar Primeiro Drone</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddDrone}>
        <LinearGradient colors={["#00b4d8", "#0077b6"]} style={styles.addGradient}>
          <Ionicons name="add" size={24} color="white" />
        </LinearGradient>
      </TouchableOpacity>

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

const additionalStyles = StyleSheet.create({
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
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
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: "#00b4d8",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  editButton: {
    backgroundColor: "#00b4d8",
  },
  deleteButton: {
    backgroundColor: "#ff6b6b",
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
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
  droneCard: {
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
  droneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  droneInfo: {
    flex: 1,
  },
  droneName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  droneModel: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  droneDetails: {
    gap: 8,
    marginBottom: 16,
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
  batteryBar: {
    marginTop: 8,
  },
  batteryBackground: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
  },
  batteryFill: {
    height: "100%",
    borderRadius: 3,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
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
  ...additionalStyles,
})
