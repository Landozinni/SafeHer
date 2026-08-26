import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../../../context/AuthContext";
import {
  getOrCreateConversation,
  listenToMessages,
  sendMessage,
} from "../../../services/chat/chatService";

function FormattedMessageText({ text, isMe }: { text: string; isMe: boolean }) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return (
    <Text style={[styles.messageText, isMe && styles.myMessageText]}>
      {parts.map((part, index) => {
        if (urlRegex.test(part)) {
          return (
            <Text
              key={index}
              style={[
                styles.linkText,
                isMe ? styles.myLinkText : styles.theirLinkText,
              ]}
              onPress={() => Linking.openURL(part)}
            >
              {part}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
}

export default function ChatScreen() {
  const { conversationId, contactName } = useLocalSearchParams<{
    conversationId: string;
    contactName?: string;
  }>();
  const { user } = useAuth();

  const [activeConversationId, setActiveConversationId] = useState(
    conversationId || "",
  );
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) return;

    setActiveConversationId(conversationId);

    if (conversationId.startsWith("temp_")) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const unsubscribe = listenToMessages(conversationId, (data) => {
      setMessages(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [conversationId]);

  useEffect(() => {
    if (!activeConversationId || activeConversationId.startsWith("temp_")) {
      return;
    }

    const unsubscribe = listenToMessages(activeConversationId, (data) => {
      setMessages(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeConversationId]);

  async function handleSend() {
    if (!text.trim() || !user || !activeConversationId) return;

    const currentText = text;
    setText("");

    let targetId = activeConversationId;

    if (activeConversationId.startsWith("temp_")) {
      const contactUid = activeConversationId.replace("temp_", "");
      targetId = await getOrCreateConversation(user.uid, contactUid);
      setActiveConversationId(targetId);
    }

    await sendMessage(targetId, user.uid, currentText);
  }

  function renderMessage({ item }: { item: any }) {
    const isMe = item.senderId === user?.uid;

    return (
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <FormattedMessageText text={item.text} isMe={isMe} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>{contactName || "Contato"}</Text>
            <Text style={styles.statusText}>Protegida pelo SafeHer</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7048B8" />
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
          />
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="#999"
            value={text}
            onChangeText={setText}
            multiline
          />
          <Pressable style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F7FC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2DEE8",
  },
  backButton: { width: 40, height: 40, justifyContent: "center" },
  backText: { fontSize: 32, color: "#211A2D" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#211A2D" },
  statusText: { fontSize: 11, color: "#7048B8", fontWeight: "600" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  messageList: { padding: 16, gap: 10 },
  messageBubble: {
    maxWidth: "80%",
    padding: 14,
    borderRadius: 18,
    marginBottom: 4,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#7048B8",
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E2DEE8",
  },
  messageText: { fontSize: 15, color: "#211A2D", lineHeight: 21 },
  myMessageText: { color: "#FFFFFF" },
  linkText: {
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  myLinkText: {
    color: "#E9E1F8",
  },
  theirLinkText: {
    color: "#7048B8",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#E2DEE8",
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: "#F1EFF4",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    color: "#211A2D",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#7048B8",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: { color: "#FFFFFF", fontSize: 16, marginLeft: 2 },
});
