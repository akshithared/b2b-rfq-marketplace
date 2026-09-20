import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="brand-icon">B2B</div>
        <span>RFQ Marketplace</span>
      </Link>
      <div>
        {user ? (
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <span style={{ fontSize: "0.9rem", color: "#334155", fontWeight: "600" }}>
              {user.name}{" "}
              <span className={`badge badge-${user.role.toLowerCase()}`} style={{ marginLeft: "6px" }}>
                {user.role}
              </span>
            </span>
            <button onClick={handleLogout} className="btn btn-danger" style={{ padding: "6px 14px", fontSize: "0.85rem" }}>
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "12px" }}>
            <Link to="/login" className="btn btn-primary">Login</Link>
            <Link to="/register" className="btn btn-secondary">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
}