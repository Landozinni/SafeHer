import { View, Text, StyleSheet } from "react-native";

export function Logo() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🛡️</Text>

      <Text style={styles.title}>SafeHer</Text>

      <Text style={styles.subtitle}>Sua segurança em primeiro lugar</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 40,
  },

  icon: {
    fontSize: 64,
  },

  title: {
    marginTop: 10,
    fontSize: 34,
    fontWeight: "bold",
    color: "#6A1B9A",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 16,
    color: "#777",
  },
});
