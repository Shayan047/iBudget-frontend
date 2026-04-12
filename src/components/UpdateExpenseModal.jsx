import { useState } from "react";
import api from "../api/axios";

const UpdateExpenseModal = ({ expense, categories, onClose, onUpdated }) => {
  const [form, setForm] = useState({
    amount: expense.my_amount || expense.amount || "",
    category_id: expense.category?.id || "",
    description: expense.description || "",
    date: expense.date ? new Date(expense.date).toISOString().split("T")[0] : "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.patch(`/expenses/${expense.id}`, {
        amount: parseFloat(form.amount),
        category_id: parseInt(form.category_id),
        description: form.description,
        date: new Date(form.date).toISOString(),
      });
      onUpdated();
      onClose();
    } catch (err) {
      setError("Failed to update expense.");
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
        style={{ width: "100%", maxWidth: "400px", padding: "32px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: "700" }}>Update Expense</h3>
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
            <label>Description</label>
            <input
              type="text"
              name="description"
              placeholder="e.g. Weekly Groceries"
              value={form.description}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Category</label>
            <select name="category_id" value={form.category_id} onChange={handleChange} required>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Date</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} required />
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

export default UpdateExpenseModal;
