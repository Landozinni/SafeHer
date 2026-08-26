import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";

import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "android") {
      // Oculta os botões do sistema
      NavigationBar.setVisibilityAsync("hidden");

      // Faz a barra reaparecer só temporariamente ao deslizar para cima
      NavigationBar.setBehaviorAsync("overlay-swipe");
    }
  }, []);

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>

      <StatusBar style="dark" />
    </AuthProvider>
  );
}
