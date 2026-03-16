import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const COLORS = ["#3730a3", "#22c55e", "#f59e0b", "#6366f1"];

const StatCard = ({ label, value, color }) => (
  <div className="card" style={{ flex: 1 }}>
    <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "10px", fontWeight: "500" }}>{label}</p>
    <p style={{ fontSize: "26px", fontWeight: "700", color: color || "var(--text)", fontFamily: "Syne, sans-serif" }}>
      ${Number(value || 0).toLocaleString()}
    </p>
  </div>
);

const Home = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ income: 0, expenses: 0, budget: 0 });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incomeRes, expensesRes, budgetRes] = await Promise.all([
          api.get("/incomes/"),
          api.get("/expenses/"),
          api.get("/budgets/"),
        ]);

        const totalIncome = incomeRes.data.reduce((s, i) => s + i.amount, 0);
        const totalExpenses = expensesRes.data.reduce((s, e) => s + e.amount, 0);
        const latestBudget = budgetRes.data.at(-1)?.amount || 0;

        setData({ income: totalIncome, expenses: totalExpenses, budget: latestBudget });
        setRecentExpenses(expensesRes.data.slice(-5).reverse());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const remaining = data.income - data.expenses;
  const pieData = [
    { name: "Income", value: data.income },
    { name: "Expenses", value: data.expenses },
  ];

  if (loading) return <p style={{ color: "var(--text-muted)" }}>Loading...</p>;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "700" }}>
          Hello {user?.name || "there"} 👋
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
          Here's your financial overview
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "28px", flexWrap: "wrap" }}>
        <StatCard label="Total Income" value={data.income} color="var(--success)" />
        <StatCard label="Total Expenses" value={data.expenses} color="var(--danger)" />
        <StatCard label="Budget" value={data.budget} color="var(--primary)" />
        <StatCard label="Remaining Balance" value={remaining} color={remaining >= 0 ? "var(--success)" : "var(--danger)"} />
      </div>

      {/* Chart + Recent Expenses */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>

        {/* Pie Chart */}
        <div className="card" style={{ flex: 1, minWidth: "280px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px" }}>Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100}
                paddingAngle={4} dataKey="value">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => `$${val.toLocaleString()}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Expenses */}
        <div className="card" style={{ flex: 2, minWidth: "300px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px" }}>Recent Expenses</h3>
          {recentExpenses.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No expenses yet.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>
                  <th style={{ textAlign: "left", padding: "8px 0", fontWeight: "500" }}>Date</th>
                  <th style={{ textAlign: "left", padding: "8px 0", fontWeight: "500" }}>Category</th>
                  <th style={{ textAlign: "right", padding: "8px 0", fontWeight: "500" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentExpenses.map((exp) => (
                  <tr key={exp.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 0", color: "var(--text-muted)" }}>
                      {new Date(exp.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "12px 0" }}>{exp.category?.name || "—"}</td>
                    <td style={{ padding: "12px 0", textAlign: "right", color: "var(--danger)", fontWeight: "600" }}>
                      -${exp.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;