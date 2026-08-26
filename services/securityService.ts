import AsyncStorage from "@react-native-async-storage/async-storage";

const SECURITY_MODE_KEY = "@safeher_nfc_security_mode";

export async function setSecurityModeActive(active: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(SECURITY_MODE_KEY, JSON.stringify(active));
  } catch (error) {
    console.error("Erro ao salvar modo NFC:", error);
  }
}

export async function isSecurityModeActive(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(SECURITY_MODE_KEY);
    return value ? JSON.parse(value) : false;
  } catch (error) {
    console.error("Erro ao ler modo NFC:", error);
    return false;
  }
}
