import { useEffect, useState } from "react";
import api from "../api/axios";
import DeleteModal from "../components/DeleteModal";
import UpdateMonthlyModal from "../components/UpdateMonthlyModal";
import ActionMenu from "../components/ActionMenu";
import Loader from "../components/Loader";
import {
  MONTHS,
  getYearOptions,
  isFutureMonth,
  formatMonthYear,
  monthYearToISO,
} from "../utils/dateHelpers";

const YEARS = getYearOptions();

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({
    amount: "",
    month: "",
    year: String(new Date().getFullYear()),
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updateTarget, setUpdateTarget] = useState(null);

  const fetchBudgets = async () => {
    try {
      const res = await api.get("/budgets/");
      setBudgets(res.data.reverse());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/budgets/", {
        amount: parseFloat(form.amount),
        date: monthYearToISO(MONTHS[parseInt(form.month) - 1], form.year),
      });
      setForm({ amount: "", month: "", year: String(new Date().getFullYear()) });
      fetchBudgets();
    } catch (err) {
      setError("Failed to add budget.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/budgets/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchBudgets();
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
        <UpdateMonthlyModal
          item={updateTarget}
          type="budget"
          onClose={() => setUpdateTarget(null)}
          onUpdated={fetchBudgets}
        />
      )}

      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "700" }}>Budget</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
          Set and manage your monthly budgets
        </p>
      </div>

      <div className="card" style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "18px" }}>
          Set New Budget
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
              min="0.01"
              min="0.01"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </div>
          <div style={{ flex: 1, minWidth: "140px" }}>
            <label>Month</label>
            <select name="month" value={form.month} onChange={handleChange} required>
              <option value="">Select month</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1} disabled={isFutureMonth(i + 1, parseInt(form.year))}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: "100px" }}>
            <label>Year</label>
            <select name="year" value={form.year} onChange={handleChange} required>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <button
              className="btn-primary"
              type="submit"
              disabled={submitting}
              style={{ padding: "11px 24px" }}
            >
              {submitting ? <Loader size="small" /> : "+ Add"}
            </button>
          </div>
        </form>
        {error && (
          <p style={{ color: "var(--danger)", fontSize: "13px", marginTop: "10px" }}>{error}</p>
        )}
      </div>

      <div className="card">
        <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "18px" }}>All Budgets</h3>
        {loading ? (
          <Loader fullPage />
        ) : budgets.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No budgets set yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: "8px 0", fontWeight: "500" }}>Month</th>
                <th style={{ textAlign: "right", padding: "8px 0", fontWeight: "500" }}>
                  Budget Amount
                </th>
                <th style={{ textAlign: "right", padding: "8px 0", fontWeight: "500" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((bud) => (
                <tr key={bud.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "13px 0", color: "var(--text-muted)" }}>
                    {formatMonthYear(bud.date)}
                  </td>
                  <td
                    style={{
                      padding: "13px 0",
                      textAlign: "right",
                      fontWeight: "600",
                      color: "var(--primary)",
                    }}
                  >
                    ${bud.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: "13px 0", textAlign: "right" }}>
                    <ActionMenu
                      onEdit={() => setUpdateTarget(bud)}
                      onDelete={() => setDeleteTarget(bud)}
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

export default Budget;
