import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const Settings = () => {
  const { user } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [passwordForm, setPasswordForm] = useState({ current_password: "", new_password: "", confirm: "" });
  const [profileMsg, setProfileMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleProfileChange = (e) => setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg(""); setProfileError("");
    try {
      await api.patch("/users/me", profileForm);
      setProfileMsg("Profile updated successfully.");
    } catch (err) {
      setProfileError("Failed to update profile.");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg(""); setPasswordError("");
    if (passwordForm.new_password !== passwordForm.confirm) {
      setPasswordError("New passwords do not match.");
      return;
    }
    try {
      await api.patch("/users/me/password", {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordMsg("Password changed successfully.");
      setPasswordForm({ current_password: "", new_password: "", confirm: "" });
    } catch (err) {
      setPasswordError(err.response?.data?.detail || "Failed to change password.");
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "700" }}>Settings</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
          Manage your account details
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "520px" }}>

        {/* Profile */}
        <div className="card">
          <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "20px" }}>Profile Information</h3>
          <form onSubmit={handleProfileSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label>Full Name</label>
              <input type="text" name="name" value={profileForm.name} onChange={handleProfileChange} required />
            </div>
            <div>
              <label>Email</label>
              <input type="email" name="email" value={profileForm.email} onChange={handleProfileChange} required />
            </div>
            {profileMsg && <p style={{ color: "var(--success)", fontSize: "13px" }}>{profileMsg}</p>}
            {profileError && <p style={{ color: "var(--danger)", fontSize: "13px" }}>{profileError}</p>}
            <button className="btn-primary" type="submit" style={{ alignSelf: "flex-start", padding: "10px 24px" }}>
              Save Changes
            </button>
          </form>
        </div>

        {/* Password */}
        <div className="card">
          <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "20px" }}>Change Password</h3>
          <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label>Current Password</label>
              <input type="password" name="current_password" placeholder="••••••••"
                value={passwordForm.current_password} onChange={handlePasswordChange} required />
            </div>
            <div>
              <label>New Password</label>
              <input type="password" name="new_password" placeholder="••••••••"
                value={passwordForm.new_password} onChange={handlePasswordChange} required />
            </div>
            <div>
              <label>Confirm New Password</label>
              <input type="password" name="confirm" placeholder="••••••••"
                value={passwordForm.confirm} onChange={handlePasswordChange} required />
            </div>
            {passwordMsg && <p style={{ color: "var(--success)", fontSize: "13px" }}>{passwordMsg}</p>}
            {passwordError && <p style={{ color: "var(--danger)", fontSize: "13px" }}>{passwordError}</p>}
            <button className="btn-primary" type="submit" style={{ alignSelf: "flex-start", padding: "10px 24px" }}>
              Update Password
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Settings;