import { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";

const Taxes = () => {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTaxes = async () => {
      try {
        const res = await api.get("/taxes/");
        setTaxes(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTaxes();
  }, []);

  const totalMyTax = taxes.reduce((sum, t) => sum + (t.my_tax_amount || 0), 0);

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "700" }}>Taxes</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
          View taxes applied to your expenses and income
        </p>
      </div>

      {/* Summary card */}
      <div
        className="card"
        style={{ marginBottom: "24px", display: "inline-block", minWidth: "220px" }}
      >
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-muted)",
            marginBottom: "8px",
            fontWeight: "500",
          }}
        >
          Total Tax Owed
        </p>
        <p
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "var(--primary)",
            fontFamily: "Syne, sans-serif",
          }}
        >
          ${totalMyTax.toFixed(2)}
        </p>
      </div>

      {/* Tax table */}
      <div className="card">
        <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "18px" }}>All Taxes</h3>
        {loading ? (
          <Loader fullPage />
        ) : taxes.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No taxes found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: "8px 0", fontWeight: "500" }}>
                  Description
                </th>
                <th style={{ textAlign: "center", padding: "8px 0", fontWeight: "500" }}>Type</th>
                <th style={{ textAlign: "right", padding: "8px 0", fontWeight: "500" }}>
                  Total Tax
                </th>
                <th style={{ textAlign: "right", padding: "8px 0", fontWeight: "500" }}>
                  Your Share
                </th>
              </tr>
            </thead>
            <tbody>
              {taxes.map((tax, index) => (
                <tr key={`${tax.id}-${index}`} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td
                    style={{
                      padding: "13px 0",
                      color: "var(--text-muted)",
                      maxWidth: "200px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tax.description || "—"}
                  </td>
                  <td style={{ padding: "13px 0", textAlign: "center" }}>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "500",
                        background: tax.income_id ? "#f0fdf4" : "#eff6ff",
                        color: tax.income_id ? "var(--success)" : "var(--primary)",
                      }}
                    >
                      {tax.income_id ? "Income" : tax.is_derived ? "Shared Expense" : "Expense"}
                    </span>
                  </td>
                  <td style={{ padding: "13px 0", textAlign: "right", color: "var(--text-muted)" }}>
                    ${tax.amount.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "13px 0",
                      textAlign: "right",
                      fontWeight: "600",
                      color: "var(--primary)",
                    }}
                  >
                    ${tax.my_tax_amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && taxes.length > 0 && (
          <p
            style={{
              marginTop: "16px",
              fontSize: "12px",
              color: "var(--text-muted)",
              textAlign: "right",
            }}
          >
            Taxes are added when creating or editing an expense. Shared expense taxes are split
            equally.
          </p>
        )}
      </div>
    </div>
  );
};

export default Taxes;
