import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    where,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

export async function createUserProfile(
  uid: string,
  name: string,
  email: string,
  phone: string,
) {
  await setDoc(doc(db, "users", uid), {
    uid,
    name,
    email,
    phone,
    emergencyContact: "",
    emergencyMessage: "Preciso de ajuda. Estou em uma situação de perigo.",
    createdAt: serverTimestamp(),
  });
}

export async function getUserProfile(uid: string) {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data();
}
export async function findUserByPhone(phone: string) {
  const usersRef = collection(db, "users");

  const q = query(usersRef, where("phone", "==", phone));

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const document = snapshot.docs[0];

  return {
    id: document.id,
    ...document.data(),
  };
}
export async function updateEmergencySettings(
  uid: string,
  name: string,
  emergencyContact: string,
  emergencyMessage: string,
) {
  await setDoc(
    doc(db, "users", uid),
    {
      name,
      emergencyContact,
      emergencyMessage,
    },
    {
      merge: true,
    },
  );
}
