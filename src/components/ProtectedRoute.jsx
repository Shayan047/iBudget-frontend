import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";

const ProtectedRoute = () => {
  const { token } = useAuth();

  if (!token) return <Navigate to="/login" />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar />
      <main style={{ marginLeft: "var(--sidebar-width)", flex: 1, padding: "36px 40px" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedRoute;