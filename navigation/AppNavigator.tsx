import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import { Ionicons } from "@expo/vector-icons"
import type { AreaRisco, Drone } from "../types/types"
import DronesScreen from "../screens/DronesScreen"
import DroneDetailScreen from "../screens/DroneDetailScreen"
import DroneFormScreen from "../screens/DroneFormScreen"
import HomeScreen from "../screens/HomeScreen"
import AlertsScreen from "../screens/AlertsScreen"
import SensorsScreen from "../screens/SensorsScreen"
import SinalizacoesScreen from "../screens/SinalizacoesScreen"
import ProfileScreen from "../screens/ProfileScreen"
import MapScreen from "../screens/MapScreen"
import AreasRiscoScreen from "../screens/AreaRiscoScreen"
import MoreScreen from "../screens/MoreScreen"

const Tab = createBottomTabNavigator()

// Tipos para o stack de drones
export type DronesStackParamList = {
  DronesList: undefined
  DroneDetail: { drone: Drone }
  DroneForm: { drone?: Drone }
}

// Tipos para o stack de áreas de risco
export type AreasRiscoStackParamList = {
  AreasRiscoList: undefined
  AreaRiscoDetail: { area: AreaRisco }
  AreaRiscoForm: { area?: AreaRisco }
}


// Tipos para o stack "Mais"
export type MoreStackParamList = {
  MoreMenu: undefined
  Sensors: undefined
  AreasRisco: undefined
  Sinalizacoes: undefined
  Profile: undefined
}

// Stack tipado para drones
const DronesStack = createStackNavigator<DronesStackParamList>()

function DronesStackNavigator() {
  return (
    <DronesStack.Navigator
      initialRouteName="DronesList"
      screenOptions={{
        headerShown: false,
        presentation: "card",
      }}
    >
      <DronesStack.Screen
        name="DronesList"
        component={DronesScreen}
        options={{
          title: "Lista de Drones",
        }}
      />
      <DronesStack.Screen
        name="DroneDetail"
        component={DroneDetailScreen}
        options={{
          headerShown: true,
          headerTitle: "Detalhes do Drone",
          headerStyle: { backgroundColor: "#00b4d8" },
          headerTintColor: "white",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />
      <DronesStack.Screen
        name="DroneForm"
        component={DroneFormScreen}
        options={({ route }) => ({
          headerShown: true,
          headerTitle: route.params?.drone ? "Editar Drone" : "Novo Drone",
          headerStyle: { backgroundColor: "#00b4d8" },
          headerTintColor: "white",
          headerTitleStyle: { fontWeight: "bold" },
        })}
      />
    </DronesStack.Navigator>
  )
}

const AreasRiscoStack = createStackNavigator<AreasRiscoStackParamList>()

// Stack tipado para "Mais"
const MoreStack = createStackNavigator<MoreStackParamList>()

function MoreStackNavigator() {
  return (
    <MoreStack.Navigator
      initialRouteName="MoreMenu"
      screenOptions={{
        headerShown: false,
        presentation: "card",
      }}
    >
      <MoreStack.Screen
        name="MoreMenu"
        component={MoreScreen}
        options={{
          title: "Mais Opções",
        }}
      />
      <MoreStack.Screen
        name="Sensors"
        component={SensorsScreen}
        options={{
          headerShown: true,
          headerTitle: "Sensores",
          headerStyle: { backgroundColor: "#00b4d8" },
          headerTintColor: "white",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />
      <MoreStack.Screen
        name="AreasRisco"
        component={AreasRiscoScreen}
        options={{
          headerShown: true,
          headerTitle: "Áreas de Risco",
          headerStyle: { backgroundColor: "#00b4d8" },
          headerTintColor: "white",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />
      <MoreStack.Screen
        name="Sinalizacoes"
        component={SinalizacoesScreen}
        options={{
          headerShown: true,
          headerTitle: "Sinalizações",
          headerStyle: { backgroundColor: "#00b4d8" },
          headerTintColor: "white",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />
      <MoreStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: true,
          headerTitle: "Perfil",
          headerStyle: { backgroundColor: "#00b4d8" },
          headerTintColor: "white",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />
    </MoreStack.Navigator>
  )
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline"
          } else if (route.name === "Drones") {
            iconName = focused ? "airplane" : "airplane-outline"
          } else if (route.name === "Map") {
            iconName = focused ? "map" : "map-outline"
          } else if (route.name === "Alerts") {
            iconName = focused ? "notifications" : "notifications-outline"
          } else if (route.name === "More") {
            iconName = focused ? "grid" : "grid-outline"
          } else {
            iconName = "help-outline"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#00b4d8",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#e0e0e0",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: "Início" }} />
      <Tab.Screen name="Drones" component={DronesStackNavigator} options={{ tabBarLabel: "Drones" }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ tabBarLabel: "Mapa" }} />
      <Tab.Screen name="Alerts" component={AlertsScreen} options={{ tabBarLabel: "Alertas" }} />
      <Tab.Screen name="More" component={MoreStackNavigator} options={{ tabBarLabel: "Mais" }} />
    </Tab.Navigator>
  )
}
