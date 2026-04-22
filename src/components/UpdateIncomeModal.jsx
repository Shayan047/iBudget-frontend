import { useState } from "react";
import api from "../api/axios";

const UpdateIncomeModal = ({ item, onClose, onUpdated }) => {
  const [form, setForm] = useState({
    amount: item.amount || "",
    date: item.date ? new Date(item.date).toISOString().split("T")[0] : "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.patch(`/incomes/${item.id}`, {
        amount: parseFloat(form.amount),
        date: new Date(form.date).toISOString(),
      });
      onUpdated();
      onClose();
    } catch (err) {
      setError("Failed to update income.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(30, 27, 75, 0.3)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{ width: "100%", maxWidth: "380px", padding: "32px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: "700" }}>Update Income</h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
              color: "var(--text-muted)",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div>
            <label>Amount</label>
            <input
              type="number"
              name="amount"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          {error && <p style={{ color: "var(--danger)", fontSize: "13px" }}>{error}</p>}

          <div
            style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px" }}
          >
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateIncomeModal;
