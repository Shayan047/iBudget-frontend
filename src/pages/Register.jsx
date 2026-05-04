import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/Loader";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "800",
              color: "var(--primary)",
              marginBottom: "8px",
            }}
          >
            iBudget
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
            Create your account to get started.
          </p>
        </div>

        <div className="card">
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          >
            <div>
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirm"
                placeholder="••••••••"
                value={form.confirm}
                onChange={handleChange}
                required
              />
            </div>

            {error && (
              <p style={{ color: "var(--danger)", fontSize: "13px", textAlign: "center" }}>
                {error}
              </p>
            )}

            <button
              className="btn-primary"
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "13px", marginTop: "4px", fontSize: "15px" }}
            >
              {loading ? <Loader size="small" /> : "Create Account"}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: "20px",
              fontSize: "14px",
              color: "var(--text-muted)",
            }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
