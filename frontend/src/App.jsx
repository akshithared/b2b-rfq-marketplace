import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register"; // <--- ఇక్కడ రిజిస్టర్ ఇంపోర్ట్ చేయబడింది
import Dashboard from "./pages/Dashboard";

// Protected Route: Only allows logged-in users, otherwise redirects to login
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px", fontSize: "1.2rem", color: "#64748b" }}>
        Loading your session...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

// Public Route: Redirects to dashboard if user is already logged in
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px", fontSize: "1.2rem", color: "#64748b" }}>
        Loading...
      </div>
    );
  }

  return !user ? children : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Login page route */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />

      {/* Register page route (ఇక్కడ పర్‌ఫెక్ట్‌గా యాడ్ చేయబడింది) */}
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />

      {/* Dashboard page route (Protected) */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}