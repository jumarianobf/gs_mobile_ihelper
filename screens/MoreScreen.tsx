import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MoreStackParamList } from "../navigation/AppNavigator";

type MoreNavProp = NativeStackNavigationProp<MoreStackParamList, "MoreMenu">;

export default function MoreScreen() {
  const navigation = useNavigation<MoreNavProp>();

  const menuItems: Array<{
    icon: string;
    title: string;
    route: keyof MoreStackParamList;
    }> = [
    { icon: "radio", title: "Sensores", route: "Sensors" },
    { icon: "warning", title: "Áreas de Risco", route: "AreasRisco" },
    { icon: "ellipse", title: "Sinalizações", route: "Sinalizacoes" },
    { icon: "person", title: "Perfil", route: "Profile" },
    ];


  return (
    <View style={styles.container}>
      <LinearGradient colors={["#00b4d8", "#0077b6"]} style={styles.header}>
        <Text style={styles.headerTitle}>Mais Opções</Text>
      </LinearGradient>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.route)}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={item.icon as any} size={24} color="#00b4d8" />
            </View>
            <Text style={styles.menuText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
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
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  menuContainer: {
    padding: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: {
    fontSize: 18,
    color: "#333",
    marginLeft: 12,
  },
});
