import { useEffect, useState } from "react";
import {
  adminResetPassword,
  adminDeleteUser,
  adminListUsers,
  adminSetRole,
} from "../../firebase/admin";
import { useAuth } from "../../context/AuthContext";
import AdminNav from "../../components/AdminNav";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyUid, setBusyUid] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [removeTarget, setRemoveTarget] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      setUsers(await adminListUsers());
    } catch (err) {
      setError(err.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  function isSelf(uid) {
    return uid === currentUser?.uid;
  }

  async function handleRoleChange(uid, newRole) {
    setBusyUid(uid);
    setError("");
    setMessage("");
    try {
      await adminSetRole(uid, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u))
      );
      setMessage("Role updated.");
    } catch (err) {
      setError(err.message || "Failed to update role.");
    } finally {
      setBusyUid(null);
    }
  }

  function openResetModal(u) {
    setResetTarget(u);
    setNewPassword("");
    setError("");
    setMessage("");
  }

  async function submitResetPassword() {
    if (!resetTarget) return;
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusyUid(resetTarget.uid);
    setError("");
    setMessage("");
    try {
      await adminResetPassword(resetTarget.uid, newPassword);
      setMessage(`Password reset for ${resetTarget.name || resetTarget.email}.`);
      setResetTarget(null);
    } catch (err) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setBusyUid(null);
    }
  }

  function initials(u) {
    const source = (u.name || u.email || "?").trim();
    const parts = source.split(/[\s@.]+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return source.slice(0, 2).toUpperCase();
  }

  async function confirmRemove() {
    if (!removeTarget) return;
    setBusyUid(removeTarget.uid);
    setError("");
    setMessage("");
    try {
      await adminDeleteUser(removeTarget.uid);
      setUsers((prev) => prev.filter((x) => x.uid !== removeTarget.uid));
      setMessage(`${removeTarget.name || removeTarget.email} removed.`);
      setRemoveTarget(null);
    } catch (err) {
      setError(err.message || "Failed to remove user.");
    } finally {
      setBusyUid(null);
    }
  }

  return (
    <div className="admin-dashboard">
      <AdminNav />

      <header className="admin-header">
        <div>
          <h1 className="admin-title">Users</h1>
          <p className="admin-subtitle">Manage roles and accounts</p>
        </div>
      </header>

      {error && <p className="auth-error">{error}</p>}
      {message && <p className="auth-success">{message}</p>}

      {loading ? (
        <div className="admin-loading">Loading users…</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th className="admin-th-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.uid}>
                  <td>
                    <div className="admin-user-cell">
                      <span className="admin-avatar">{initials(u)}</span>
                      <span className="admin-bike-name">
                        {u.name || "—"}
                        {isSelf(u.uid) && (
                          <span className="admin-bike-badge"> (you)</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="admin-user-email">{u.email}</td>
                  <td>
                    <span
                      className={`admin-badge ${
                        u.role === "admin"
                          ? "admin-badge-admin"
                          : "admin-badge-customer"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="admin-th-right">
                    <div className="admin-actions-row">
                      <select
                        className="admin-select"
                        value={u.role}
                        disabled={busyUid === u.uid || isSelf(u.uid)}
                        onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                      >
                        <option value="customer">customer</option>
                        <option value="admin">admin</option>
                      </select>

                      <button
                        className="admin-action-btn"
                        disabled={busyUid === u.uid || isSelf(u.uid)}
                        onClick={() => openResetModal(u)}
                      >
                        Reset password
                      </button>
                      <button
                        className="admin-action-btn admin-action-btn-danger"
                        disabled={busyUid === u.uid || isSelf(u.uid)}
                        onClick={() => setRemoveTarget(u)}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {resetTarget && (
        <div className="admin-modal" onClick={() => setResetTarget(null)}>
          <div
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Reset password</h2>
            <p className="admin-modal-sub">
              Set a new password for{" "}
              <strong>{resetTarget.name || resetTarget.email}</strong>
            </p>
            {error && <p className="auth-error">{error}</p>}
            <input
              className="admin-modal-input"
              type="password"
              value={newPassword}
              autoFocus
              placeholder="New password (min 6 characters)"
              onChange={(e) => setNewPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitResetPassword()}
            />
            <div className="admin-modal-actions">
              <button
                className="admin-action-btn"
                disabled={busyUid === resetTarget.uid}
                onClick={() => setResetTarget(null)}
              >
                Cancel
              </button>
              <button
                className="admin-btn admin-btn-primary"
                disabled={busyUid === resetTarget.uid}
                onClick={submitResetPassword}
              >
                {busyUid === resetTarget.uid ? "Saving..." : "Set password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {removeTarget && (
        <div className="admin-modal" onClick={() => setRemoveTarget(null)}>
          <div
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Remove user</h2>
            <p className="admin-modal-sub">
              Remove{" "}
              <strong>{removeTarget.name || removeTarget.email}</strong>? This
              deletes their account and can't be undone.
            </p>
            {error && <p className="auth-error">{error}</p>}
            <div className="admin-modal-actions">
              <button
                className="admin-action-btn"
                disabled={busyUid === removeTarget.uid}
                onClick={() => setRemoveTarget(null)}
              >
                Cancel
              </button>
              <button
                className="admin-btn admin-btn-danger"
                disabled={busyUid === removeTarget.uid}
                onClick={confirmRemove}
              >
                {busyUid === removeTarget.uid ? "Removing..." : "Remove user"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
