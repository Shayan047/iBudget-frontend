import { useEffect, useState } from "react";
import api from "../api/axios";
import CategoryModal from "../components/CategoryModal";
import DeleteModal from "../components/DeleteModal";
import UpdateExpenseModal from "../components/UpdateExpenseModal";
import UpdateSharedExpenseModal from "../components/UpdateSharedExpenseModal";
import ExpenseDetailModal from "../components/ExpenseDetailModal";
import ActionMenu from "../components/ActionMenu";
import Loader from "../components/Loader";

const DEFAULT_PARTICIPANT = { email: "", amount: "" };

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ amount: "", category_id: "", date: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [isShared, setIsShared] = useState(false);
  const [myShare, setMyShare] = useState("");
  const [participants, setParticipants] = useState([{ ...DEFAULT_PARTICIPANT }]);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updateTarget, setUpdateTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);

  const fetchData = async () => {
    try {
      const [expRes, catRes] = await Promise.all([api.get("/expenses/"), api.get("/categories/")]);
      setExpenses(expRes.data.reverse());
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalAmount = parseFloat(form.amount) || 0;
  const myShareAmount = parseFloat(myShare) || 0;
  const participantsTotal = participants.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const remaining = parseFloat((totalAmount - myShareAmount - participantsTotal).toFixed(2));
  const isOverBudget = remaining < 0;
  const isUnderAllocated = remaining > 0;
  const allocationInvalid = isOverBudget || isUnderAllocated;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleParticipantChange = (index, field, value) => {
    setParticipants((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const addParticipant = () => setParticipants((prev) => [...prev, { ...DEFAULT_PARTICIPANT }]);

  const removeParticipant = (index) => {
    if (participants.length === 1) return;
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSharedToggle = (e) => {
    setIsShared(e.target.checked);
    if (!e.target.checked) {
      setMyShare("");
      setParticipants([{ ...DEFAULT_PARTICIPANT }]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isShared) {
      if (!myShare || myShareAmount <= 0) {
        setError("Please enter your share of the expense.");
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
        setError("At least 1 participant is required for a shared expense.");
        return;
      }
    }

    setSubmitting(true);
    try {
      if (isShared) {
        const validParticipants = participants.filter((p) => p.email.trim() !== "");
        await api.post("/expenses/shared", {
          category_id: parseInt(form.category_id),
          description: form.description,
          date: form.date || new Date().toISOString(),
          total_amount: totalAmount,
          my_share: myShareAmount,
          users: validParticipants.map((p) => ({
            email: p.email,
            amount: parseFloat(p.amount),
          })),
        });
      } else {
        await api.post("/expenses/", {
          amount: totalAmount,
          description: form.description,
          category_id: parseInt(form.category_id),
          date: form.date || new Date().toISOString(),
        });
      }

      setForm({ amount: "", category_id: "", date: "", description: "" });
      setMyShare("");
      setParticipants([{ ...DEFAULT_PARTICIPANT }]);
      setIsShared(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add expense.");
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

  const canModify = (exp) => {
    if (!exp.is_shared) return true; // personal — always can modify
    return exp.is_creator === true; // shared — only creator
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
      {/* Route to correct update modal based on expense type */}
      {updateTarget && !updateTarget.is_shared && (
        <UpdateExpenseModal
          expense={updateTarget}
          categories={categories}
          onClose={() => setUpdateTarget(null)}
          onUpdated={fetchData}
        />
      )}
      {updateTarget && updateTarget.is_shared && (
        <UpdateSharedExpenseModal
          expense={updateTarget}
          categories={categories}
          onClose={() => setUpdateTarget(null)}
          onUpdated={fetchData}
        />
      )}
      {viewTarget && (
        <ExpenseDetailModal expenseId={viewTarget.id} onClose={() => setViewTarget(null)} />
      )}

      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "700" }}>Expenses</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
          Track and manage your expenses
        </p>
      </div>

      {/* Add Expense Form */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "18px" }}>
          Add New Expense
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "flex-end" }}>
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
            <div style={{ flex: 2, minWidth: "200px" }}>
              <label>Description</label>
              <input
                type="text"
                name="description"
                placeholder="e.g. Weekly Groceries"
                value={form.description}
                onChange={handleChange}
              />
            </div>
            <div style={{ flex: 1, minWidth: "180px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "6px",
                }}
              >
                <label style={{ margin: 0 }}>Category</label>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--primary-light)",
                    fontSize: "12px",
                    fontWeight: "600",
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  + New Category
                </button>
              </div>
              <select name="category_id" value={form.category_id} onChange={handleChange} required>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: "140px" }}>
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <button
                className="btn-primary"
                type="submit"
                disabled={submitting || (isShared && allocationInvalid)}
                style={{ padding: "11px 24px", opacity: isShared && allocationInvalid ? 0.5 : 1 }}
              >
                {submitting ? "Adding..." : "+ Add"}
              </button>
            </div>
          </div>

          {/* Shared Expense Checkbox */}
          <div style={{ marginTop: "16px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                color: "var(--text)",
                width: "fit-content",
              }}
            >
              <input
                type="checkbox"
                checked={isShared}
                onChange={handleSharedToggle}
                style={{
                  width: "16px",
                  height: "16px",
                  cursor: "pointer",
                  accentColor: "var(--primary)",
                }}
              />
              Split as shared expense
            </label>
          </div>

          {/* Shared Expense Section */}
          {isShared && (
            <div
              style={{
                marginTop: "20px",
                padding: "20px",
                background: "var(--primary-bg)",
                borderRadius: "12px",
                border: "1px solid var(--accent)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                  padding: "10px 14px",
                  background: "white",
                  borderRadius: "8px",
                  border: `1px solid ${isOverBudget ? "var(--danger)" : "var(--border)"}`,
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

              <div style={{ marginBottom: "16px" }}>
                <label>Your Share</label>
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={myShare}
                  onChange={(e) => setMyShare(e.target.value)}
                  required={isShared}
                  style={{ borderColor: isOverBudget ? "var(--danger)" : undefined }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {participants.map((p, index) => (
                  <div key={index} style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                    <div style={{ flex: 2 }}>
                      {index === 0 && <label>Participant Email</label>}
                      <input
                        type="email"
                        placeholder="participant@example.com"
                        value={p.email}
                        onChange={(e) => handleParticipantChange(index, "email", e.target.value)}
                        required={isShared}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      {index === 0 && <label>Their Share</label>}
                      <input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        value={p.amount}
                        onChange={(e) => handleParticipantChange(index, "amount", e.target.value)}
                        required={isShared}
                      />
                    </div>
                    <div style={{ paddingBottom: "2px" }}>
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
                          transition: "all 0.15s",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addParticipant}
                style={{
                  marginTop: "12px",
                  background: "none",
                  border: "1.5px dashed var(--primary-light)",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  color: "var(--primary)",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  width: "100%",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "white")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                + Add Participant
              </button>

              {isOverBudget && (
                <p
                  style={{
                    marginTop: "10px",
                    color: "var(--danger)",
                    fontSize: "13px",
                    fontWeight: "500",
                    textAlign: "center",
                  }}
                >
                  ⚠️ Shares exceed total amount by ${Math.abs(remaining).toFixed(2)}.
                </p>
              )}
            </div>
          )}

          {error && (
            <p style={{ color: "var(--danger)", fontSize: "13px", marginTop: "10px" }}>{error}</p>
          )}
        </form>
      </div>

      {/* Expenses Table */}
      <div className="card">
        <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "18px" }}>All Expenses</h3>
        {loading ? (
          <Loader fullPage />
        ) : expenses.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No expenses found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: "8px 0", fontWeight: "500" }}>Date</th>
                <th style={{ textAlign: "left", padding: "8px 0", fontWeight: "500" }}>
                  Description
                </th>
                <th style={{ textAlign: "left", padding: "8px 0", fontWeight: "500" }}>Category</th>
                <th style={{ textAlign: "center", padding: "8px 0", fontWeight: "500" }}>Type</th>
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
                  <td
                    style={{
                      padding: "13px 0",
                      color: "var(--text-muted)",
                      maxWidth: "140px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {exp.description || "—"}
                  </td>
                  <td style={{ padding: "13px 0" }}>
                    <span
                      style={{
                        background: "var(--primary-bg)",
                        color: "var(--primary)",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "500",
                      }}
                    >
                      {exp.category?.name || "—"}
                    </span>
                  </td>
                  <td style={{ padding: "13px 0", textAlign: "center" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        background: exp.is_shared ? "#e0f2fe" : "#f3f4f6",
                        color: exp.is_shared ? "#0369a1" : "#4b5563",
                      }}
                    >
                      {exp.is_shared ? (exp.is_creator ? "Shared (You)" : "Shared") : "Personal"}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "13px 0",
                      textAlign: "right",
                      fontWeight: "600",
                      color: "var(--danger)",
                    }}
                  >
                    -${exp.my_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: "13px 0", textAlign: "right" }}>
                    <ActionMenu
                      onView={() => setViewTarget(exp)}
                      onEdit={() => setUpdateTarget(exp)}
                      onDelete={() => setDeleteTarget(exp)}
                      canModify={canModify(exp)}
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
