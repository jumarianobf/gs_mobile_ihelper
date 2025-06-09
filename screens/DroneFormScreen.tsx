"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { apiService } from "../services/ApiService"
import type { Drone } from "../types/types"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { DronesStackParamList } from "../navigation/AppNavigator"

// Tipos para rota e navegação do Stack de Drones
type DroneFormRouteProp = RouteProp<DronesStackParamList, "DroneForm">
type DroneFormNavProp = NativeStackNavigationProp<DronesStackParamList, "DroneForm">

export default function DroneFormScreen() {
  const navigation = useNavigation<DroneFormNavProp>()
  const route = useRoute<DroneFormRouteProp>()
  const { drone } = route.params || {}

  const [loading, setLoading] = useState(false)
  const [nome, setNome] = useState(drone?.nome || "")
  const [modelo, setModelo] = useState(drone?.modelo || "")
  const [status, setStatus] = useState(drone?.status || "ATIVO")
  const [latitude, setLatitude] = useState(drone?.latitude?.toString() || "")
  const [longitude, setLongitude] = useState(drone?.longitude?.toString() || "")
  const [bateria, setBateria] = useState(drone?.bateria?.toString() || "")
  const [capacidadeCarga, setCapacidadeCarga] = useState(drone?.capacidadeCarga?.toString() || "")
  const [dataUltimaManutencao, setDataUltimaManutencao] = useState(drone?.dataUltimaManutencao || "")
  const [horarioOperacao, setHorarioOperacao] = useState(drone?.horarioOperacao || "")

  const isEditing = Boolean(drone)

  const validarCampos = () => {
    if (!nome.trim()) {
      Alert.alert("Erro", "Nome é obrigatório")
      return false
    }
    if (!modelo.trim()) {
      Alert.alert("Erro", "Modelo é obrigatório")
      return false
    }
    if (!latitude || isNaN(Number(latitude))) {
      Alert.alert("Erro", "Latitude deve ser um número válido")
      return false
    }
    if (!longitude || isNaN(Number(longitude))) {
      Alert.alert("Erro", "Longitude deve ser um número válido")
      return false
    }
    if (!bateria || isNaN(Number(bateria)) || Number(bateria) < 0 || Number(bateria) > 100) {
      Alert.alert("Erro", "Bateria deve ser um número entre 0 e 100")
      return false
    }
    if (!capacidadeCarga || isNaN(Number(capacidadeCarga))) {
      Alert.alert("Erro", "Capacidade de carga deve ser um número válido")
      return false
    }
    if (!horarioOperacao.trim()) {
      Alert.alert("Erro", "Horário de operação é obrigatório")
      return false
    }
    return true
  }

  const salvarDrone = async () => {
    if (!validarCampos()) return

    setLoading(true)
    try {
    const dadosDrone: Omit<Drone, "idDrone" | "dataCadastro"> = {
        nome: nome.trim(),
        modelo: modelo.trim(),
        status,
        latitude: Number(latitude) > 1000 ? Number(latitude) / 1000000 : Number(latitude),
        longitude: Math.abs(Number(longitude)) > 1000 ? Number(longitude) / 1000000 : Number(longitude),
        bateria: Number(bateria),
        capacidadeCarga: Number(capacidadeCarga),
        dataUltimaManutencao: dataUltimaManutencao || undefined,
        horarioOperacao: horarioOperacao.trim(),
        }


      if (isEditing && drone) {
        await apiService.updateDrone(drone.idDrone, dadosDrone)
        Alert.alert("Sucesso", "Drone atualizado com sucesso!")
      } else {
        await apiService.createDrone(dadosDrone)
        Alert.alert("Sucesso", "Drone criado com sucesso!")
      }

      navigation.goBack()
    } catch (error) {
      console.error("Erro ao salvar drone:", error)
      Alert.alert("Erro", "Não foi possível salvar o drone. Verifique sua conexão e tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const confirmarExclusao = () => {
    Alert.alert("Confirmar Exclusão", "Tem certeza que deseja excluir este drone? Esta ação não pode ser desfeita.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: excluirDrone },
    ])
  }

  const excluirDrone = async () => {
    if (!drone) return

    setLoading(true)
    try {
      await apiService.deleteDrone(drone.idDrone)
      Alert.alert("Sucesso", "Drone excluído com sucesso!")
      navigation.goBack()
    } catch (error) {
      console.error("Erro ao excluir drone:", error)
      Alert.alert("Erro", "Não foi possível excluir o drone. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>


      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome *</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome do drone"
              value={nome}
              onChangeText={setNome}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Modelo *</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o modelo do drone"
              value={modelo}
              onChangeText={setModelo}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Status *</Text>
            <View style={styles.statusContainer}>
              {["ATIVO", "INATIVO", "MANUTENCAO"].map((statusOption) => (
                <TouchableOpacity
                  key={statusOption}
                  style={[styles.statusButton, status === statusOption && styles.statusButtonActive]}
                  onPress={() => setStatus(statusOption)}
                  disabled={loading}
                >
                  <Text style={[styles.statusButtonText, status === statusOption && styles.statusButtonTextActive]}>
                    {statusOption === "MANUTENCAO" ? "MANUTENÇÃO" : statusOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Latitude *</Text>
              <TextInput
                style={styles.input}
                placeholder="-23.5614"
                value={latitude}
                onChangeText={setLatitude}
                keyboardType="numeric"
                editable={!loading}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Longitude *</Text>
              <TextInput
                style={styles.input}
                placeholder="-46.6565"
                value={longitude}
                onChangeText={setLongitude}
                keyboardType="numeric"
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Bateria (%) *</Text>
              <TextInput
                style={styles.input}
                placeholder="0-100"
                value={bateria}
                onChangeText={setBateria}
                keyboardType="numeric"
                editable={!loading}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Capacidade (kg) *</Text>
              <TextInput
                style={styles.input}
                placeholder="2.5"
                value={capacidadeCarga}
                onChangeText={setCapacidadeCarga}
                keyboardType="numeric"
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Última Manutenção</Text>
            <TextInput
              style={styles.input}
              placeholder="2024-01-15T10:30:00"
              value={dataUltimaManutencao}
              onChangeText={setDataUltimaManutencao}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Horário de Operação *</Text>
            <TextInput
              style={styles.input}
              placeholder="08:00-18:00"
              value={horarioOperacao}
              onChangeText={setHorarioOperacao}
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.buttonDisabled]}
            onPress={salvarDrone}
            disabled={loading}
          >
            <LinearGradient colors={["#00b4d8", "#0077b6"]} style={styles.buttonGradient}>
              {loading ? (
                <Text style={styles.buttonText}>Salvando...</Text>
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="white" />
                  <Text style={styles.buttonText}>{isEditing ? "Atualizar Drone" : "Criar Drone"}</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {isEditing && (
            <TouchableOpacity
              style={[styles.deleteButton, loading && styles.buttonDisabled]}
              onPress={confirmarExclusao}
              disabled={loading}
            >
              <Ionicons name="trash" size={20} color="white" />
              <Text style={styles.buttonText}>Excluir Drone</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    color: "#333",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: "row",
    gap: 8,
  },
  statusButton: {
    flex: 1,
    height: 48,
    backgroundColor: "white",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  statusButtonActive: {
    borderColor: "#00b4d8",
    backgroundColor: "#00b4d8",
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  statusButtonTextActive: {
    color: "white",
  },
  saveButton: {
    height: 56,
    borderRadius: 16,
    marginTop: 20,
    overflow: "hidden",
  },
  buttonGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  deleteButton: {
    height: 56,
    backgroundColor: "#ff6b6b",
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
})
