import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px 24px",
      borderBottom: "1px solid var(--border, #e2e8f0)",
      backgroundColor: "#ffffff",
      marginBottom: "24px"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Link to="/dashboard" style={{ textDecoration: "none", color: "inherit", fontWeight: "700", fontSize: "1.2rem" }}>
          B2B <span style={{ color: "var(--primary, #2563eb)" }}>RFQ Marketplace</span>
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {user ? (
          <>
            <span style={{ fontSize: "0.9rem", color: "#64748b" }}>
              Logged in as: <strong>{user.name || user.email}</strong>
            </span>
            <button
              onClick={logout}
              style={{
                backgroundColor: "#ef4444",
                color: "#ffffff",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "0.875rem"
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <div style={{ display: "flex", gap: "12px" }}>
            <Link to="/login" style={{ textDecoration: "none", color: "#2563eb", fontWeight: "600" }}>Login</Link>
            <Link to="/register" style={{ textDecoration: "none", color: "#2563eb", fontWeight: "600" }}>Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
}