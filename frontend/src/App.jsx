import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

// Protected Route: Only allows logged-in users, otherwise redirects to login
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Show a loading state while checking session
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
    // Wrap with AuthProvider only (Do NOT wrap with BrowserRouter here if it's already in main.jsx)
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}