import { useState } from "react";
import api from "../api/axios";

const CategoryModal = ({ onClose, onCreated }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/categories/", { name });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(30, 27, 75, 0.3)",
        backdropFilter: "blur(2px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000,
      }}
    >
      {/* Modal Box */}
      <div
        onClick={e => e.stopPropagation()}
        className="card"
        style={{ width: "100%", maxWidth: "380px", padding: "32px" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700" }}>New Category</h3>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: "20px", color: "var(--text-muted)", lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label>Category Name</label>
            <input
              type="text" placeholder="e.g. Groceries"
              value={name} onChange={e => setName(e.target.value)} required
            />
          </div>

          {error && <p style={{ color: "var(--danger)", fontSize: "13px" }}>{error}</p>}

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px" }}>
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;