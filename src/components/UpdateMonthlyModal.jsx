import { useState } from "react";
import api from "../api/axios";
import { MONTHS, getYearOptions, monthYearToISO, isFutureMonth } from "../utils/dateHelpers";
import Loader from "./Loader";

const YEARS = getYearOptions();

const UpdateMonthlyModal = ({ item, type, onClose, onUpdated }) => {
  const itemDate = new Date(item.date);
  const [form, setForm] = useState({
    amount: item.amount,
    month: MONTHS[itemDate.getMonth()],
    year: String(itemDate.getFullYear()),
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const monthIndex = MONTHS.indexOf(form.month) + 1;
      const date = new Date(parseInt(form.year), monthIndex - 1, 1).toISOString();
      await api.patch(`/${type}s/${item.id}`, {
        amount: parseFloat(form.amount),
        date,
      });
      onUpdated();
      onClose();
    } catch (err) {
      setError(`Failed to update ${type}.`);
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
          <h3 style={{ fontSize: "16px", fontWeight: "700" }}>
            Update {type.charAt(0).toUpperCase() + type.slice(1)}
          </h3>
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
          <div>
            <label>Year</label>
            <select name="year" value={form.year} onChange={handleChange} required>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
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

export default UpdateMonthlyModal;
