import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("BUYER"); // Updated to uppercase to match backend requirement
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/register", { name, email, password, role });
      const { user, token } = res.data;

      login(user, token);
      navigate("/dashboard");
    } catch (err) {
      const apiMessage = err.response?.data?.message || err.message;
      setError(apiMessage || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "420px", marginTop: "60px" }}>
      <div className="card">
        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "8px" }}>Create Account</h2>
        <p style={{ color: "var(--text-muted, #64748b)", fontSize: "0.9rem", marginBottom: "20px" }}>
          Join the B2B RFQ Marketplace workspace.
        </p>

        {error && (
          <div style={{ padding: "10px 14px", background: "#fee2e2", color: "#b91c1c", borderRadius: "6px", marginBottom: "16px", fontSize: "0.875rem" }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>I am a</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#fff" }}
            >
              <option value="BUYER">Buyer</option>
              <option value="SUPPLIER">Supplier</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: "100%", 
              padding: "12px", 
              backgroundColor: "var(--primary, #2563eb)", 
              color: "#fff", 
              border: "none", 
              borderRadius: "6px", 
              fontWeight: "600", 
              cursor: "pointer" 
            }}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p style={{ marginTop: "20px", fontSize: "0.875rem", color: "#64748b", textAlign: "center" }}>
          Already have an account? <Link to="/login" style={{ color: "#2563eb", fontWeight: "600" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}