import { Pressable, Text, StyleSheet } from "react-native";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <Pressable
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    backgroundColor: "#6A1B9A",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonDisabled: {
    backgroundColor: "#B39DDB",
  },

  text: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
