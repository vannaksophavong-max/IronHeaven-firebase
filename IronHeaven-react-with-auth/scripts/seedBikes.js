// Run once to copy src/data/bikes.js into Firestore.
// Usage: node scripts/seedBikes.js
//
// Needs a Firebase service account key (Project settings > Service accounts
// > Generate new private key) saved as scripts/serviceAccountKey.json.
// That file is gitignored — never commit it.

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { bikes } from "../src/data/bikes.js";

const serviceAccount = JSON.parse(
  readFileSync(new URL("./serviceAccountKey.json", import.meta.url))
);

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function seed() {
  const batch = db.batch();
  for (const [id, bike] of Object.entries(bikes)) {
    // Firestore doesn't allow arrays nested inside arrays, so convert
    // specs from [[label, value], ...] to [{label, value}, ...].
    const firestoreBike = {
      ...bike,
      specs: (bike.specs || []).map(([label, value]) => ({ label, value })),
    };
    batch.set(db.collection("bikes").doc(id), firestoreBike);
  }
  await batch.commit();
  console.log(`Seeded ${Object.keys(bikes).length} bikes into Firestore.`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
