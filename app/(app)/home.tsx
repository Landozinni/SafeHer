import { useState } from "react";
import {
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function HomeScreen() {
  const { user } = useAuth();
  const [securityMode, setSecurityMode] = useState(false);

  function handleSecurityMode() {
    if (securityMode) {
      Alert.alert("Modo segurança", "O modo segurança foi desativado.", [
        {
          text: "OK",
          onPress: () => setSecurityMode(false),
        },
      ]);

      return;
    }

    router.push("/(app)/emergency");
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Olá 👋</Text>

            <Text style={styles.title}>Está tudo bem?</Text>
          </View>

          <Pressable
            style={styles.profileButton}
            onPress={() => router.push("/(app)/profile")}
          >
            <Text style={styles.profileText}>
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </Text>
          </Pressable>
        </View>

        {/* STATUS */}
        <View
          style={[styles.statusCard, securityMode && styles.statusCardActive]}
        >
          <View
            style={[styles.statusIcon, securityMode && styles.statusIconActive]}
          >
            <Text style={styles.statusEmoji}>{securityMode ? "🛡️" : "✓"}</Text>
          </View>

          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>
              {securityMode ? "Modo segurança ativo" : "Você está protegida"}
            </Text>

            <Text style={styles.statusDescription}>
              {securityMode
                ? "O SafeHer está acompanhando sua situação."
                : "Ative o modo segurança quando precisar."}
            </Text>
          </View>
        </View>

        {/* BOTÃO PRINCIPAL */}
        <View style={styles.securitySection}>
          <Text style={styles.sectionTitle}>Modo segurança</Text>

          <Text style={styles.sectionDescription}>
            Use quando estiver em uma situação de perigo ou quando quiser
            compartilhar sua localização com seu contato de emergência.
          </Text>

          <Pressable
            onPress={handleSecurityMode}
            style={({ pressed }) => [
              styles.securityButton,
              securityMode && styles.securityButtonActive,
              pressed && styles.securityButtonPressed,
            ]}
          >
            <View style={styles.securityButtonCircle}>
              <Text style={styles.securityEmoji}>
                {securityMode ? "✓" : "🆘"}
              </Text>
            </View>

            <Text style={styles.securityButtonTitle}>
              {securityMode ? "SEGURANÇA ATIVA" : "ATIVAR SEGURANÇA"}
            </Text>

            <Text style={styles.securityButtonSubtitle}>
              {securityMode ? "Toque para desativar" : "Toque para iniciar"}
            </Text>
          </Pressable>
        </View>

        {/* AÇÕES RÁPIDAS */}
        <Text style={styles.quickTitle}>Acesso rápido</Text>

        <View style={styles.quickActions}>
          <Pressable
            style={({ pressed }) => [
              styles.quickCard,
              pressed && styles.quickPressed,
            ]}
            onPress={() => router.push("/(app)/profile")}
          >
            <View style={styles.quickIcon}>
              <Text style={styles.quickEmoji}>👤</Text>
            </View>

            <Text style={styles.quickCardTitle}>Meu perfil</Text>

            <Text style={styles.quickCardDescription}>
              Conta e configurações
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.quickCard,
              pressed && styles.quickPressed,
            ]}
            onPress={() => router.push("/(app)/chat")}
          >
            <View style={styles.quickIcon}>
              <Text style={styles.quickEmoji}>💬</Text>
            </View>

            <Text style={styles.quickCardTitle}>Contato</Text>

            <Text style={styles.quickCardDescription}>
              Pessoa de emergência
            </Text>
          </Pressable>
        </View>

        {/* INFORMAÇÃO */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🛡️ Como o SafeHer ajuda?</Text>

          <Text style={styles.infoText}>
            Quando o modo segurança for ativado, você terá alguns segundos para
            cancelar. Caso contrário, o aplicativo poderá enviar sua mensagem de
            emergência e sua localização para o contato cadastrado.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7FC",
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  welcome: {
    fontSize: 15,
    color: "#77717F",
    marginBottom: 4,
  },

  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#211A2D",
  },

  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E9E1F8",
    justifyContent: "center",
    alignItems: "center",
  },

  profileText: {
    fontSize: 19,
    fontWeight: "800",
    color: "#7048B8",
  },

  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 28,
  },

  statusCardActive: {
    backgroundColor: "#F0E9FA",
  },

  statusIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#E8F6EC",
    justifyContent: "center",
    alignItems: "center",
  },

  statusIconActive: {
    backgroundColor: "#E0D1F5",
  },

  statusEmoji: {
    fontSize: 24,
  },

  statusInfo: {
    flex: 1,
    marginLeft: 14,
  },

  statusTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#211A2D",
  },

  statusDescription: {
    fontSize: 13,
    color: "#77717F",
    lineHeight: 19,
    marginTop: 3,
  },

  securitySection: {
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#211A2D",
    alignSelf: "flex-start",
  },

  sectionDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: "#77717F",
    marginTop: 6,
    marginBottom: 20,
    alignSelf: "flex-start",
  },

  securityButton: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#7048B8",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#7048B8",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 8,
  },

  securityButtonActive: {
    backgroundColor: "#573494",
  },

  securityButtonPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },

  securityButtonCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  securityEmoji: {
    fontSize: 30,
    color: "#FFFFFF",
  },

  securityButtonTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  securityButtonSubtitle: {
    color: "#E9E1F8",
    fontSize: 13,
    marginTop: 5,
  },

  quickTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#211A2D",
    marginTop: 32,
    marginBottom: 14,
  },

  quickActions: {
    flexDirection: "row",
    gap: 12,
  },

  quickCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
  },

  quickPressed: {
    opacity: 0.75,
  },

  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F0EAF8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  quickEmoji: {
    fontSize: 21,
  },

  quickCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#211A2D",
  },

  quickCardDescription: {
    fontSize: 12,
    color: "#88818F",
    marginTop: 4,
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 17,
    marginTop: 22,
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#211A2D",
    marginBottom: 7,
  },

  infoText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#77717F",
  },
});
