// Local admin API server. Run with: npm run server
//
// Needs a Firebase service account key (Project settings > Service accounts
// > Generate new private key) saved as scripts/serviceAccountKey.json.
// That file is gitignored — never commit it.
//
// The client can't reset another user's password or delete their account
// (Firebase Auth forbids that from the browser), so those privileged
// operations go through this server using the Admin SDK. Every request is
// authenticated with the caller's Firebase ID token and must belong to a
// user whose Firestore role is "admin".

import express from "express";
import cors from "cors";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

// Load the service account from FIREBASE_SERVICE_ACCOUNT (hosted deploys)
// or from scripts/serviceAccountKey.json (local development).
let serviceAccount;
const envJson = process.env.FIREBASE_SERVICE_ACCOUNT;
if (envJson) {
  serviceAccount = JSON.parse(envJson);
} else {
  serviceAccount = JSON.parse(
    readFileSync(new URL("../scripts/serviceAccountKey.json", import.meta.url))
  );
}

initializeApp({ credential: cert(serviceAccount) });
const adminAuth = getAuth();
const db = getFirestore();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

async function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Not signed in." });

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const profile = await db.collection("users").doc(decoded.uid).get();
    if (!profile.exists || profile.data().role !== "admin") {
      return res.status(403).json({ error: "Admin privileges required." });
    }
    req.adminUid = decoded.uid;
    next();
  } catch (err) {
    console.error("requireAdmin failed:", err?.code, err?.message);
    if (err?.code === "app/invalid-credential") {
      return res.status(500).json({ error: credentialError() });
    }
    res.status(401).json({ error: "Invalid session." });
  }
}

function credentialError() {
  return "Firebase rejected the admin credentials. Check that your system clock is correct and scripts/serviceAccountKey.json is valid.";
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// List every auth account, merged with its Firestore profile (name/role).
// Firestore's users/ collection alone misses accounts that never registered
// through the app, so the admin page reads from here instead.
app.get("/api/admin/users", requireAdmin, async (_req, res) => {
  try {
    const profiles = new Map();
    const snap = await db.collection("users").get();
    for (const d of snap.docs) profiles.set(d.id, d.data());

    const users = [];
    let page = await adminAuth.listUsers(1000);
    while (true) {
      for (const u of page.users) {
        const profile = profiles.get(u.uid) || {};
        users.push({
          uid: u.uid,
          email: u.email,
          name: profile.name || u.displayName || "",
          role: profile.role || "customer",
        });
      }
      if (!page.pageToken) break;
      page = await adminAuth.listUsers(1000, page.pageToken);
    }
    res.json(users);
  } catch (err) {
    console.error("listUsers failed:", err?.code, err?.message);
    if (err?.code === "app/invalid-credential") {
      return res.status(500).json({ error: credentialError() });
    }
    res.status(500).json({ error: "Failed to list users." });
  }
});

// Set a user's role. Also creates the Firestore profile if it doesn't exist
// (accounts created in the console have no doc yet).
app.post("/api/admin/users/:uid/role", requireAdmin, async (req, res) => {
  const { uid } = req.params;
  const { role } = req.body || {};
  if (!role || !["admin", "customer"].includes(role)) {
    return res.status(400).json({ error: "Role must be 'admin' or 'customer'." });
  }

  try {
    const authUser = await adminAuth.getUser(uid);
    const ref = db.collection("users").doc(uid);
    const existing = await ref.get();
    if (existing.exists) {
      await ref.update({ role });
    } else {
      await ref.set({
        name: authUser.displayName || "",
        email: authUser.email || "",
        role,
        createdAt: Date.now(),
      });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("setRole failed:", err?.code, err?.message);
    if (err?.code === "app/invalid-credential") {
      return res.status(500).json({ error: credentialError() });
    }
    res.status(404).json({ error: "User not found." });
  }
});

// Set a new password for another user.
app.post("/api/admin/reset-password", requireAdmin, async (req, res) => {
  const { uid, newPassword } = req.body || {};
  if (!uid || !newPassword || newPassword.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters." });
  }
  if (uid === req.adminUid) {
    return res
      .status(400)
      .json({ error: "Use your profile page to change your own password." });
  }

  try {
    await adminAuth.updateUser(uid, { password: newPassword });
    res.json({ ok: true });
  } catch (err) {
    console.error("resetPassword failed:", err?.code, err?.message);
    if (err?.code === "app/invalid-credential") {
      return res.status(500).json({ error: credentialError() });
    }
    res.status(404).json({ error: "User not found." });
  }
});

// Delete a user's auth account and their Firestore profile.
app.delete("/api/admin/users/:uid", requireAdmin, async (req, res) => {
  const { uid } = req.params;
  if (uid === req.adminUid) {
    return res
      .status(400)
      .json({ error: "You can't delete your own account." });
  }

  try {
    await adminAuth.getUser(uid);
    await db.collection("users").doc(uid).delete();
    await adminAuth.deleteUser(uid);
    res.json({ ok: true });
  } catch (err) {
    console.error("deleteUser failed:", err?.code, err?.message);
    if (err?.code === "app/invalid-credential") {
      return res.status(500).json({ error: credentialError() });
    }
    res.status(404).json({ error: "User not found." });
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Server error." });
});

app.listen(PORT, () => {
  console.log(`Admin API listening on http://localhost:${PORT}`);
});
