import { doc, getDoc, setDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import { db } from "./config";

// One doc per user at users/{uid}, holding profile + role.
// Auth (email/password/session) lives in Firebase Auth itself — this is
// just the extra data (name, role) Firebase Auth doesn't store.

export async function createUserProfile(uid, { name, email }) {
  await setDoc(doc(db, "users", uid), {
    name,
    email,
    role: "customer", // default role; promote to "admin" manually in Firestore console
    createdAt: Date.now(),
  });
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

// Admin-only (enforced by firestore.rules): list every registered user.
export async function getAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

// Admin-only (enforced by firestore.rules): promote/demote a user.
export async function updateUserRole(uid, role) {
  await updateDoc(doc(db, "users", uid), { role });
}
