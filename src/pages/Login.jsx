import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
        const res = await api.post("/auth/login", {
          email: form.email,
          password: form.password,
        });
        console.log(res);
        login(null, res.data.auth.access_token);
        navigate("/home");
    } catch (err) {
        setError("Invalid email or password.");
    } finally {
        setLoading(false);
    }
};

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "800", color: "var(--primary)", marginBottom: "8px" }}>
            iBudget
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
            Welcome back! Sign in to your account.
          </p>
        </div>

        {/* Card */}
        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label>Email</label>
              <input
                type="email" name="email" placeholder="you@example.com"
                value={form.email} onChange={handleChange} required
              />
            </div>
            <div>
              <label>Password</label>
              <input
                type="password" name="password" placeholder="••••••••"
                value={form.password} onChange={handleChange} required
              />
            </div>

            {error && (
              <p style={{ color: "var(--danger)", fontSize: "13px", textAlign: "center" }}>{error}</p>
            )}

            <button className="btn-primary" type="submit" disabled={loading}
              style={{ width: "100%", padding: "13px", marginTop: "4px", fontSize: "15px" }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "var(--text-muted)" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;