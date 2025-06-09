import type { NavigatorScreenParams } from "@react-navigation/native"
import type { DronesStackParamList } from "../navigation/AppNavigator"

export type RootStackParamList = {
  Login: undefined
  Profile: undefined
  Dashboard: undefined
  Home: undefined
  Drones: NavigatorScreenParams<DronesStackParamList>
  Alerts: undefined
  Sensors: undefined
  AreasRisco: undefined
  Sinalizacoes: undefined
}

export interface Usuario {
  idUsuario: number
  nome: string
  email: string
  senhaHash?: string
  nivelAcesso: string
  status: string
  dataCriacao?: string
  dataAtualizacao?: string
}

export interface Drone {
  idDrone: number
  nome: string
  modelo: string
  status: string
  latitude: number
  longitude: number
  bateria: number
  capacidadeCarga: number
  dataUltimaManutencao?: string
  horarioOperacao: string
  dataCadastro?: string
}

export interface AreaRisco {
  idArea: number
  nomeArea: string
  descricao?: string
  latitude: number
  longitude: number
  status: string
  raioCobertura: number
  dataCadastro?: string
}

export interface Alerta {
  idAlerta: number
  tipoAlerta: string
  dataHora: string
  status: string
  gravidade: string
  descricao: string
  area: AreaRisco
  drone?: Drone
  usuario?: Usuario
}

export interface Sensor {
  idSensor: number
  tipoSensor: string
  descricao?: string
  unidadeMedida: string
  status: string
  intervaloLeitura: number
  dataInstalacao?: string
  area?: AreaRisco
}

export interface Sinalizacao {
  idSinalizacao: number
  tipoSinalizacao: string
  descricao?: string
  status: string
  dataInstalacao?: string
  area?: AreaRisco
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface Stat {
  title: string
  value: string
  icon: string
}
