import { useEffect, useState } from "react";
import api from "../api/axios";
import DeleteModal from "../components/DeleteModal";
import UpdateIncomeModal from "../components/UpdateIncomeModal";
import ActionMenu from "../components/ActionMenu";
import Loader from "../components/Loader";

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [form, setForm] = useState({ amount: "", date: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updateTarget, setUpdateTarget] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  const fetchIncomes = async () => {
    try {
      const res = await api.get("/incomes/");
      setIncomes(res.data.reverse());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/incomes/", {
        amount: parseFloat(form.amount),
        date: new Date(form.date).toISOString(),
      });
      setForm({ amount: "", date: "" });
      fetchIncomes();
    } catch (err) {
      setError("Failed to add income.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/incomes/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchIncomes();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      {deleteTarget && (
        <DeleteModal
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          loading={deleteLoading}
        />
      )}
      {updateTarget && (
        <UpdateIncomeModal
          item={updateTarget}
          onClose={() => setUpdateTarget(null)}
          onUpdated={fetchIncomes}
        />
      )}

      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "700" }}>Income</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
          Track your income
        </p>
      </div>

      {/* Add Income Form */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "18px" }}>
          Add New Income
        </h3>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "flex-end" }}
        >
          <div style={{ flex: 1, minWidth: "120px" }}>
            <label>Amount</label>
            <input
              type="number"
              name="amount"
              placeholder="0.00"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </div>
          <div style={{ flex: 1, minWidth: "160px" }}>
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              max={today}
              required
            />
          </div>
          <div>
            <button
              className="btn-primary"
              type="submit"
              disabled={submitting}
              style={{ padding: "11px 24px" }}
            >
              {submitting ? "Adding..." : "+ Add"}
            </button>
          </div>
        </form>
        {error && (
          <p style={{ color: "var(--danger)", fontSize: "13px", marginTop: "10px" }}>{error}</p>
        )}
      </div>

      {/* Income Table */}
      <div className="card">
        <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "18px" }}>All Income</h3>
        {loading ? (
          <Loader fullPage />
        ) : incomes.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No income entries yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: "8px 0", fontWeight: "500" }}>Date</th>
                <th style={{ textAlign: "right", padding: "8px 0", fontWeight: "500" }}>Amount</th>
                <th style={{ textAlign: "right", padding: "8px 0", fontWeight: "500" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {incomes.map((inc) => (
                <tr key={inc.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "13px 0", color: "var(--text-muted)" }}>
                    {new Date(inc.date).toLocaleDateString()}
                  </td>
                  <td
                    style={{
                      padding: "13px 0",
                      textAlign: "right",
                      fontWeight: "600",
                      color: "var(--success)",
                    }}
                  >
                    +${inc.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: "13px 0", textAlign: "right" }}>
                    <ActionMenu
                      onEdit={() => setUpdateTarget(inc)}
                      onDelete={() => setDeleteTarget(inc)}
                      canModify={true}
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

export default Income;
