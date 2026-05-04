import { useState } from "react";
import api from "../api/axios";
import Loader from "./Loader";

const UpdateIncomeModal = ({ item, onClose, onUpdated }) => {
  const [form, setForm] = useState({
    amount: item.amount || "",
    description: item.description || "",
    date: item.date ? new Date(item.date).toISOString().split("T")[0] : "",
    tax_amount: item.tax?.amount ?? "",
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
        description: form.description,
        date: new Date(form.date).toISOString(),
        tax_amount: form.tax_amount !== "" ? parseFloat(form.tax_amount) : null,
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
              min="0.01"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Description</label>
            <input
              type="text"
              name="description"
              placeholder="e.g. Monthly Salary"
              value={form.description}
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
          <div>
            <label>Tax Amount (optional)</label>
            <input
              type="number"
              name="tax_amount"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.tax_amount}
              onChange={handleChange}
            />
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
              Set to 0 to remove existing tax
            </p>
          </div>

          {error && <p style={{ color: "var(--danger)", fontSize: "13px" }}>{error}</p>}

          <div
            style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px" }}
          >
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader size="small" /> : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateIncomeModal;
