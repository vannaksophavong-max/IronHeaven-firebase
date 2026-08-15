import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./config";

// Uploads a bike photo to Storage under bikes/{bikeId}/... and returns
// its public download URL. Write access is admin-only — enforced by
// storage.rules, not just the UI.
export async function uploadBikePhoto(bikeId, file) {
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const path = `bikes/${bikeId}/${Date.now()}-${safeName}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

// Optional cleanup: delete a previously uploaded photo by its full URL.
// Safe to call even if the URL doesn't point at Storage (e.g. old seeded
// bikes using a local /images/... path) — it just fails silently.
export async function deleteBikePhotoByUrl(url) {
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch {
    // Not a Storage URL, or already gone — nothing to do.
  }
}
