import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { WebView } from "react-native-webview";
import type { WebViewMessageEvent } from "react-native-webview";

import { apiService } from "../services/ApiService";
import type { Drone, AreaRisco } from "../types/types";

const { width, height } = Dimensions.get("window");

export default function MapScreen() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [areas, setAreas] = useState<AreaRisco[]>([]);
  const [loading, setLoading] = useState(true);
  const [html, setHtml] = useState<string>("");
  const [showList, setShowList] = useState(false);
  const webViewRef = useRef<WebView>(null);

  // Gera o HTML do mapa com Leaflet, injetando marcadores e círculos
  const buildHtml = (drones: Drone[], areas: AreaRisco[]) => {
    const dronePoints = drones
      .map(
        (d) => `
      L.marker([${d.latitude}, ${d.longitude}], {
        icon: L.divIcon({
          className: '',
          html: '<div style="background:${getStatusColor(
            d.status
          )};width:24px;height:24px;border-radius:12px;border:2px solid #fff"></div>'
        })
      }).addTo(map).bindPopup('${d.nome}<br/>Bateria: ${d.bateria}%')`
      )
      .join("\n");

    const areaCircles = areas
      .map(
        (a) => `
      L.circle([${a.latitude}, ${a.longitude}], {
        radius: ${a.raioCobertura || 1000},
        color: '${getStatusColor(a.status || "ATIVA")}',
        fillColor: '${getStatusColor(a.status || "ATIVA")}33',
        weight: 2
      }).addTo(map).bindPopup('${a.nomeArea}<br/>Raio: ${a.raioCobertura || 1000}m')`
      )
      .join("\n");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="initial-scale=1.0,user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
          <style>html,body,#map{height:100%;margin:0;padding:0;}</style>
        </head>
        <body>
          <div id="map"></div>
          <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
          <script>
            const map = L.map('map').setView([-23.5505, -46.6333], 12);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);
            ${dronePoints}
            ${areaCircles}
            window.addEventListener("message", (e) => {
              try {
                const data = JSON.parse(e.data);
                if (data.type === 'flyTo') {
                  map.flyTo([data.lat, data.lng], 15);
                }
              } catch (err) {}
            });
          </script>
        </body>
      </html>
    `;
  };

 

  // Mesma função de cor de status que você já tinha
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ATIVO":
        return "#10b981";
      case "INATIVO":
        return "#ef4444";
      case "MANUTENCAO":
        return "#f59e0b";
      case "EMERGENCIA":
        return "#ef4444";
      case "MONITORAMENTO":
        return "#f59e0b";
      default:
        return "#6c757d";
    }
  };

  const loadMapData = async () => {
    try {
      setLoading(true);
      const [dronesData, areasData] = await Promise.all([
        apiService.getDrones(),
        apiService.getAreasRisco(),
      ]);
     const validDrones = dronesData
        .filter((d) => d.latitude && d.longitude)
        .map((d) => ({
            ...d,
            latitude: Math.abs(d.latitude) > 90 ? d.latitude / 1000000 : d.latitude,
            longitude: Math.abs(d.longitude) > 180 ? d.longitude / 1000000 : d.longitude,
        }));

      const validAreas = areasData.filter((a) => a.latitude && a.longitude);

      setDrones(validDrones);
      setAreas(validAreas);
      setHtml(buildHtml(validDrones, validAreas));
    } catch (error) {
      console.error("Erro ao carregar dados do mapa:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados do mapa");
    } finally {
      setLoading(false);
    }
  };

  
  const flyToMap = (lat: number, lng: number) => {
    setShowList(false);
    webViewRef.current?.postMessage(
      JSON.stringify({ type: "flyTo", lat, lng })
    );
  };

  useFocusEffect(
    useCallback(() => {
      loadMapData();
    }, [])
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#00b4d8", "#0077b6"]} style={styles.header}>
        <Text style={styles.headerTitle}>Mapa de Operações</Text>
        <View style={styles.headerSubtitleRow}>
          <Text style={styles.headerSubtitle}>
            {drones.length} drones • {areas.length} áreas
          </Text>
          <TouchableOpacity
      onPress={loadMapData}
      style={{marginLeft: 8}}
    >
      <Ionicons name="refresh" size={24} color="rgba(255, 255, 255, 0.8)" />
    </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowList(!showList)}
            style={styles.listButton}
          >
            <Ionicons name="list" size={24} color="rgba(255, 255, 255, 0.8)" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Lista de drones/áreas */}
      {showList && (
        <View style={styles.listContainer}>
          <ScrollView>
            {drones.map((drone) => (
              <TouchableOpacity
                key={drone.idDrone}
                style={styles.listItem}
                onPress={() => flyToMap(drone.latitude, drone.longitude)}
              >
                <Text style={styles.listItemText}>
                  {drone.nome} - {drone.status}
                </Text>
              </TouchableOpacity>
            ))}
            {areas.map((area) => (
              <TouchableOpacity
                key={area.idArea}
                style={styles.listItem}
                onPress={() => flyToMap(area.latitude, area.longitude)}
              >
                <Text style={styles.listItemText}>
                  {area.nomeArea} - {area.status || "ATIVA"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* WebView/Mapa */}
      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00b4d8" />
          <Text style={styles.loadingText}>Carregando mapa...</Text>
        </View>
      ) : (
        <WebView
          key={html}
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html }}
          style={{ width, height }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f5ff" },
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
  headerSubtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  listButton: {
    marginLeft: 8,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: "#666",
  },
  listContainer: {
    position: "absolute",
    top: 120,
    left: 20,
    right: 20,
    maxHeight: 300,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    elevation: 5,
    zIndex: 10,
  },
  listItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  listItemText: {
    fontSize: 16,
    color: "#333",
  },
});
