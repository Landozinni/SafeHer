import {
    addDoc,
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    where,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

export async function findConversation(userId: string, contactId: string) {
  const conversationsRef = collection(db, "conversations");

  const q = query(
    conversationsRef,
    where("participants", "array-contains", userId),
  );

  const snapshot = await getDocs(q);

  for (const document of snapshot.docs) {
    const data = document.data();

    if (data.participants?.includes(contactId)) {
      return {
        id: document.id,
        ...data,
      };
    }
  }

  return null;
}

export async function createConversation(userId: string, contactId: string) {
  const existingConversation = await findConversation(userId, contactId);

  if (existingConversation) {
    return existingConversation.id;
  }

  const conversationRef = await addDoc(collection(db, "conversations"), {
    participants: [userId, contactId],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return conversationRef.id;
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  receiverId: string,
  text: string,
  isEmergency = false,
  latitude?: number,
  longitude?: number,
) {
  await addDoc(collection(db, "conversations", conversationId, "messages"), {
    senderId,
    receiverId,
    text,
    isEmergency,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
    createdAt: serverTimestamp(),
  });
}

export async function getMessages(conversationId: string) {
  const messagesRef = collection(
    db,
    "conversations",
    conversationId,
    "messages",
  );

  const q = query(messagesRef, orderBy("createdAt", "asc"), limit(100));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}
