import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminNav() {
  const { user, logout } = useAuth();

  function initials() {
    const source = (user?.name || user?.email || "A").trim();
    const parts = source.split(/[\s@.]+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return source.slice(0, 2).toUpperCase();
  }

  return (
    <div className="admin-topbar">
      <div className="admin-brand">
        <span className="admin-brand-mark">IH</span>
        <span className="admin-brand-text">
          IronHeaven<span>Admin</span>
        </span>
      </div>

      <nav className="admin-tabs">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Bikes
        </NavLink>
        <NavLink
          to="/admin/users"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Users
        </NavLink>
      </nav>

      <div className="admin-user">
        <span className="admin-avatar">{initials()}</span>
        <span className="admin-user-name">{user?.name || user?.email}</span>
        <button className="admin-logout" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}
