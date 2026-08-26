import { doc, getDoc } from "firebase/firestore";

import { db } from "../firebase/firestore";

type ChatUser = {
  uid: string;
  name?: string;
};

export async function getUser(uid: string): Promise<ChatUser | null> {
  const snapshot = await getDoc(doc(db, "users", uid));

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return {
    uid,
    name: typeof data.name === "string" ? data.name : undefined,
  };
}
