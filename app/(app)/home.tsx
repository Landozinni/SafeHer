import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { router } from "expo-router";
import { collection, doc, getDoc, onSnapshot, query } from "firebase/firestore";

import { useAuth } from "../../context/AuthContext";
import { getOrCreateConversation } from "../../services/chat/chatService";
import { db } from "../../services/firebase/firestore";
import {
  isSecurityModeActive,
  setSecurityModeActive,
} from "../../services/securityService";

export default function HomeScreen() {
  const { user } = useAuth();
  const [nfcModeActive, setNfcModeActive] = useState(false);
  const [hasMessages, setHasMessages] = useState(false);

  useEffect(() => {
    loadNfcState();
  }, []);

  async function loadNfcState() {
    const active = await isSecurityModeActive();
    setNfcModeActive(active);
  }

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function checkChatActivity() {
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        if (userData?.emergencyContactUid) {
          const conversationId = await getOrCreateConversation(
            user.uid,
            userData.emergencyContactUid,
          );

          const messagesRef = collection(
            db,
            "conversations",
            conversationId,
            "messages",
          );
          const q = query(messagesRef);

          unsubscribe = onSnapshot(q, (snapshot) => {
            setHasMessages(!snapshot.empty);
          });
        }
      } catch (error) {
        console.error("Erro ao verificar mensagens do chat:", error);
      }
    }

    checkChatActivity();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  async function toggleNfcSecurity(value: boolean) {
    setNfcModeActive(value);
    await setSecurityModeActive(value);

    if (value) {
      Alert.alert(
        "🛡️ Proteção NFC Ativada",
        "Ao aproximar sua Tag NFC, o app abrirá direto na contagem de emergência.",
      );
    }
  }

  function handleManualEmergency() {
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

        {/* STATUS SEGUNDO PLANO (NFC) */}
        <View
          style={[styles.statusCard, nfcModeActive && styles.statusCardActive]}
        >
          <View
            style={[
              styles.statusIcon,
              nfcModeActive && styles.statusIconActive,
            ]}
          >
            <Text style={styles.statusEmoji}>
              {nfcModeActive ? "🛡️" : "📡"}
            </Text>
          </View>

          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>
              {nfcModeActive ? "Proteção NFC Ativa" : "Proteção NFC Desativada"}
            </Text>

            <Text style={styles.statusDescription}>
              {nfcModeActive
                ? "Pronto para acionamento por aproximacão de Tag."
                : "Ative a chave ao lado para permitir gatilho por NFC."}
            </Text>
          </View>

          <Switch
            value={nfcModeActive}
            onValueChange={toggleNfcSecurity}
            trackColor={{ false: "#D1C4E9", true: "#7048B8" }}
            thumbColor={nfcModeActive ? "#FFFFFF" : "#F4F3F4"}
          />
        </View>

        {/* BOTÃO PRINCIPAL */}
        <View style={styles.securitySection}>
          <Text style={styles.sectionTitle}>Emergência Direta</Text>

          <Text style={styles.sectionDescription}>
            Toque abaixo para iniciar o temporizador de segurança imediatamente.
          </Text>

          <Pressable
            onPress={handleManualEmergency}
            style={({ pressed }) => [
              styles.securityButton,
              pressed && styles.securityButtonPressed,
            ]}
          >
            <View style={styles.securityButtonCircle}>
              <Text style={styles.securityEmoji}>🆘</Text>
            </View>

            <Text style={styles.securityButtonTitle}>ACIONAR AGORA</Text>

            <Text style={styles.securityButtonSubtitle}>
              Toque para iniciar temporizador
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
              {hasMessages && <View style={styles.badgeDot} />}
            </View>

            <Text style={styles.quickCardTitle}>Contato</Text>

            <Text style={styles.quickCardDescription}>
              Pessoa de emergência
            </Text>
          </Pressable>
        </View>

        {/* INFORMAÇÃO */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🛡️ Como funciona a Tag NFC?</Text>

          <Text style={styles.infoText}>
            Com a chave de proteção ativa, encostar o smartphone na Tag NFC abre
            o aplicativo direto no temporizador. Se não houver cancelamento, sua
            localização e alerta serão enviados.
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
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#E8F6EC",
    justifyContent: "center",
    alignItems: "center",
  },

  statusIconActive: {
    backgroundColor: "#E0D1F5",
  },

  statusEmoji: {
    fontSize: 22,
  },

  statusInfo: {
    flex: 1,
    marginHorizontal: 12,
  },

  statusTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#211A2D",
  },

  statusDescription: {
    fontSize: 12,
    color: "#77717F",
    lineHeight: 16,
    marginTop: 2,
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
    position: "relative",
  },

  quickEmoji: {
    fontSize: 21,
  },

  badgeDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#7048B8",
    borderWidth: 2,
    borderColor: "#FFFFFF",
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
