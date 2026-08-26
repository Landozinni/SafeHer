import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { auth } from "../services/firebase/auth";
import { isSecurityModeActive } from "../services/securityService";

export default function IndexScreen() {
  useEffect(() => {
    // Escuta se o usuário está logado no Firebase
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Usuário não logado -> vai para a tela de login
        router.replace("/(auth)/login");
        return;
      }

      // Usuário logado -> checa se o modo NFC/Segundo Plano foi ativado na Home
      const isBgSecurityActive = await isSecurityModeActive();

      if (isBgSecurityActive) {
        // Se a proteção estiver LIGADA, abre direto no temporizador
        router.replace("/(app)/emergency");
      } else {
        // Se a proteção estiver DESLIGADA, abre a Home normalmente
        router.replace("/(app)/home");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#7048B8" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F7FC",
  },
});
