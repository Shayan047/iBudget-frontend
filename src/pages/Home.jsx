import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const COLORS = ["#3730a3", "#ef4444"];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

const StatCard = ({ label, value, color }) => (
  <div className="card" style={{ flex: 1 }}>
    <p
      style={{
        fontSize: "13px",
        color: "var(--text-muted)",
        marginBottom: "10px",
        fontWeight: "500",
      }}
    >
      {label}
    </p>
    <p
      style={{
        fontSize: "26px",
        fontWeight: "700",
        color: color || "var(--text)",
        fontFamily: "Syne, sans-serif",
      }}
    >
      ${Number(value || 0).toLocaleString()}
    </p>
  </div>
);

const Home = () => {
  const { user } = useAuth();
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async (m, y) => {
    setLoading(true);
    try {
      const res = await api.get("/dashboard/", { params: { month: m, year: y } });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(month, year);
  }, [month, year]);

  // Check if a month/year combo is in the future
  const isFuture = (m, y) => {
    if (y > now.getFullYear()) return true;
    if (y === now.getFullYear() && m > now.getMonth() + 1) return true;
    return false;
  };

  const handlePrev = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNext = () => {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    if (isFuture(nextMonth, nextYear)) return; // block future navigation
    setMonth(nextMonth);
    setYear(nextYear);
  };

  // When year dropdown changes, clamp month to current if needed
  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    setYear(newYear);
    if (newYear === now.getFullYear() && month > now.getMonth() + 1) {
      setMonth(now.getMonth() + 1);
    }
  };

  const isNextDisabled = isFuture(month === 12 ? 1 : month + 1, month === 12 ? year + 1 : year);

  const pieData = data
    ? [
        { name: "Income", value: data.total_income },
        { name: "Expenses", value: data.total_expenses },
      ]
    : [];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "700" }}>Hello {user?.name || "there"} 👋</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
          Here's your financial overview
        </p>
      </div>

      {/* Month Navigator */}
      <div
        className="card"
        style={{ marginBottom: "24px", padding: "16px 24px", display: "inline-block" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          {/* Prev Arrow */}
          <button
            onClick={handlePrev}
            style={{
              background: "var(--primary-bg)",
              border: "none",
              borderRadius: "8px",
              padding: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              color: "var(--primary)",
            }}
          >
            <ChevronLeftIcon style={{ width: "18px", height: "18px" }} />
          </button>

          {/* Month Dropdown */}
          <select
            value={month}
            onChange={(e) => {
              const newMonth = parseInt(e.target.value);
              if (!isFuture(newMonth, year)) setMonth(newMonth);
            }}
            style={{ width: "140px" }}
          >
            {MONTHS.map((m, i) => {
              const future = isFuture(i + 1, year);
              return (
                <option key={m} value={i + 1} disabled={future}>
                  {m}
                </option>
              );
            })}
          </select>

          {/* Year Dropdown */}
          <select value={year} onChange={handleYearChange} style={{ width: "100px" }}>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Next Arrow — disabled when next would be future */}
          <button
            onClick={handleNext}
            disabled={isNextDisabled}
            style={{
              background: isNextDisabled ? "var(--border)" : "var(--primary-bg)",
              border: "none",
              borderRadius: "8px",
              padding: "8px",
              cursor: isNextDisabled ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              color: isNextDisabled ? "var(--text-muted)" : "var(--primary)",
              transition: "all 0.15s",
            }}
          >
            <ChevronRightIcon style={{ width: "18px", height: "18px" }} />
          </button>

          <span style={{ color: "var(--text-muted)", fontSize: "14px", marginLeft: "4px" }}>
            {MONTHS[month - 1]} {year}
          </span>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading...</p>
      ) : (
        <>
          {/* Stat Cards */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
            <StatCard label="Total Income" value={data?.total_income} color="var(--success)" />
            <StatCard label="Total Expenses" value={data?.total_expenses} color="var(--danger)" />
            <StatCard label="Budget" value={data?.budget} color="var(--primary)" />
            <StatCard
              label="Remaining Balance"
              value={data?.remaining_balance}
              color={data?.remaining_balance >= 0 ? "var(--success)" : "var(--danger)"}
            />
          </div>

          {/* Chart + Expenses Table */}
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {/* Pie Chart */}
            <div className="card" style={{ flex: 1, minWidth: "280px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px" }}>
                Income vs Expenses
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `$${val.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Expenses Table */}
            <div className="card" style={{ flex: 2, minWidth: "300px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px" }}>
                Expenses for {MONTHS[month - 1]} {year}
              </h3>
              {data?.expenses.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                  No expenses for this month.
                </p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr
                      style={{
                        color: "var(--text-muted)",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <th style={{ textAlign: "left", padding: "8px 0", fontWeight: "500" }}>
                        Date
                      </th>
                      <th style={{ textAlign: "left", padding: "8px 0", fontWeight: "500" }}>
                        Category
                      </th>
                      <th style={{ textAlign: "center", padding: "8px 0", fontWeight: "500" }}>
                        Type
                      </th>
                      <th style={{ textAlign: "right", padding: "8px 0", fontWeight: "500" }}>
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.expenses.map((exp) => (
                      <tr key={exp.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px 0", color: "var(--text-muted)" }}>
                          {new Date(exp.date).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "12px 0" }}>
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
                            {exp.category_name || "—"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 0", textAlign: "center" }}>
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
                            {exp.is_shared ? "Shared" : "Personal"}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "12px 0",
                            textAlign: "right",
                            fontWeight: "600",
                            color: "var(--danger)",
                          }}
                        >
                          -${exp.my_amount?.toFixed(2) || exp.amount?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
