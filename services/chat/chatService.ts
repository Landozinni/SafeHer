import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firestore";
import { Conversation } from "./types";

export interface Contact {
  uid: string;
  email?: string;
  name?: string;
}

export async function getOrCreateConversation(
  userUid: string,
  contactUid: string,
): Promise<string> {
  const conversationsRef = collection(db, "conversations");
  const q = query(
    conversationsRef,
    where("participants", "array-contains", userUid),
  );

  const snapshot = await getDocs(q);

  for (const document of snapshot.docs) {
    const data = document.data();
    if (data.participants?.includes(contactUid)) {
      return document.id;
    }
  }

  const conversation = await addDoc(conversationsRef, {
    participants: [userUid, contactUid],
    createdAt: serverTimestamp(),
    lastMessage: "",
    lastMessageAt: null,
  });

  return conversation.id;
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string,
) {
  const cleanText = text.trim();
  if (!cleanText) return;

  const messagesRef = collection(
    db,
    "conversations",
    conversationId,
    "messages",
  );

  await addDoc(messagesRef, {
    senderId,
    text: cleanText,
    createdAt: serverTimestamp(),
  });

  const conversationRef = doc(db, "conversations", conversationId);
  await updateDoc(conversationRef, {
    lastMessage: cleanText,
    lastMessageAt: serverTimestamp(),
  });
}

export function listenToUserConversations(
  userId: string,
  onUpdate: (conversations: Conversation[]) => void,
) {
  const conversationsRef = collection(db, "conversations");
  const q = query(
    conversationsRef,
    where("participants", "array-contains", userId),
  );

  return onSnapshot(
    q,
    async (snapshot) => {
      const existingConversations = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      })) as Conversation[];

      try {
        const userDocRef = doc(db, "users", userId);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const emergencyContacts: any[] = userData.emergencyContacts || [];

          for (const contact of emergencyContacts) {
            const contactUid = contact.uid;
            if (!contactUid) continue;

            const alreadyHasConversation = existingConversations.some((c) =>
              c.participants?.includes(contactUid),
            );

            if (!alreadyHasConversation) {
              existingConversations.push({
                id: `temp_${contactUid}`,
                participants: [userId, contactUid],
                lastMessage: "Contato de emergência cadastrado",
                lastMessageAt: null,
                isPlaceholder: true,
              } as any);
            }
          }
        }
      } catch (err) {
        console.error("Erro ao buscar contatos de emergência:", err);
      }

      onUpdate(existingConversations);
    },
    (error) => {
      console.error("Erro ao escutar conversas do usuário:", error);
    },
  );
}

export function listenToMessages(
  conversationId: string,
  callback: (messages: any[]) => void,
) {
  const messagesRef = collection(
    db,
    "conversations",
    conversationId,
    "messages",
  );

  const q = query(messagesRef, orderBy("createdAt", "asc"));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));

    callback(messages);
  });
}

export async function sendEmergencyAlertToContact(
  senderUid: string,
  contactUid: string,
  alertMessage: string,
  locationText?: string,
) {
  let fullText = `🚨 ALERTA DE EMERGÊNCIA 🚨\n\n${alertMessage}`;
  if (locationText) {
    fullText += `\n\n📍 Localização atual:\n${locationText}`;
  }

  const conversationId = await getOrCreateConversation(senderUid, contactUid);
  await sendMessage(conversationId, senderUid, fullText);
}

export async function sendEmergencyAlertToAllContacts(
  senderUid: string,
  targetContact?: string | string[] | null,
  alertMessage: string = "Preciso de ajuda!",
  locationText?: string,
) {
  let fullText = `🚨 ALERTA DE EMERGÊNCIA 🚨\n\n${alertMessage}`;
  if (locationText) {
    fullText += `\n\n📍 Localização atual:\n${locationText}`;
  }

  if (typeof targetContact === "string" && targetContact.trim().length > 0) {
    const conversationId = await getOrCreateConversation(
      senderUid,
      targetContact,
    );
    await sendMessage(conversationId, senderUid, fullText);
    return;
  }

  if (Array.isArray(targetContact) && targetContact.length > 0) {
    const promises = targetContact.map(async (contactUid) => {
      const conversationId = await getOrCreateConversation(
        senderUid,
        contactUid,
      );
      await sendMessage(conversationId, senderUid, fullText);
    });
    await Promise.all(promises);
    return;
  }

  const userRef = doc(db, "users", senderUid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const userData = userSnap.data();
  const contacts: Contact[] = userData.emergencyContacts || [];

  if (contacts.length === 0) {
    throw new Error("Nenhum contato de emergência cadastrado.");
  }

  const promises = contacts.map(async (contact) => {
    const conversationId = await getOrCreateConversation(
      senderUid,
      contact.uid,
    );
    await sendMessage(conversationId, senderUid, fullText);
  });

  await Promise.all(promises);
}
