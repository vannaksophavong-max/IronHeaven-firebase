import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllBikes, deleteBike } from "../../firebase/bikes";
import AdminNav from "../../components/AdminNav";

export default function AdminDashboard() {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setBikes(await getAllBikes());
    setLoading(false);
  }

  async function handleDelete(docId, name) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(docId);
    await deleteBike(docId);
    setDeletingId(null);
    load();
  }

  const filtered = bikes.filter((bike) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [bike.name, bike.category, bike.badge, bike.id].some((v) =>
      v ? v.toLowerCase().includes(q) : false
    );
  });

  const categories = [...new Set(bikes.map((b) => b.category).filter(Boolean))];

  return (
    <div className="admin-dashboard">
      <AdminNav />

      <header className="admin-header">
        <div>
          <h1 className="admin-title">Bikes</h1>
          <p className="admin-subtitle">Manage the IronHeaven catalog</p>
        </div>
        <Link to="/admin/bikes/new" className="admin-btn admin-btn-primary">
          + Add Bike
        </Link>
      </header>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <span className="admin-stat-label">Total bikes</span>
          <span className="admin-stat-value">{bikes.length}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Categories</span>
          <span className="admin-stat-value">{categories.length}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Badged models</span>
          <span className="admin-stat-value">
            {bikes.filter((b) => b.badge).length}
          </span>
        </div>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-search"
          type="search"
          placeholder="Search by name, category, badge or id…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="admin-loading">Loading bikes…</div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty">
          {bikes.length === 0
            ? "No bikes yet — add your first one."
            : "No bikes match your search."}
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Bike</th>
                <th>Category</th>
                <th>Price</th>
                <th>Id</th>
                <th className="admin-th-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((bike) => (
                <tr key={bike.docId}>
                  <td>
                    <div className="admin-bike">
                      {bike.heroImage ? (
                        <img
                          className="admin-thumb"
                          src={bike.heroImage}
                          alt={bike.name}
                        />
                      ) : (
                        <div className="admin-thumb admin-thumb-empty">IH</div>
                      )}
                      <div className="admin-bike-meta">
                        <span className="admin-bike-name">{bike.name}</span>
                        {bike.badge && (
                          <span className="admin-bike-badge">{bike.badge}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="admin-badge">{bike.category || "—"}</span>
                  </td>
                  <td className="admin-price">{bike.price || "—"}</td>
                  <td className="admin-id">{bike.id}</td>
                  <td className="admin-th-right">
                    <div className="admin-actions">
                      <Link
                        className="admin-btn admin-btn-ghost"
                        to={`/admin/bikes/${bike.docId}/edit`}
                      >
                        Edit
                      </Link>
                      <button
                        className="admin-btn admin-btn-ghost-danger"
                        disabled={deletingId === bike.docId}
                        onClick={() => handleDelete(bike.docId, bike.name)}
                      >
                        {deletingId === bike.docId ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
