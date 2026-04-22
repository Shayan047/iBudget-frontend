import { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "./Loader";

const ExpenseDetailModal = ({ expenseId, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/expenses/${expenseId}`);
        setDetail(res.data);
      } catch (err) {
        console.error("Failed to fetch expense details", err);
      } finally {
        setLoading(false);
      }
    };
    if (expenseId) fetchDetail();
  }, [expenseId]);

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
          maxWidth: "500px",
          padding: "32px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header always visible */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>Expense Details</h3>
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

        {/* Show loader while fetching */}
        {loading ? (
          <Loader fullPage />
        ) : !detail ? (
          <p style={{ color: "var(--danger)", fontSize: "14px", textAlign: "center" }}>
            Failed to load expense details.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Description:</span>
              <span style={{ fontWeight: "600" }}>{detail.description || "No description"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Category:</span>
              <span>{detail.category?.name || "Uncategorized"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Date:</span>
              <span>{new Date(detail.date).toLocaleDateString()}</span>
            </div>

            <hr
              style={{ border: "none", borderBottom: "1px solid var(--border)", margin: "4px 0" }}
            />

            {detail.is_shared ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Total Shared Amount:</span>
                  <span style={{ fontWeight: "700", color: "var(--danger)" }}>
                    ${detail.total_amount?.toFixed(2)}
                  </span>
                </div>

                <h4
                  style={{
                    fontSize: "13px",
                    marginTop: "8px",
                    marginBottom: "4px",
                    fontWeight: "600",
                  }}
                >
                  Participants Breakdown
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {detail.participants?.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        padding: "12px",
                        background: "var(--primary-bg)",
                        borderRadius: "10px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: "600", fontSize: "13px" }}>
                          {p.user_name}{" "}
                          {p.is_creator && (
                            <small style={{ color: "var(--primary)" }}>(Creator)</small>
                          )}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {p.user_email}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            marginTop: "2px",
                            color: p.status === "paid" ? "var(--success)" : "var(--text-muted)",
                            fontWeight: "500",
                          }}
                        >
                          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: "600" }}>${p.amount.toFixed(2)}</div>
                        {p.tax_amount && (
                          <div style={{ fontSize: "11px", color: "var(--primary)" }}>
                            Tax: ${p.tax_amount.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <span style={{ color: "var(--text-muted)" }}>Amount:</span>
                <span style={{ fontWeight: "700", color: "var(--danger)", fontSize: "18px" }}>
                  ${detail.amount?.toFixed(2)}
                </span>
              </div>
            )}

            {detail.tax && (
              <div
                style={{
                  marginTop: "8px",
                  padding: "10px",
                  border: "1px dashed var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  textAlign: "center",
                }}
              >
                Applied Tax: <strong>${detail.tax.amount.toFixed(2)}</strong>
              </div>
            )}
          </div>
        )}

        <button
          className="btn-primary"
          onClick={onClose}
          style={{ width: "100%", marginTop: "24px", padding: "12px" }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ExpenseDetailModal;
