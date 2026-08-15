import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// UI-level gate only. The real enforcement is in firestore.rules —
// this just keeps non-admins from seeing the admin UI at all.
export default function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return null; // or a spinner

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
}
