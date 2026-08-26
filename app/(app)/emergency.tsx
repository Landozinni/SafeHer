import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import * as Location from "expo-location";
import { router } from "expo-router";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { sendEmergencyAlertToAllContacts } from "../../services/chat/chatService";
import { db } from "../../services/firebase/firestore";

export default function EmergencyScreen() {
  const [countdown, setCountdown] = useState(5);
  const [gettingLocation, setGettingLocation] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }

          triggerEmergency();

          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  function cancelEmergency() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    router.back();
  }

  async function triggerEmergency() {
    try {
      setGettingLocation(true);

      if (!user) {
        Alert.alert("Erro", "Usuário não autenticado.");
        setGettingLocation(false);
        return;
      }

      // 1. Busca os dados do usuário atual no Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      // Pega a lista de contatos do array 'emergencyContacts' ou tenta o campo antigo por segurança
      const emergencyContacts = userData?.emergencyContacts || [];
      const singleContactUid = userData?.emergencyContactUid;
      const customAlertMessage =
        userData?.emergencyMessage || "Preciso de ajuda urgente!";

      // 2. Tenta obter a localização com segurança
      let mapsLink = "Localização não informada.";
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === Location.PermissionStatus.GRANTED) {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          mapsLink = `https://www.google.com/maps/search/?api=1&query=${location.coords.latitude},${location.coords.longitude}`;
        }
      } catch (locErr) {
        console.log("Erro ao capturar GPS, enviando sem localização:", locErr);
      }

      // 3. Mapeia os UIDs dos contatos para envio
      let target: any = null;
      if (emergencyContacts.length > 0) {
        target = emergencyContacts.map((c: any) => c.uid);
      } else if (singleContactUid) {
        target = singleContactUid;
      }

      // 4. Dispara o alerta para todos os contatos configurados
      await sendEmergencyAlertToAllContacts(
        user.uid,
        target,
        customAlertMessage,
        mapsLink,
      );

      setGettingLocation(false);

      Alert.alert(
        "🚨 Alerta Enviado",
        "Sua localização e pedido de socorro foram enviados com sucesso para seus contatos de emergência.",
        [
          {
            text: "Abrir mapa",
            onPress: () => {
              if (mapsLink.startsWith("http")) {
                Linking.openURL(mapsLink);
              }
            },
          },
          {
            text: "Voltar para Início",
            onPress: () => {
              router.replace("/(app)/home");
            },
          },
        ],
      );
    } catch (error: any) {
      console.log("ERRO REAL AO PROCESSAR EMERGÊNCIA:", error);

      setGettingLocation(false);

      Alert.alert(
        "Erro",
        error?.message ||
          "Não foi possível processar o alerta de emergência. Tente novamente.",
        [
          {
            text: "Voltar",
            onPress: () => router.replace("/(app)/home"),
          },
        ],
      );
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.top}>
          <Text style={styles.logo}>📍</Text>

          <Text style={styles.title}>Modo segurança</Text>

          <Text style={styles.description}>
            Se você estiver em perigo, fique tranquila. O SafeHer está
            preparando o alerta.
          </Text>
        </View>

        <View style={styles.timerContainer}>
          {gettingLocation ? (
            <>
              <View style={styles.locationCircle}>
                <Text style={styles.locationEmoji}>📍</Text>
              </View>

              <Text style={styles.locationTitle}>Enviando alerta...</Text>

              <Text style={styles.waitingText}>
                Obtendo localização e notificando seus contatos de emergência.
              </Text>
            </>
          ) : (
            <>
              <View style={styles.timerCircle}>
                <Text style={styles.timer}>{countdown}</Text>

                <Text style={styles.seconds}>segundos</Text>
              </View>

              <Text style={styles.waitingText}>
                O alerta será disparado quando a contagem terminar.
              </Text>
            </>
          )}
        </View>

        {!gettingLocation && (
          <View style={styles.bottom}>
            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.pressed,
              ]}
              onPress={cancelEmergency}
            >
              <Text style={styles.cancelText}>CANCELAR</Text>
            </Pressable>

            <Text style={styles.cancelDescription}>
              Se você ativou o modo segurança por engano, toque acima para
              cancelar.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7FC",
  },

  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingVertical: 35,
  },

  top: {
    alignItems: "center",
    marginTop: 25,
  },

  logo: {
    fontSize: 48,
    marginBottom: 18,
  },

  title: {
    fontSize: 29,
    fontWeight: "800",
    color: "#211A2D",
    textAlign: "center",
  },

  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#77717F",
    textAlign: "center",
    marginTop: 12,
    maxWidth: 330,
  },

  timerContainer: {
    alignItems: "center",
  },

  timerCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#7048B8",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#7048B8",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 10,
  },

  timer: {
    color: "#FFFFFF",
    fontSize: 76,
    fontWeight: "800",
  },

  seconds: {
    color: "#E9E1F8",
    fontSize: 15,
    marginTop: -8,
  },

  locationCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#E9E1F8",
    justifyContent: "center",
    alignItems: "center",
  },

  locationEmoji: {
    fontSize: 65,
  },

  locationTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#211A2D",
    marginTop: 22,
  },

  waitingText: {
    color: "#77717F",
    fontSize: 13,
    textAlign: "center",
    marginTop: 22,
    maxWidth: 280,
    lineHeight: 19,
  },

  bottom: {
    alignItems: "center",
  },

  cancelButton: {
    width: "100%",
    height: 58,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#7048B8",
    justifyContent: "center",
    alignItems: "center",
  },

  pressed: {
    opacity: 0.7,
  },

  cancelText: {
    color: "#7048B8",
    fontSize: 16,
    fontWeight: "800",
  },

  cancelDescription: {
    color: "#99929F",
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 18,
  },
});
