import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/login", { email, password });
      loginUser(res.data.data.user, res.data.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "400px", marginTop: "50px" }}>
      <div className="card">
        <h2>Sign In</h2>
        {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
        <p style={{ marginTop: "15px", textAlign: "center" }}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}