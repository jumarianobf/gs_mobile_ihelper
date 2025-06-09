import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const { width } = Dimensions.get("window")

export default function DroneDetailScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { drone } = route.params as any

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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR })
    } catch (e) {
      return "Data não disponível"
    }
  }

  const specs = [
    { label: "Modelo", value: drone.modelo },
    { label: "ID", value: drone.idDrone },
    { label: "Latitude", value: drone.latitude?.toString() || "N/A" },
    { label: "Longitude", value: drone.longitude?.toString() || "N/A" },
    { label: "Horário de Operação", value: drone.horarioOperacao || "N/A" },
    { label: "Capacidade de Carga", value: `${drone.capacidadeCarga} kg` || "N/A" },
    { label: "Última Manutenção", value: formatDate(drone.dataUltimaManutencao) },
    { label: "Data de Cadastro", value: formatDate(drone.dataCadastro) },
  ]

  const actions = [
    { title: "Iniciar Missão", icon: "play-circle", color: "#51cf66" },
    { title: "Retornar à Base", icon: "home", color: "#00b4d8" },
    { title: "Modo Emergência", icon: "warning", color: "#ff6b6b" },
    { title: "Configurações", icon: "settings", color: "#666" },
  ]

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#00b4d8", "#0077b6"]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{drone.nome}</Text>
          <Text style={styles.headerSubtitle}>{drone.modelo}</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Status Atual</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(drone.status) }]}>
              <Text style={styles.statusText}>{getStatusText(drone.status)}</Text>
            </View>
          </View>

          {/* Battery */}
          <View style={styles.batterySection}>
            <View style={styles.batteryHeader}>
              <Ionicons name="battery-half" size={24} color={getBatteryColor(drone.bateria)} />
              <Text style={styles.batteryText}>Bateria</Text>
              <Text style={styles.batteryPercentage}>{drone.bateria}%</Text>
            </View>
            <View style={styles.batteryBar}>
              <View style={styles.batteryBackground}>
                <View
                  style={[
                    styles.batteryFill,
                    {
                      width: `${drone.bateria}%`,
                      backgroundColor: getBatteryColor(drone.bateria),
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.actionsGrid}>
            {actions.map((action, index) => (
              <TouchableOpacity key={index} style={styles.actionCard}>
                <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon as any} size={24} color="white" />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Especificações</Text>
          <View style={styles.specsCard}>
            {specs.map((spec, index) => (
              <View key={index} style={styles.specRow}>
                <Text style={styles.specLabel}>{spec.label}</Text>
                <Text style={styles.specValue}>{spec.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Map Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Localização</Text>
          <TouchableOpacity style={styles.mapCard}>
            <LinearGradient colors={["rgba(0, 180, 216, 0.1)", "rgba(0, 119, 182, 0.1)"]} style={styles.mapGradient}>
              <Ionicons name="location" size={48} color="#00b4d8" />
              <Text style={styles.mapText}>
                {drone.latitude}, {drone.longitude}
              </Text>
              <Text style={styles.mapSubtext}>Toque para ver no mapa</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atividade Recente</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Missão de Resgate Concluída</Text>
                <Text style={styles.activityTime}>Há 2 horas</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: "#ffd43b" }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Bateria Recarregada</Text>
                <Text style={styles.activityTime}>Há 4 horas</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: "#51cf66" }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Verificação de Rotina</Text>
                <Text style={styles.activityTime}>Ontem</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  moreButton: {
    marginLeft: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
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
  batterySection: {
    marginTop: 16,
  },
  batteryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  batteryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
  batteryPercentage: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  batteryBar: {
    marginTop: 8,
  },
  batteryBackground: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
  },
  batteryFill: {
    height: "100%",
    borderRadius: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: (width - 64) / 2,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  specsCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  specLabel: {
    fontSize: 14,
    color: "#666",
  },
  specValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  mapCard: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mapGradient: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  mapText: {
    fontSize: 18,
    color: "#00b4d8",
    fontWeight: "600",
    marginTop: 8,
  },
  mapSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  activityCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00b4d8",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  activityTime: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
})
