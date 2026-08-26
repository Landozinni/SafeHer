import {
    addDoc,
    collection,
    getDocs,
    query,
    serverTimestamp,
    where,
} from "firebase/firestore";

import { db } from "../firebase/firestore";
import { Conversation } from "./types";

export async function getOrCreateConversation(
  userUid: string,
  otherUid: string,
) {
  const ref = collection(db, "conversations");

  const q = query(ref, where("participants", "array-contains", userUid));

  const snapshot = await getDocs(q);

  for (const doc of snapshot.docs) {
    const data = doc.data();

    if (data.participants.includes(otherUid)) {
      return doc.id;
    }
  }

  const conversation = await addDoc(ref, {
    participants: [userUid, otherUid],

    lastMessage: "",

    lastMessageSender: "",

    createdAt: serverTimestamp(),

    lastMessageAt: serverTimestamp(),
  });

  return conversation.id;
}

export async function getUserConversations(uid: string) {
  const ref = collection(db, "conversations");

  const q = query(ref, where("participants", "array-contains", uid));

  const snapshot = await getDocs(q);

  const conversations: Conversation[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Conversation, "id">),
  }));

  conversations.sort((a, b) => {
    const first = a.lastMessageAt?.seconds ?? 0;

    const second = b.lastMessageAt?.seconds ?? 0;

    return second - first;
  });

  return conversations;
}
