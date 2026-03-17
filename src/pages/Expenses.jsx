import { useEffect, useState } from "react";
import api from "../api/axios";
import CategoryModal from "../components/CategoryModal";
import DeleteModal from "../components/DeleteModal";
import UpdateExpenseModal from "../components/UpdateExpenseModal";
import ActionMenu from "../components/ActionMenu";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ amount: "", category_id: "", date: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updateTarget, setUpdateTarget] = useState(null);

  const fetchData = async () => {
    try {
      const [expRes, catRes] = await Promise.all([
        api.get("/expenses/"),
        api.get("/categories/"),
      ]);
      setExpenses(expRes.data.reverse());
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/expenses/", {
        amount: parseFloat(form.amount),
        category_id: parseInt(form.category_id),
        date: form.date || new Date().toISOString(),
      });
      setForm({ amount: "", category_id: "", date: "" });
      fetchData();
    } catch (err) {
      setError("Failed to add expense.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/expenses/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      {showCategoryModal && (
        <CategoryModal onClose={() => setShowCategoryModal(false)} onCreated={fetchData} />
      )}
      {deleteTarget && (
        <DeleteModal
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          loading={deleteLoading}
        />
      )}
      {updateTarget && (
        <UpdateExpenseModal
          expense={updateTarget}
          categories={categories}
          onClose={() => setUpdateTarget(null)}
          onUpdated={fetchData}
        />
      )}

      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "700" }}>Expenses</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
          Track and manage your expenses
        </p>
      </div>

      {/* Add Expense Form */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "18px" }}>Add New Expense</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: "120px" }}>
            <label>Amount</label>
            <input type="number" name="amount" placeholder="0.00" step="0.01"
              value={form.amount} onChange={handleChange} required />
          </div>
          <div style={{ flex: 1, minWidth: "180px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ margin: 0 }}>Category</label>
              <button type="button" onClick={() => setShowCategoryModal(true)} style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--primary-light)", fontSize: "12px", fontWeight: "600",
                padding: 0, textDecoration: "underline",
              }}>
                + New Category
              </button>
            </div>
            <select name="category_id" value={form.category_id} onChange={handleChange} required>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: "140px" }}>
            <label>Date</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} />
          </div>
          <div>
            <button className="btn-primary" type="submit" disabled={submitting}
              style={{ padding: "11px 24px" }}>
              {submitting ? "Adding..." : "+ Add"}
            </button>
          </div>
        </form>
        {error && <p style={{ color: "var(--danger)", fontSize: "13px", marginTop: "10px" }}>{error}</p>}
      </div>

      {/* Expenses Table */}
      <div className="card">
        <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "18px" }}>All Expenses</h3>
        {loading ? (
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading...</p>
        ) : expenses.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No expenses found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: "8px 0", fontWeight: "500" }}>Date</th>
                <th style={{ textAlign: "left", padding: "8px 0", fontWeight: "500" }}>Category</th>
                <th style={{ textAlign: "right", padding: "8px 0", fontWeight: "500" }}>Amount</th>
                <th style={{ textAlign: "right", padding: "8px 0", fontWeight: "500" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "13px 0", color: "var(--text-muted)" }}>
                    {new Date(exp.date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "13px 0" }}>
                    <span style={{
                      background: "var(--primary-bg)", color: "var(--primary)",
                      padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500",
                    }}>
                      {exp.category?.name || "—"}
                    </span>
                  </td>
                  <td style={{ padding: "13px 0", textAlign: "right", fontWeight: "600", color: "var(--danger)" }}>
                    -${exp.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: "13px 0", textAlign: "right" }}>
                    <ActionMenu
                      onEdit={() => setUpdateTarget(exp)}
                      onDelete={() => setDeleteTarget(exp)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Expenses;