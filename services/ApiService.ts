import AsyncStorage from "@react-native-async-storage/async-storage"
import type { Drone, AreaRisco, Sensor, Alerta, Sinalizacao, Usuario } from "../types/types"
import { Platform } from "react-native"

// mapeia o host corretamente para Android emulator, iOS simulator ou dispositivo real

const HOST = Platform.select({
  android: "10.0.2.2",   // ↪️ Android Emulator
  ios: "localhost",      // ↪️ iOS Simulator
  default: "192.168.15.9",  // ↪️ Web ou dispositivo físico (ajuste para seu IP de rede se for o caso)
})

const BASE_URL = `http://${HOST}:8080/api`
class ApiService {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    return response.json()
  }

  // Drones
  async getDrones(): Promise<Drone[]> {
    const response = await fetch(`${BASE_URL}/drones`, {
      headers: await this.getAuthHeaders(),
    })
    return this.handleResponse<Drone[]>(response)
  }

  async getDroneById(id: number): Promise<Drone> {
    const response = await fetch(`${BASE_URL}/drones/${id}`, {
      headers: await this.getAuthHeaders(),
    })
    return this.handleResponse<Drone>(response)
  }

  async createDrone(drone: Omit<Drone, "idDrone">): Promise<Drone> {
    const response = await fetch(`${BASE_URL}/drones`, {
      method: "POST",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(drone),
    })
    return this.handleResponse<Drone>(response)
  }

  async updateDrone(id: number, drone: Partial<Drone>): Promise<Drone> {
    const response = await fetch(`${BASE_URL}/drones/${id}`, {
      method: "PUT",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(drone),
    })
    return this.handleResponse<Drone>(response)
  }

  async deleteDrone(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/drones/${id}`, {
      method: "DELETE",
      headers: await this.getAuthHeaders(),
    })
    if (!response.ok) {
      throw new Error(`Erro ao deletar drone: ${response.status}`)
    }
  }

  // Áreas de Risco
  async getAreasRisco(): Promise<AreaRisco[]> {
    const response = await fetch(`${BASE_URL}/area-risco`, {
      headers: await this.getAuthHeaders(),
    })
    return this.handleResponse<AreaRisco[]>(response)
  }

  async getAreaRiscoById(id: number): Promise<AreaRisco> {
    const response = await fetch(`${BASE_URL}/area-risco/${id}`, {
      headers: await this.getAuthHeaders(),
    })
    return this.handleResponse<AreaRisco>(response)
  }

  async createAreaRisco(area: Omit<AreaRisco, "idArea">): Promise<AreaRisco> {
    const response = await fetch(`${BASE_URL}/area-risco`, {
      method: "POST",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(area),
    })
    return this.handleResponse<AreaRisco>(response)
  }

  async updateAreaRisco(id: number, area: Partial<AreaRisco>): Promise<AreaRisco> {
    const response = await fetch(`${BASE_URL}/area-risco/${id}`, {
      method: "PUT",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(area),
    })
    return this.handleResponse<AreaRisco>(response)
  }

  async deleteAreaRisco(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/area-risco/${id}`, {
      method: "DELETE",
      headers: await this.getAuthHeaders(),
    })
    if (!response.ok) {
      throw new Error(`Erro ao deletar área de risco: ${response.status}`)
    }
  }

  // Sensores
  async getSensores(): Promise<Sensor[]> {
    const response = await fetch(`${BASE_URL}/sensores`, {
      headers: await this.getAuthHeaders(),
    })
    return this.handleResponse<Sensor[]>(response)
  }

  async getSensorById(id: number): Promise<Sensor> {
    const response = await fetch(`${BASE_URL}/sensores/${id}`, {
      headers: await this.getAuthHeaders(),
    })
    return this.handleResponse<Sensor>(response)
  }

  async createSensor(sensor: Omit<Sensor, "idSensor">): Promise<Sensor> {
    const response = await fetch(`${BASE_URL}/sensores`, {
      method: "POST",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(sensor),
    })
    return this.handleResponse<Sensor>(response)
  }

  async updateSensor(id: number, sensor: Partial<Sensor>): Promise<Sensor> {
    const response = await fetch(`${BASE_URL}/sensores/${id}`, {
      method: "PUT",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(sensor),
    })
    return this.handleResponse<Sensor>(response)
  }

  async deleteSensor(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/sensores/${id}`, {
      method: "DELETE",
      headers: await this.getAuthHeaders(),
    })
    if (!response.ok) {
      throw new Error(`Erro ao deletar sensor: ${response.status}`)
    }
  }

  // Alertas
  async getAlertas(): Promise<Alerta[]> {
    const response = await fetch(`${BASE_URL}/alertas`, {
      headers: await this.getAuthHeaders(),
    })
    return this.handleResponse<Alerta[]>(response)
  }

  async getAlertaById(id: number): Promise<Alerta> {
    const response = await fetch(`${BASE_URL}/alertas/${id}`, {
      headers: await this.getAuthHeaders(),
    })
    return this.handleResponse<Alerta>(response)
  }

  async createAlerta(alerta: Omit<Alerta, "idAlerta">): Promise<Alerta> {
    const response = await fetch(`${BASE_URL}/alertas`, {
      method: "POST",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(alerta),
    })
    return this.handleResponse<Alerta>(response)
  }

  async updateAlerta(id: number, alerta: Partial<Alerta>): Promise<Alerta> {
    const response = await fetch(`${BASE_URL}/alertas/${id}`, {
      method: "PUT",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(alerta),
    })
    return this.handleResponse<Alerta>(response)
  }

  async deleteAlerta(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/alertas/${id}`, {
      method: "DELETE",
      headers: await this.getAuthHeaders(),
    })
    if (!response.ok) {
      throw new Error(`Erro ao deletar alerta: ${response.status}`)
    }
  }

  // Sinalizações
  async getSinalizacoes(): Promise<Sinalizacao[]> {
    const response = await fetch(`${BASE_URL}/sinalizacoes`, {
      headers: await this.getAuthHeaders(),
    })
    return this.handleResponse<Sinalizacao[]>(response)
  }

  async getSinalizacaoById(id: number): Promise<Sinalizacao> {
    const response = await fetch(`${BASE_URL}/sinalizacoes/${id}`, {
      headers: await this.getAuthHeaders(),
    })
    return this.handleResponse<Sinalizacao>(response)
  }

  async createSinalizacao(sinalizacao: Omit<Sinalizacao, "idSinalizacao">): Promise<Sinalizacao> {
    const response = await fetch(`${BASE_URL}/sinalizacoes`, {
      method: "POST",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(sinalizacao),
    })
    return this.handleResponse<Sinalizacao>(response)
  }

  async updateSinalizacao(id: number, sinalizacao: Partial<Sinalizacao>): Promise<Sinalizacao> {
    const response = await fetch(`${BASE_URL}/sinalizacoes/${id}`, {
      method: "PUT",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(sinalizacao),
    })
    return this.handleResponse<Sinalizacao>(response)
  }

  async deleteSinalizacao(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/sinalizacoes/${id}`, {
      method: "DELETE",
      headers: await this.getAuthHeaders(),
    })
    if (!response.ok) {
      throw new Error(`Erro ao deletar sinalização: ${response.status}`)
    }
  }

  // Usuários
  async getUsuarios(): Promise<Usuario[]> {
    const response = await fetch(`${BASE_URL}/usuarios`, {
      headers: await this.getAuthHeaders(),
    })
    return this.handleResponse<Usuario[]>(response)
  }

  async getUsuarioById(id: number): Promise<Usuario> {
    const response = await fetch(`${BASE_URL}/usuarios/${id}`, {
      headers: await this.getAuthHeaders(),
    })
    return this.handleResponse<Usuario>(response)
  }

  async updateUsuario(id: number, usuario: Partial<Usuario>): Promise<Usuario> {
    const response = await fetch(`${BASE_URL}/usuarios/${id}`, {
      method: "PUT",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(usuario),
    })
    return this.handleResponse<Usuario>(response)
  }

  async criarUsuario(usuario: Omit<Usuario, "idUsuario">): Promise<Usuario> {
  const response = await fetch(`${BASE_URL}/usuarios`, {
    method: "POST",
    headers: await this.getAuthHeaders(),
    body: JSON.stringify(usuario),
  })
  return this.handleResponse<Usuario>(response);
}
}
export const apiService = new ApiService()
