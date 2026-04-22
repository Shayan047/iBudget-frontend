import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  HomeIcon,
  CreditCardIcon,
  BanknotesIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { to: "/budgetbot", label: "BudgetBot", icon: ChatBubbleLeftRightIcon },
  { to: "/home", label: "Dashboard", icon: HomeIcon },
  { to: "/expenses", label: "Expenses", icon: CreditCardIcon },
  { to: "/income", label: "Income", icon: BanknotesIcon },
  { to: "/budget", label: "Budget", icon: ChartBarIcon },
  { to: "/settings", label: "Settings", icon: Cog6ToothIcon },
];

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside
      style={{
        width: "var(--sidebar-width)",
        background: "white",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "32px 20px",
      }}
    >
      <div style={{ marginBottom: "48px", paddingLeft: "8px" }}>
        <h1
          style={{
            fontSize: "22px",
            fontWeight: "800",
            color: "var(--primary)",
            fontFamily: "Syne, sans-serif",
          }}
        >
          iBudget
        </h1>
      </div>

      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "11px 14px",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "500",
              color: isActive ? "var(--primary)" : "var(--text-muted)",
              background: isActive ? "var(--primary-bg)" : "transparent",
              transition: "all 0.15s ease",
            })}
          >
            <Icon style={{ width: "18px", height: "18px" }} />
            {label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "11px 14px",
          borderRadius: "10px",
          border: "none",
          background: "transparent",
          color: "var(--text-muted)",
          fontSize: "14px",
          fontWeight: "500",
          cursor: "pointer",
          width: "100%",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--danger)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        <ArrowLeftStartOnRectangleIcon style={{ width: "18px", height: "18px" }} />
        Log out
      </button>
    </aside>
  );
};

export default Sidebar;
