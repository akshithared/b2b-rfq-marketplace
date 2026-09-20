import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, [token]);

  const loginUser = (userData, userToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userToken);
    setUser(userData);
    setToken(userToken);
  };

  const logoutUser = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken("");
  };

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logoutUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);