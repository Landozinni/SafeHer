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
  addEmergencyContact,
  findUserByEmail,
  getUserProfile,
  removeEmergencyContact,
  updateProfileInfo,
} from "../../services/user/userService";

interface Contact {
  uid: string;
  email: string;
  name?: string;
}

export default function ProfileScreen() {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [emergencyContacts, setEmergencyContacts] = useState<Contact[]>([]);
  const [emergencyMessage, setEmergencyMessage] = useState(
    "Preciso de ajuda. Estou em uma situação de perigo.",
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingContact, setAddingContact] = useState(false);

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
          setEmergencyContacts(profile.emergencyContacts || []);
          setEmergencyMessage(
            profile.emergencyMessage ||
              "Preciso de ajuda. Estou em uma situação de perigo.",
          );
        }
      } catch (error: any) {
        Alert.alert("Erro", "Não foi possível carregar seus dados.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  async function handleAddContact() {
    const emailClean = newContactEmail.trim().toLowerCase();

    if (!emailClean) {
      Alert.alert("E-mail em branco", "Digite o e-mail do contato.");
      return;
    }

    if (emailClean === user?.email?.toLowerCase()) {
      Alert.alert(
        "Contato inválido",
        "Você não pode se adicionar como contato de emergência.",
      );
      return;
    }

    const alreadyExists = emergencyContacts.some(
      (c) => c.email.toLowerCase() === emailClean,
    );

    if (alreadyExists) {
      Alert.alert("Contato já cadastrado", "Este e-mail já está na sua lista.");
      return;
    }

    try {
      setAddingContact(true);
      const foundUser = await findUserByEmail(emailClean);

      if (!foundUser) {
        Alert.alert(
          "Contato não encontrado",
          "Este e-mail não pertence a uma conta cadastrada no SafeHer.",
        );
        return;
      }

      const foundUserData = foundUser as any;

      const newContact: Contact = {
        uid: foundUserData.id,
        email: emailClean,
        name: foundUserData.name || emailClean.split("@")[0],
      };

      await addEmergencyContact(
        user!.uid,
        foundUserData.id,
        emailClean,
        foundUserData.name,
      );

      setEmergencyContacts((prev) => [...prev, newContact]);
      setNewContactEmail("");

      Alert.alert(
        "Sucesso! 🛡️",
        "Contato de emergência adicionado com sucesso.",
      );
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.message || "Não foi possível adicionar o contato.",
      );
    } finally {
      setAddingContact(false);
    }
  }

  async function handleRemoveContact(contact: Contact) {
    Alert.alert(
      "Remover contato",
      `Deseja remover ${contact.email} dos seus contatos de emergência?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              await removeEmergencyContact(user!.uid, contact);
              setEmergencyContacts((prev) =>
                prev.filter((c) => c.uid !== contact.uid),
              );
            } catch (error) {
              Alert.alert("Erro", "Não foi possível remover o contato.");
            }
          },
        },
      ],
    );
  }

  async function handleSave() {
    if (!user) return;

    if (!name.trim()) {
      Alert.alert("Nome obrigatório", "Digite seu nome.");
      return;
    }

    try {
      setSaving(true);
      await updateProfileInfo(user.uid, name.trim(), emergencyMessage.trim());
      Alert.alert("Tudo certo! 🛡️", "Suas informações foram salvas.");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar suas informações.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    Alert.alert("Sair da conta", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
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
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Meu perfil</Text>
          <View style={styles.headerSpace} />
        </View>

        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {name ? name.charAt(0).toUpperCase() : "U"}
            </Text>
          </View>
          <Text style={styles.profileName}>{name || "Usuária"}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

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
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Contatos de emergência</Text>
            <Text style={styles.sectionIcon}>🆘</Text>
          </View>

          <Text style={styles.sectionDescription}>
            Estas pessoas receberão seus alertas quando o modo segurança for
            ativado.
          </Text>

          {emergencyContacts.map((contact) => (
            <View key={contact.uid} style={styles.contactCard}>
              <View>
                <Text style={styles.contactName}>
                  {contact.name || contact.email}
                </Text>
                <Text style={styles.contactEmail}>{contact.email}</Text>
              </View>
              <Pressable onPress={() => handleRemoveContact(contact)}>
                <Text style={styles.removeText}>✕</Text>
              </Pressable>
            </View>
          ))}

          <Text style={styles.label}>Adicionar novo contato</Text>
          <View style={styles.addContactRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              value={newContactEmail}
              onChangeText={setNewContactEmail}
              placeholder="email@contato.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Pressable
              style={styles.addButton}
              onPress={handleAddContact}
              disabled={addingContact}
            >
              {addingContact ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.addButtonText}>+</Text>
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mensagem de emergência</Text>
            <Text style={styles.sectionIcon}>💬</Text>
          </View>

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

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair da conta</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F7FC" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F7FC",
  },
  content: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 40 },
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
  backText: { fontSize: 32, lineHeight: 34, color: "#211A2D" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#211A2D" },
  headerSpace: { width: 42 },
  avatarContainer: { alignItems: "center", marginBottom: 28 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#E9E1F8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 34, fontWeight: "800", color: "#7048B8" },
  profileName: { fontSize: 21, fontWeight: "800", color: "#211A2D" },
  email: { fontSize: 13, color: "#88818F", marginTop: 4 },
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
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#211A2D" },
  sectionIcon: { fontSize: 21 },
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
  contactCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F0EAF8",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  contactName: { fontSize: 15, fontWeight: "700", color: "#211A2D" },
  contactEmail: { fontSize: 12, color: "#7048B8", marginTop: 2 },
  removeText: { fontSize: 16, color: "#C94C61", fontWeight: "700", padding: 4 },
  addContactRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#7048B8",
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: { fontSize: 24, color: "#FFFFFF", fontWeight: "700" },
  messageInput: { height: 110, paddingTop: 14, paddingBottom: 14 },
  saveButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: "#7048B8",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  saveText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  logoutButton: {
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  logoutText: { color: "#C94C61", fontSize: 15, fontWeight: "700" },
  pressed: { opacity: 0.7 },
});
