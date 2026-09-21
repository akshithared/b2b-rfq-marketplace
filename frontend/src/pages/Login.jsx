import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Make API call to your backend login endpoint
      const res = await API.post("/auth/login", { email, password });
      
      const { user, token } = res.data;

      // Pass user and token to AuthContext so it saves to localStorage & updates state
      login(user, token);
      
      navigate("/dashboard");
    } catch (err) {
      const apiMessage = err.response?.data?.message || err.message;
      setError(apiMessage || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "420px", marginTop: "60px" }}>
      <div className="card">
        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "8px" }}>Welcome Back</h2>
        <p style={{ color: "var(--text-muted, #64748b)", fontSize: "0.9rem", marginBottom: "20px" }}>
          Sign in to access your B2B Marketplace workspace.
        </p>

        {error && (
          <div style={{ padding: "10px 14px", background: "#fee2e2", color: "#b91c1c", borderRadius: "6px", marginBottom: "16px", fontSize: "0.875rem" }}>
            <strong>Error:</strong> {error}
          </div>
        )}

<form onSubmit={handleSubmit} autoComplete="off">
  <div className="form-group" style={{ marginBottom: "16px" }}>
    <label htmlFor="login-email" style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>
      Email Address
    </label>
    <input
      id="login-email"
      name="login_email_field"
      type="email"
      required
      autoComplete="off"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="name@company.com"
      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
    />
  </div>

  <div className="form-group" style={{ marginBottom: "20px" }}>
    <label htmlFor="login-password" style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>
      Password
    </label>
    <input
      id="login-password"
      name="login_password_field"
      type="password"
      required
      autoComplete="new-password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="••••••••"
      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
    />
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
    {loading ? "Signing In..." : "Sign In"}
  </button>
</form>

        <p style={{ marginTop: "20px", fontSize: "0.875rem", color: "#64748b", textAlign: "center" }}>
          Don't have an account? <Link to="/register" style={{ color: "#2563eb", fontWeight: "600" }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}