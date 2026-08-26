import {
    addDoc,
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/firestore";
import { Message } from "./types";

export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string,
) {
  const message = text.trim();

  if (!message) return;

  await addDoc(collection(db, "conversations", conversationId, "messages"), {
    senderId,

    text: message,

    createdAt: serverTimestamp(),

    readBy: [senderId],
  });

  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: message,

    lastMessageSender: senderId,

    lastMessageAt: serverTimestamp(),
  });
}

export function listenMessages(
  conversationId: string,
  callback: (messages: Message[]) => void,
) {
  const q = query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("createdAt"),
  );

  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Message, "id">),
      })),
    );
  });
}
