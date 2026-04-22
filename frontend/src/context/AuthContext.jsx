import { createContext, useContext, useEffect, useState } from "react";
import { loginUser } from "../api/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const email = localStorage.getItem("user_email");

    if (token) {
      setIsAuthenticated(true);
    }
    if (email) {
      setUserEmail(email);
    }
  }, []);

  async function login(formData) {
    const data = await loginUser(formData);

    localStorage.setItem("access_token", data.access || "");
    localStorage.setItem("refresh_token", data.refresh || "");
    localStorage.setItem("user_email", formData.email);

    setIsAuthenticated(true);
    setUserEmail(formData.email);

    return data;
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_email");

    setIsAuthenticated(false);
    setUserEmail("");
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, userEmail, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}