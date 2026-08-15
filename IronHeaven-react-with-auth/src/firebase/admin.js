import { auth } from "./config";

const API_BASE = "/api/admin";

// Calls the local admin API (server/index.js). The server re-checks the
// caller's ID token and admin role, so these are safe to expose to the UI.
async function adminFetch(path, options = {}) {
  const token = await auth.currentUser.getIdToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed.");
  return data;
}

export async function adminResetPassword(uid, newPassword) {
  return adminFetch("/reset-password", {
    method: "POST",
    body: JSON.stringify({ uid, newPassword }),
  });
}

export async function adminDeleteUser(uid) {
  return adminFetch(`/users/${uid}`, { method: "DELETE" });
}

export async function adminListUsers() {
  return adminFetch("/users");
}

export async function adminSetRole(uid, role) {
  return adminFetch(`/users/${uid}/role`, {
    method: "POST",
    body: JSON.stringify({ role }),
  });
}
