"use client"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native"
import { DrawerContentScrollView } from "@react-navigation/drawer"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useAuth } from "../contexts/AuthContext"
import { colors } from "../styles/theme"

const CustomDrawer = (props) => {
  const { user, logout } = useAuth()

  const menuItems = [
    { name: "MainTabs", label: "Dashboard", icon: "home-outline" },
    { name: "Sensores", label: "Sensores", icon: "hardware-chip-outline" },
    { name: "Logs", label: "Logs", icon: "list-outline" },
    { name: "Profile", label: "Perfil", icon: "person-outline" },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="airplane" size={32} color={colors.white} />
          <Text style={styles.logoText}>iHelper</Text>
          <Text style={styles.logoAccent}>Drone</Text>
        </View>
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.nome || "Usuário"}</Text>
            <Text style={styles.userRole}>{user.role || "Operador"}</Text>
          </View>
        )}
      </LinearGradient>

      <DrawerContentScrollView {...props} style={styles.drawerContent}>
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>PRINCIPAL</Text>
          {menuItems.slice(0, 1).map((item) => (
            <TouchableOpacity
              key={item.name}
              style={styles.menuItem}
              onPress={() => props.navigation.navigate(item.name)}
            >
              <Ionicons name={item.icon} size={20} color={colors.light} />
              <Text style={styles.menuText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>SISTEMA</Text>
          {menuItems.slice(1).map((item) => (
            <TouchableOpacity
              key={item.name}
              style={styles.menuItem}
              onPress={() => props.navigation.navigate(item.name)}
            >
              <Ionicons name={item.icon} size={20} color={colors.light} />
              <Text style={styles.menuText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
    marginLeft: 10,
  },
  logoAccent: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.secondary,
  },
  userInfo: {
    marginTop: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  userRole: {
    fontSize: 14,
    color: colors.primaryLight,
    marginTop: 2,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 20,
  },
  menuSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.gray,
    marginLeft: 20,
    marginBottom: 10,
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 2,
  },
  menuText: {
    fontSize: 16,
    color: colors.light,
    marginLeft: 15,
    fontWeight: "500",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.darkLight,
    padding: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutText: {
    fontSize: 16,
    color: colors.danger,
    marginLeft: 15,
    fontWeight: "500",
  },
})

export default CustomDrawer
