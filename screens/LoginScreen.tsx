"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../contexts/AuthContext"
import { apiService } from "../services/ApiService"

async function ensureUsuarioBackend(firebaseUser: { email: string, displayName?: string }) {
  const lista = await apiService.getUsuarios();
  const usuarioBackend = lista.find(u => u.email === firebaseUser.email);

  if (!usuarioBackend) {
    await apiService.criarUsuario({
      nome: firebaseUser.displayName || "Usuário",
      email: firebaseUser.email,
      nivelAcesso: "USER",
      status: "ATIVO",
    });
  }
}
export default function LoginScreen() {
  const { login, register, isLoading } = useAuth()
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = () => {
    if (!formData.email.trim()) {
      Alert.alert("Erro", "Por favor, insira seu email")
      return false
    }

    if (!validateEmail(formData.email)) {
      Alert.alert("Erro", "Por favor, insira um email válido")
      return false
    }

    if (!formData.password.trim()) {
      Alert.alert("Erro", "Por favor, insira sua senha")
      return false
    }

    if (formData.password.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres")
      return false
    }

    if (!isLoginMode) {
      if (!formData.nome.trim()) {
        Alert.alert("Erro", "Por favor, insira seu nome")
        return false
      }

      if (formData.password !== formData.confirmPassword) {
        Alert.alert("Erro", "As senhas não coincidem")
        return false
      }
    }

    return true
  }

  const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    let success = false;
    let user = null;

    if (isLoginMode) {
      success = await login(formData.email.trim(), formData.password);
      // No login, você não tem o nome, então pode buscar depois
    } else {
      success = await register(formData.nome.trim(), formData.email.trim(), formData.password);
      user = { email: formData.email, nome: formData.nome };
    }

    if (success) {
      // Se for login, pega o usuário do Firebase Auth
      // Se for cadastro, já tem o nome e email
      const email = isLoginMode ? formData.email : formData.email;
      const nome = isLoginMode ? "Usuário" : formData.nome; // No login, pode ser "Usuário" ou buscar depois

      // Busca o usuário no backend
      const lista = await apiService.getUsuarios();
      const usuarioBackend = lista.find((u) => u.email === email);

      // Se não existir, cria o usuário no backend
      if (!usuarioBackend) {
        await apiService.criarUsuario({
          nome: nome,
          email: email,
          nivelAcesso: "USER",
          status: "ATIVO",
        });
      }

      // Limpa o formulário
      setFormData({ nome: "", email: "", password: "", confirmPassword: "" });
      // A navegação será feita automaticamente pelo AuthContext
    }
  } catch (error) {
    console.error("Erro na autenticação:", error);
    // Trate o erro aqui, se necessário
  }
};

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode)
    setFormData({ nome: "", email: "", password: "", confirmPassword: "" })
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <LinearGradient colors={["#00b4d8", "#0077b6"]} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="airplane" size={48} color="white" />
            </View>
            <Text style={styles.title}>iHelper Drone</Text>
            <Text style={styles.subtitle}>Sistema de Alertas com Drones</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.form}>
              <Text style={styles.formTitle}>{isLoginMode ? "Entrar" : "Criar Conta"}</Text>

              {!isLoginMode && (
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nome completo"
                    value={formData.nome}
                    onChangeText={(text) => setFormData({ ...formData, nome: text })}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Senha"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {!isLoginMode && (
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Confirmar senha"
                    value={formData.confirmPassword}
                    onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>{isLoginMode ? "Entrar" : "Criar Conta"}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
                <Text style={styles.toggleButtonText}>
                  {isLoginMode ? "Não tem uma conta? Cadastre-se" : "Já tem uma conta? Entre"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
  },
  form: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    padding: 4,
  },
  submitButton: {
    backgroundColor: "#00b4d8",
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#00b4d8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  toggleButton: {
    marginTop: 20,
    alignItems: "center",
  },
  toggleButtonText: {
    color: "#00b4d8",
    fontSize: 16,
    fontWeight: "500",
  },
})
