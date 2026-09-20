import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("BUYER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/register", { name, email, password, role });
      loginUser(res.data.data.user, res.data.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "450px", marginTop: "40px" }}>
      <div className="card">
        <h2>Create Account</h2>
        {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name / Company</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Password (min 8 chars)</label>
            <input type="password" required minLength="8" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="form-group">
            <label>I am a:</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="BUYER">Buyer (Looking to post RFQs)</option>
              <option value="SUPPLIER">Supplier (Looking to submit bids)</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>
        <p style={{ marginTop: "15px", textAlign: "center" }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}