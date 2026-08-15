// Sets CORS on the Firebase Storage bucket so the browser (localhost:5173)
// can upload bike photos. Firebase buckets don't ship with CORS configured,
// which is why the admin photo upload failed with a CORS preflight error.
//
// Usage: node scripts/set-bucket-cors.mjs

import { Storage } from "@google-cloud/storage";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(
  readFileSync(new URL("./serviceAccountKey.json", import.meta.url))
);

const storage = new Storage({ projectId: serviceAccount.project_id });
const bucket = storage.bucket("ironheaven-2d4a2.firebasestorage.app");

const cors = [
  {
    origin: ["*"],
    method: ["GET", "HEAD", "PUT", "POST", "DELETE"],
    responseHeader: ["*"],
    maxAgeSeconds: 3600,
  },
];

await bucket.setCorsConfiguration(cors);
console.log("CORS set:", JSON.stringify(cors, null, 2));
