import { useState } from "react";
import api from "../api/axios";

const STATUS_OPTIONS = ["paid", "pending"];

const UpdateSharedExpenseModal = ({ expense, onClose, onUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch full detail on mount since summary doesn't have participants
  const [detail, setDetail] = useState(null);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({
    description: expense.description || "",
    date: expense.date ? new Date(expense.date).toISOString().split("T")[0] : "",
  });

  // Participant states: { id, user_name, amount, status, is_creator }
  const [participantForms, setParticipantForms] = useState([]);

  // Fetch full expense detail to get participants
  useState(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/expenses/${expense.id}`);
        setDetail(res.data);
        setParticipantForms(
          res.data.participants.map((p) => ({
            id: p.id,
            user_name: p.user_name,
            user_email: p.user_email,
            amount: p.amount,
            status: p.status,
            is_creator: p.is_creator,
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchDetail();
  }, []);

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleParticipantChange = (index, field, value) => {
    setParticipantForms((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Step 1 — Update expense fields (description, date)
      await api.patch(`/expenses/${expense.id}`, {
        description: form.description,
        date: new Date(form.date).toISOString(),
      });

      // Step 2 — Update each participant's status and creator's amount
      await Promise.all(
        participantForms.map((p) => {
          if (p.is_creator) {
            // Update creator's share amount
            return api.patch(`/expenses/${expense.id}/participants/${p.id}`, {
              status: p.status,
              amount: parseFloat(p.amount),
            });
          } else {
            // Update participant status only
            return api.patch(`/expenses/${expense.id}/participants/${p.id}`, {
              status: p.status,
              amount: parseFloat(p.amount),
            });
          }
        })
      );

      onUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update shared expense.");
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
        style={{
          width: "100%",
          maxWidth: "520px",
          padding: "32px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: "700" }}>Update Shared Expense</h3>
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

        {fetching ? (
          <p style={{ color: "var(--text-muted)", fontSize: "14px", textAlign: "center" }}>
            Loading...
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {/* Description */}
            <div>
              <label>Description</label>
              <input
                type="text"
                name="description"
                placeholder="e.g. Dinner at restaurant"
                value={form.description}
                onChange={handleFormChange}
              />
            </div>

            {/* Date */}
            <div>
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleFormChange}
                required
              />
            </div>

            {/* Participants */}
            <div>
              <label style={{ marginBottom: "10px", display: "block" }}>Participants</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {participantForms.map((p, index) => (
                  <div
                    key={p.id}
                    style={{
                      padding: "14px",
                      background: "var(--primary-bg)",
                      borderRadius: "10px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {/* Name + Creator badge */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                      }}
                    >
                      <div>
                        <p style={{ fontSize: "13px", fontWeight: "600", margin: 0 }}>
                          {p.user_name}
                        </p>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>
                          {p.user_email}
                        </p>
                      </div>
                      {p.is_creator && (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "600",
                            color: "var(--primary)",
                            background: "white",
                            padding: "2px 8px",
                            borderRadius: "20px",
                            border: "1px solid var(--primary)",
                            height: "fit-content",
                          }}
                        >
                          Creator
                        </span>
                      )}
                    </div>

                    {/* Amount + Status */}
                    <div style={{ display: "flex", gap: "10px" }}>
                      <div style={{ flex: 1 }}>
                        <label>Share Amount</label>
                        <input
                          type="number"
                          step="0.01"
                          value={p.amount}
                          onChange={(e) => handleParticipantChange(index, "amount", e.target.value)}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label>Status</label>
                        <select
                          value={p.status}
                          onChange={(e) => handleParticipantChange(index, "status", e.target.value)}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
        )}
      </div>
    </div>
  );
};

export default UpdateSharedExpenseModal;
