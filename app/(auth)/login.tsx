import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { router } from "expo-router";

import { login } from "../../services/firebase/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert("Campos obrigatórios", "Digite seu e-mail e sua senha.");
      return;
    }

    try {
      setLoading(true);

      await login(email.trim().toLowerCase(), password);

      router.replace("/(app)/home");
    } catch (error: any) {
      console.log(error);

      let message = "Não foi possível entrar.";

      switch (error?.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          message = "E-mail ou senha incorretos.";
          break;

        case "auth/invalid-email":
          message = "Digite um e-mail válido.";
          break;

        case "auth/too-many-requests":
          message = "Muitas tentativas. Aguarde um pouco e tente novamente.";
          break;

        case "auth/network-request-failed":
          message = "Verifique sua conexão com a internet.";
          break;
      }

      Alert.alert("Não foi possível entrar", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        <View style={styles.logoCircle}>
          <Text style={styles.logo}>🛡️</Text>
        </View>

        <Text style={styles.title}>Bem-vinda de volta</Text>

        <Text style={styles.subtitle}>
          Entre na sua conta para acessar sua proteção.
        </Text>

        <Text style={styles.label}>E-mail</Text>

        <TextInput
          style={styles.input}
          placeholder="seuemail@email.com"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Senha</Text>

        <TextInput
          style={styles.input}
          placeholder="Sua senha"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </Pressable>

        <Pressable
          style={styles.registerButton}
          onPress={() => router.replace("/(auth)/register")}
        >
          <Text style={styles.registerText}>
            Ainda não possui uma conta?{" "}
            <Text style={styles.registerBold}>Criar conta</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7FC",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    padding: 28,
  },

  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#E9E1F8",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 22,
  },

  logo: {
    fontSize: 38,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#211A2D",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#77717F",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 30,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#413A4A",
    marginBottom: 7,
    marginTop: 12,
  },

  input: {
    height: 54,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2DEE8",
    borderRadius: 15,
    paddingHorizontal: 17,
    fontSize: 16,
    color: "#211A2D",
  },

  button: {
    height: 56,
    borderRadius: 16,
    backgroundColor: "#7048B8",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },

  buttonPressed: {
    opacity: 0.8,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  registerButton: {
    alignItems: "center",
    marginTop: 22,
  },

  registerText: {
    color: "#77717F",
    fontSize: 14,
  },

  registerBold: {
    color: "#7048B8",
    fontWeight: "700",
  },
});
