import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("BUYER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(name, email, password, role);
      navigate("/dashboard");
    } catch (err) {
      // Show exact message from backend response if available
      const apiMessage = err.response?.data?.message || err.message;
      setError(apiMessage || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "460px", marginTop: "40px" }}>
      <div className="card">
        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "8px" }}>Create Account</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "20px" }}>
          Join as a Buyer to post RFQs or a Supplier to submit quotes.
        </p>

        {error && (
          <div style={{ padding: "10px 14px", background: "#fee2e2", color: "#b91c1c", borderRadius: "6px", marginBottom: "16px", fontSize: "0.875rem" }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reg-name">Full Name or Company</label>
            <input
              id="reg-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Corp / John Doe"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Business Email</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-role">Select Account Role</label>
            <select
              id="reg-role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="BUYER">Buyer (Post RFQs & Receive Bids)</option>
              <option value="SUPPLIER">Supplier (Browse RFQs & Submit Bids)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "8px" }} disabled={loading}>
            {loading ? "Creating Account..." : "Complete Registration"}
          </button>
        </form>

        <p style={{ marginTop: "20px", fontSize: "0.875rem", color: "var(--text-muted)", textAlign: "center" }}>
          Already have an account? <Link to="/login" style={{ color: "var(--primary)", fontWeight: "600" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}