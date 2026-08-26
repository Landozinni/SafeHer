import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { router } from "expo-router";

import { register } from "../../services/firebase/auth";
import { createUserProfile } from "../../services/user/userService";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert("Campos obrigatórios", "Preencha todos os campos.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Senhas diferentes", "As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Senha inválida",
        "A senha precisa ter pelo menos 6 caracteres.",
      );
      return;
    }

    try {
      setLoading(true);

      const credential = await register(email.trim().toLowerCase(), password);

      // CORREÇÃO AQUI: Passando os dados no formato de objeto esperado pela userService
      await createUserProfile(credential.user.uid, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
      });

      console.log("Perfil criado no Firestore com sucesso!");
      Alert.alert("Conta criada! 🛡️", "Sua conta foi criada com sucesso.", [
        {
          text: "Continuar",
          onPress: () => router.replace("/(app)/home"),
        },
      ]);
    } catch (error: any) {
      console.error("Erro detalhado no cadastro:", error);

      let message = "Não foi possível criar sua conta.";

      switch (error?.code) {
        case "auth/email-already-in-use":
          message = "Este e-mail já está cadastrado.";
          break;

        case "auth/invalid-email":
          message = "Digite um e-mail válido.";
          break;

        case "auth/weak-password":
          message = "A senha escolhida é muito fraca.";
          break;

        case "auth/network-request-failed":
          message = "Verifique sua conexão com a internet.";
          break;

        default:
          if (error?.message) {
            message = error.message;
          }
          break;
      }

      Alert.alert("Erro no cadastro", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoCircle}>
          <Text style={styles.logo}>🛡️</Text>
        </View>

        <Text style={styles.title}>Criar conta</Text>

        <Text style={styles.subtitle}>
          Crie sua conta para ter acesso às ferramentas de segurança do SafeHer.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Nome</Text>

          <TextInput
            style={styles.input}
            placeholder="Seu nome completo"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

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
            placeholder="Mínimo de 6 caracteres"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Confirmar senha</Text>

          <TextInput
            style={styles.input}
            placeholder="Digite a senha novamente"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Criar minha conta</Text>
            )}
          </Pressable>

          <Pressable
            style={styles.loginButton}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text style={styles.loginText}>
              Já possui uma conta? <Text style={styles.loginBold}>Entrar</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7FC",
  },

  content: {
    flexGrow: 1,
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
    marginBottom: 20,
  },

  logo: {
    fontSize: 38,
  },

  title: {
    fontSize: 32,
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

  form: {
    width: "100%",
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
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  buttonPressed: {
    opacity: 0.8,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  loginButton: {
    alignItems: "center",
    marginTop: 22,
  },

  loginText: {
    color: "#77717F",
    fontSize: 14,
  },

  loginBold: {
    color: "#7048B8",
    fontWeight: "700",
  },
});
