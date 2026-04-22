import { createContext, useContext, useEffect, useState } from "react";
import { loginUser } from "../api/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const stored = localStorage.getItem("user_data");

    if (token) {
      setIsAuthenticated(true);
    }
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  async function login(formData) {
    const data = await loginUser(formData);

    localStorage.setItem("access_token", data.access || "");
    localStorage.setItem("refresh_token", data.refresh || "");
    if (data.user) {
      localStorage.setItem("user_data", JSON.stringify(data.user));
      setUser(data.user);
    }

    setIsAuthenticated(true);

    return data;
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");

    setIsAuthenticated(false);
    setUser(null);
  }

  function updateUser(updated) {
    setUser(updated);
    localStorage.setItem("user_data", JSON.stringify(updated));
  }

  const userEmail = user?.email || "";
  const username = user?.username || "";
  const userId = user?.id || null;

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, userEmail, username, userId, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}