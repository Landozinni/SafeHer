import { TextInput, StyleSheet, TextInputProps } from "react-native";

export function CustomInput(props: TextInputProps) {
  return (
    <TextInput {...props} style={styles.input} placeholderTextColor="#999" />
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#DDDDDD",

    borderRadius: 12,

    padding: 16,

    marginBottom: 16,

    fontSize: 16,
  },
});
