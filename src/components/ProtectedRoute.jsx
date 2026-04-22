import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const ProtectedRoute = () => {
  const { token } = useAuth();

  if (!token) return <Navigate to="/login" />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar />
      <div
        style={{
          marginLeft: "var(--sidebar-width)",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Topbar />
        <main style={{ flex: 1, padding: "32px 40px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProtectedRoute;
