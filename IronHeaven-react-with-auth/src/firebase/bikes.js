import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./config";

const bikesCol = collection(db, "bikes");

// Read
export async function getAllBikes() {
  const snap = await getDocs(bikesCol);
  return snap.docs.map((d) => ({ docId: d.id, ...d.data() }));
}

export async function getBikeById(id) {
  const snap = await getDoc(doc(db, "bikes", id));
  return snap.exists() ? { docId: snap.id, ...snap.data() } : null;
}

// Write (admin only — enforced by Firestore security rules, not just UI)
export async function createBike(bike) {
  // Use bike.id (e.g. "iron-shadow-750") as the doc id so URLs stay stable
  await setDoc(doc(db, "bikes", bike.id), bike);
}

export async function addBikeAutoId(bike) {
  return addDoc(bikesCol, bike);
}

export async function updateBike(docId, updates) {
  await updateDoc(doc(db, "bikes", docId), updates);
}

export async function deleteBike(docId) {
  await deleteDoc(doc(db, "bikes", docId));
}
