import { Pressable, StyleSheet, Text, View } from "react-native";

import { Conversation } from "../../../../services/chat/types";

type Props = {
  conversation: Conversation;
  contactName: string;
  onPress: () => void;
};

export default function ConversationCard({
  conversation,
  contactName,
  onPress,
}: Props) {
  function formatTime() {
    if (!conversation.lastMessageAt) return "";

    const date = conversation.lastMessageAt.toDate();

    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {contactName.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.center}>
        <Text numberOfLines={1} style={styles.name}>
          {contactName}
        </Text>

        <Text numberOfLines={1} style={styles.message}>
          {conversation.lastMessage || "Nenhuma mensagem"}
        </Text>
      </View>

      <Text style={styles.time}>{formatTime()}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  pressed: {
    opacity: 0.7,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E9E1F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  avatarText: {
    color: "#7048B8",
    fontWeight: "800",
    fontSize: 22,
  },

  center: {
    flex: 1,
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#211A2D",
  },

  message: {
    marginTop: 5,
    color: "#77717F",
    fontSize: 13,
  },

  time: {
    color: "#999",
    fontSize: 12,
  },
});
