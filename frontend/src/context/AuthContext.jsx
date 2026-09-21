import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // పేజీ రిఫ్రెష్ చేసినప్పుడు localStorage నుండి యూజర్ మరియు టోకెన్ రీస్టోర్ చేసుకోవడం
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (token && savedUser) {
          // సేవ్ చేసుకున్న యూజర్ డీటెయిల్స్ మరియు టోకెన్‌ని సెట్ చేయడం
          setUser(JSON.parse(savedUser));
        }
      } catch (err) {
        console.error("Failed to parse saved user session:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData, token) => {
    if (token) {
      localStorage.setItem("token", token);
    }
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    }
    setUser(userData);
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (err) {
      console.error("Logout error", err);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;