import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const Settings = () => {
  const { user, login, token } = useAuth();

  const [nameForm, setNameForm] = useState({ name: user?.name || "" });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm: "",
  });

  const [nameMsg, setNameMsg] = useState("");
  const [nameError, setNameError] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const initials = user?.name ? user.name.charAt(0).toUpperCase() : "?";

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    setNameMsg("");
    setNameError("");
    setNameSaving(true);
    try {
      const res = await api.patch("/users/me", { name: nameForm.name });
      // Update auth context with new name
      login({ ...user, name: res.data.name }, token);
      setNameMsg("Name updated successfully.");
    } catch (err) {
      setNameError(err.response?.data?.detail || "Failed to update name.");
    } finally {
      setNameSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg("");
    setPasswordError("");
    if (passwordForm.new_password !== passwordForm.confirm) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setPasswordSaving(true);
    try {
      await api.patch("/users/me/password", {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordMsg("Password changed successfully.");
      setPasswordForm({ current_password: "", new_password: "", confirm: "" });
    } catch (err) {
      setPasswordError(err.response?.data?.detail || "Failed to change password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "700" }}>Settings</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
          Manage your account
        </p>
      </div>

      {/* Profile header card */}
      <div
        className="card"
        style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "20px" }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "var(--primary)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            fontWeight: "700",
            fontFamily: "Syne, sans-serif",
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div>
          <p
            style={{
              fontWeight: "700",
              fontSize: "18px",
              margin: 0,
              fontFamily: "Syne, sans-serif",
            }}
          >
            {user?.name}
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>
            {user?.email}
          </p>
        </div>
      </div>

      {/* Two column forms */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {/* Update Name */}
        <div className="card" style={{ flex: 1, minWidth: "280px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "20px" }}>Update Name</h3>
          <form
            onSubmit={handleNameSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={nameForm.name}
                onChange={(e) => setNameForm({ name: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                style={{
                  background: "var(--bg)",
                  cursor: "not-allowed",
                  color: "var(--text-muted)",
                }}
              />
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                Email cannot be changed
              </p>
            </div>
            {nameMsg && <p style={{ color: "var(--success)", fontSize: "13px" }}>{nameMsg}</p>}
            {nameError && <p style={{ color: "var(--danger)", fontSize: "13px" }}>{nameError}</p>}
            <button
              className="btn-primary"
              type="submit"
              disabled={nameSaving}
              style={{ alignSelf: "flex-start", padding: "10px 24px" }}
            >
              {nameSaving ? "Saving..." : "Save Name"}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card" style={{ flex: 1, minWidth: "280px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "20px" }}>
            Change Password
          </h3>
          <form
            onSubmit={handlePasswordSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <label>Current Password</label>
              <input
                type="password"
                name="current_password"
                placeholder="••••••••"
                value={passwordForm.current_password}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, current_password: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label>New Password</label>
              <input
                type="password"
                name="new_password"
                placeholder="••••••••"
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirm"
                placeholder="••••••••"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                required
              />
            </div>
            {passwordMsg && (
              <p style={{ color: "var(--success)", fontSize: "13px" }}>{passwordMsg}</p>
            )}
            {passwordError && (
              <p style={{ color: "var(--danger)", fontSize: "13px" }}>{passwordError}</p>
            )}
            <button
              className="btn-primary"
              type="submit"
              disabled={passwordSaving}
              style={{ alignSelf: "flex-start", padding: "10px 24px" }}
            >
              {passwordSaving ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
