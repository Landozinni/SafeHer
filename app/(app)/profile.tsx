import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { router } from "expo-router";

import { useAuth } from "../../context/AuthContext";
import { logout } from "../../services/firebase/auth";
import {
    findUserByPhone,
    getUserProfile,
    updateEmergencySettings,
} from "../../services/user/userService";

export default async function ProfileScreen() {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyMessage, setEmergencyMessage] = useState(
    "Preciso de ajuda. Estou em uma situação de perigo.",
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);

        if (profile) {
          setName(profile.name || "");
          setEmergencyContact(profile.emergencyContact || "");
          setEmergencyMessage(
            profile.emergencyMessage ||
              "Preciso de ajuda. Estou em uma situação de perigo.",
          );
        }
      } catch (error) {
        console.log("Erro ao carregar perfil:", error);

        Alert.alert("Erro", "Não foi possível carregar seus dados.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);
  const contact = await findUserByPhone(emergencyContact.trim());

  if (!contact) {
    Alert.alert(
      "Contato não encontrado",
      "Esse número não pertence a uma conta do SafeHer.",
    );
    return;
  }

  if (contact.id === user!.uid) {
    Alert.alert(
      "Contato inválido",
      "Você não pode adicionar sua própria conta como contato de emergência.",
    );
    return;
  }
  async function handleSave() {
    if (!user) {
      return;
    }
    if (!name.trim()) {
      Alert.alert("Nome obrigatório", "Digite seu nome.");
      return;
    }

    if (!emergencyContact.trim()) {
      Alert.alert(
        "Contato de emergência",
        "Digite o telefone do seu contato de emergência.",
      );
      return;
    }

    if (!emergencyMessage.trim()) {
      Alert.alert(
        "Mensagem obrigatória",
        "Digite a mensagem que será enviada em uma emergência.",
      );
      return;
    }

    try {
      setSaving(true);

      await updateEmergencySettings(
        user.uid,
        name.trim(),
        emergencyContact.trim(),
        emergencyMessage.trim(),
      );

      Alert.alert("Tudo certo! 🛡️", "Suas informações foram salvas.");
    } catch (error) {
      console.log("Erro ao salvar:", error);

      Alert.alert("Erro", "Não foi possível salvar suas informações.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    Alert.alert("Sair da conta", "Tem certeza que deseja sair?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/(auth)/login");
          } catch {
            Alert.alert("Erro", "Não foi possível sair da conta.");
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7048B8" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* CABEÇALHO */}

        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>Meu perfil</Text>

          <View style={styles.headerSpace} />
        </View>

        {/* AVATAR */}

        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {name ? name.charAt(0).toUpperCase() : "U"}
            </Text>
          </View>

          <Text style={styles.profileName}>{name || "Usuária"}</Text>

          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* DADOS DA CONTA */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seus dados</Text>

          <Text style={styles.label}>Nome</Text>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Seu nome"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>E-mail</Text>

          <View style={styles.disabledInput}>
            <Text style={styles.disabledText}>{user?.email}</Text>
          </View>
        </View>

        {/* CONTATO DE EMERGÊNCIA */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Contato de emergência</Text>

            <Text style={styles.sectionIcon}>🆘</Text>
          </View>

          <Text style={styles.sectionDescription}>
            Essa pessoa receberá seu alerta quando o modo segurança for
            acionado.
          </Text>

          <Text style={styles.label}>Telefone</Text>

          <TextInput
            style={styles.input}
            value={emergencyContact}
            onChangeText={setEmergencyContact}
            placeholder="(00) 00000-0000"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>

        {/* MENSAGEM */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mensagem de emergência</Text>

            <Text style={styles.sectionIcon}>💬</Text>
          </View>

          <Text style={styles.sectionDescription}>
            Essa mensagem será utilizada no alerta.
          </Text>

          <TextInput
            style={[styles.input, styles.messageInput]}
            value={emergencyMessage}
            onChangeText={setEmergencyMessage}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* SALVAR */}

        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.pressed,
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveText}>Salvar alterações</Text>
          )}
        </Pressable>

        {/* SAIR */}

        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.pressed,
          ]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Sair da conta</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7FC",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F7FC",
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  backText: {
    fontSize: 32,
    lineHeight: 34,
    color: "#211A2D",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#211A2D",
  },

  headerSpace: {
    width: 42,
  },

  avatarContainer: {
    alignItems: "center",
    marginBottom: 28,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#E9E1F8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  avatarText: {
    fontSize: 34,
    fontWeight: "800",
    color: "#7048B8",
  },

  profileName: {
    fontSize: 21,
    fontWeight: "800",
    color: "#211A2D",
  },

  email: {
    fontSize: 13,
    color: "#88818F",
    marginTop: 4,
  },

  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#211A2D",
  },

  sectionIcon: {
    fontSize: 21,
  },

  sectionDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: "#77717F",
    marginTop: 6,
    marginBottom: 12,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#413A4A",
    marginTop: 14,
    marginBottom: 7,
  },

  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2DEE8",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#211A2D",
  },

  disabledInput: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#F1EFF4",
    justifyContent: "center",
    paddingHorizontal: 15,
  },

  disabledText: {
    fontSize: 15,
    color: "#8B858F",
  },

  messageInput: {
    height: 110,
    paddingTop: 14,
    paddingBottom: 14,
  },

  saveButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: "#7048B8",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  logoutButton: {
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },

  logoutText: {
    color: "#C94C61",
    fontSize: 15,
    fontWeight: "700",
  },

  pressed: {
    opacity: 0.7,
  },
});
