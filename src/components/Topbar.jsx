import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Topbar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const initials = user?.name ? user.name.charAt(0).toUpperCase() : "?";

  return (
    <div
      style={{
        height: "64px",
        background: "white",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "0 40px",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      {/* User info + avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ textAlign: "right" }}>
          <p
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "var(--text)",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {user?.name || "User"}
          </p>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0, lineHeight: 1.3 }}>
            {user?.email || ""}
          </p>
        </div>

        {/* Avatar circle */}
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: "var(--primary)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "15px",
            fontWeight: "700",
            fontFamily: "Syne, sans-serif",
            flexShrink: 0,
            userSelect: "none",
          }}
        >
          {initials}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
