import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { router } from "expo-router";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import ConversationCard from "./components/ConversationCard";

import { listenToUserConversations } from "../../../services/chat/chatService";
import { Conversation } from "../../../services/chat/types";
import { db } from "../../../services/firebase/firestore";

export default function ChatListScreen() {
  const [loading, setLoading] = useState(true);

  const [conversations, setConversations] = useState<
    (Conversation & { contactName: string })[]
  >([]);

  const user = getAuth().currentUser;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const userUid = user.uid;

    let unsubscribe: (() => void) | undefined;

    async function load() {
      try {
        unsubscribe = listenToUserConversations(userUid, async (list) => {
          const complete = await Promise.all(
            list.map(async (conversation) => {
              const otherUid = conversation.participants.find(
                (uid: string) => uid !== userUid,
              );

              if (!otherUid) {
                return {
                  ...conversation,
                  contactName: "Desconhecido",
                };
              }

              try {
                const userDoc = await getDoc(doc(db, "users", otherUid));
                if (userDoc.exists()) {
                  const data = userDoc.data();
                  return {
                    ...conversation,
                    contactName: data.name || data.email || "Usuário",
                  };
                }
              } catch (err) {
                console.error("Erro ao buscar dados do outro usuário:", err);
              }

              return {
                ...conversation,
                contactName: "Usuário",
              };
            }),
          );

          setConversations(complete);
          setLoading(false);
        });
      } catch (error) {
        console.error("Erro ao carregar conversas:", error);
        setLoading(false);
      }
    }

    load();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.uid]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#7048B8" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.homeButton}
          onPress={() => router.replace("/(app)/home")}
        >
          <Text style={styles.homeButtonText}>⌂</Text>
        </Pressable>

        <Text style={styles.title}>Conversas</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationCard
            conversation={item}
            contactName={item.contactName}
            onPress={() =>
              router.push({
                pathname: "/(app)/chat/[conversationId]",
                params: {
                  conversationId: item.id,
                  contactName: item.contactName,
                },
              })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💬</Text>

            <Text style={styles.emptyTitle}>Nenhuma conversa encontrada</Text>

            <Text style={styles.emptyDescription}>
              Quando alguém iniciar uma conversa, ela aparecerá aqui.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7FC",
    paddingHorizontal: 22,
    paddingTop: 20,
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F7FC",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  homeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E9E1F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  homeButtonText: {
    fontSize: 25,
    color: "#7048B8",
    fontWeight: "700",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#211A2D",
  },

  empty: {
    marginTop: 120,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyEmoji: {
    fontSize: 60,
  },

  emptyTitle: {
    marginTop: 20,
    fontSize: 21,
    fontWeight: "700",
    color: "#211A2D",
  },

  emptyDescription: {
    marginTop: 8,
    color: "#77717F",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 30,
  },
});
