import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firestore";

export interface EmergencyContact {
  uid: string;
  email: string;
  name?: string;
}

export async function createUserProfile(
  userUid: string,
  data: { name: string; email: string },
) {
  const userRef = doc(db, "users", userUid);
  await setDoc(
    userRef,
    {
      uid: userUid,
      name: data.name,
      email: data.email.toLowerCase(),
      emergencyContacts: [],
      emergencyMessage: "Preciso de ajuda urgente!",
      createdAt: new Date(),
    },
    { merge: true },
  );
}

export async function getUserProfile(userUid: string) {
  const userRef = doc(db, "users", userUid);
  const userSnapshot = await getDoc(userRef);

  if (userSnapshot.exists()) {
    return userSnapshot.data();
  }

  return null;
}

export async function findUserByEmail(email: string) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email.trim().toLowerCase()));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const docSnap = querySnapshot.docs[0];
    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  }

  return null;
}

export async function updateProfileInfo(
  userUid: string,
  name: string,
  emergencyMessage: string,
) {
  const userRef = doc(db, "users", userUid);
  await updateDoc(userRef, {
    name,
    emergencyMessage,
  });
}

export async function addEmergencyContact(
  userUid: string,
  contactUid: string,
  contactEmail: string,
  contactName?: string,
) {
  const userRef = doc(db, "users", userUid);
  await updateDoc(userRef, {
    emergencyContacts: arrayUnion({
      uid: contactUid,
      email: contactEmail.toLowerCase(),
      name: contactName || contactEmail.split("@")[0],
    }),
  });
}

export async function removeEmergencyContact(
  userUid: string,
  contact: EmergencyContact,
) {
  const userRef = doc(db, "users", userUid);
  await updateDoc(userRef, {
    emergencyContacts: arrayRemove(contact),
  });
}
