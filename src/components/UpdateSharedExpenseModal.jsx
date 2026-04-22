import { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "./Loader";

const STATUS_OPTIONS = ["paid", "pending"];
const DEFAULT_PARTICIPANT = { email: "", amount: "", status: "pending" };

const UpdateSharedExpenseModal = ({ expense, categories, onClose, onUpdated }) => {
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    category_id: "",
    total_amount: "",
    my_share: "",
    description: "",
    date: "",
  });

  const [participants, setParticipants] = useState([{ ...DEFAULT_PARTICIPANT }]);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/expenses/${expense.id}`);
        const d = res.data;

        const creatorEntry = d.participants?.find((p) => p.is_creator);

        setForm({
          category_id: d.category?.id ?? "",
          total_amount: d.total_amount ?? "",
          my_share: creatorEntry?.amount ?? "",
          description: d.description ?? "",
          date: d.date ? new Date(d.date).toISOString().split("T")[0] : "",
        });

        const nonCreators = d.participants?.filter((p) => !p.is_creator) || [];
        setParticipants(
          nonCreators.length > 0
            ? nonCreators.map((p) => ({
                email: p.user_email,
                amount: p.amount,
                status: p.status,
              }))
            : [{ ...DEFAULT_PARTICIPANT }]
        );
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchDetail();
  }, [expense.id]);

  // Computed values
  const totalAmount = parseFloat(form.total_amount) || 0;
  const myShareAmount = parseFloat(form.my_share) || 0;
  const participantsTotal = participants.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const remaining = parseFloat((totalAmount - myShareAmount - participantsTotal).toFixed(2));
  const isOverBudget = remaining < 0;
  const isUnderAllocated = remaining > 0;
  const allocationInvalid = isOverBudget || isUnderAllocated;

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleParticipantChange = (index, field, value) => {
    setParticipants((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const addParticipant = () => setParticipants((prev) => [...prev, { ...DEFAULT_PARTICIPANT }]);

  const removeParticipant = (index) => {
    if (participants.length === 1) return;
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.my_share || myShareAmount <= 0) {
      setError("Please enter your share.");
      return;
    }
    if (allocationInvalid) {
      setError(
        isOverBudget
          ? `Shares exceed total by $${Math.abs(remaining).toFixed(2)}.`
          : `$${remaining.toFixed(2)} still unallocated. Shares must equal total amount.`
      );
      return;
    }
    const validParticipants = participants.filter((p) => p.email.trim() !== "");
    if (validParticipants.length === 0) {
      setError("At least 1 participant is required.");
      return;
    }

    setLoading(true);
    try {
      await api.patch(`/expenses/shared/${expense.id}`, {
        category_id: parseInt(form.category_id),
        total_amount: totalAmount,
        my_share: myShareAmount,
        description: form.description,
        date: new Date(form.date).toISOString(),
        users: validParticipants.map((p) => ({
          email: p.email,
          amount: parseFloat(p.amount),
          status: p.status,
        })),
      });
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
          maxWidth: "560px",
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
          <Loader fullPage />
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {/* Total Amount */}
            <div>
              <label>Total Amount</label>
              <input
                type="number"
                name="total_amount"
                step="0.01"
                value={form.total_amount}
                onChange={handleFormChange}
                required
              />
            </div>

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

            {/* Category */}
            <div>
              <label>Category</label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleFormChange}
                required
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleFormChange}
                max={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            {/* Allocation tracker */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 14px",
                background: "var(--primary-bg)",
                borderRadius: "8px",
                border: `1px solid ${allocationInvalid ? "var(--danger)" : "var(--border)"}`,
              }}
            >
              <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" }}>
                Total: <strong style={{ color: "var(--text)" }}>${totalAmount.toFixed(2)}</strong>
              </span>
              <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" }}>
                Allocated:{" "}
                <strong style={{ color: "var(--primary)" }}>
                  ${(myShareAmount + participantsTotal).toFixed(2)}
                </strong>
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: allocationInvalid
                    ? "var(--danger)"
                    : remaining === 0
                      ? "var(--success)"
                      : "var(--text-muted)",
                }}
              >
                Remaining: ${remaining.toFixed(2)}
              </span>
            </div>

            {/* Your Share */}
            <div>
              <label>Your Share</label>
              <input
                type="number"
                name="my_share"
                step="0.01"
                placeholder="0.00"
                value={form.my_share}
                onChange={handleFormChange}
                required
                style={{ borderColor: allocationInvalid ? "var(--danger)" : undefined }}
              />
            </div>

            {/* Participants */}
            <div>
              <label style={{ marginBottom: "10px", display: "block" }}>Participants</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {participants.map((p, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "14px",
                      background: "var(--primary-bg)",
                      borderRadius: "10px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                      <div style={{ flex: 2 }}>
                        {index === 0 && <label>Email</label>}
                        <input
                          type="email"
                          placeholder="participant@example.com"
                          value={p.email}
                          onChange={(e) => handleParticipantChange(index, "email", e.target.value)}
                          required
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        {index === 0 && <label>Amount</label>}
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={p.amount}
                          onChange={(e) => handleParticipantChange(index, "amount", e.target.value)}
                          required
                        />
                      </div>
                      <div style={{ paddingTop: index === 0 ? "22px" : "0" }}>
                        <button
                          type="button"
                          onClick={() => removeParticipant(index)}
                          disabled={participants.length === 1}
                          style={{
                            background: "none",
                            border: "1.5px solid var(--border)",
                            borderRadius: "8px",
                            padding: "10px 12px",
                            cursor: participants.length === 1 ? "not-allowed" : "pointer",
                            color: participants.length === 1 ? "var(--border)" : "var(--danger)",
                            fontSize: "14px",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <label>Payment Status</label>
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
                ))}
              </div>

              <button
                type="button"
                onClick={addParticipant}
                style={{
                  marginTop: "10px",
                  background: "none",
                  border: "1.5px dashed var(--primary-light)",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  color: "var(--primary)",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  width: "100%",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--primary-bg)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                + Add Participant
              </button>
            </div>

            {allocationInvalid && (
              <p style={{ color: "var(--danger)", fontSize: "13px", textAlign: "center" }}>
                {isOverBudget
                  ? ` Shares exceed total by $${Math.abs(remaining).toFixed(2)}.`
                  : ` $${remaining.toFixed(2)} still unallocated.`}
              </p>
            )}

            {error && <p style={{ color: "var(--danger)", fontSize: "13px" }}>{error}</p>}

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                marginTop: "4px",
              }}
            >
              <button type="button" className="btn-outline" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || allocationInvalid}
                style={{ opacity: allocationInvalid ? 0.5 : 1 }}
              >
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
