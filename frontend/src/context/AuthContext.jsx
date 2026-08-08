import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true); // initial page-load check

  // Page load / refresh pe check karo ki user already logged in hai ya nahi
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };
    fetchMe();
  }, []);

  const register = async (formData) => {
    const res = await api.post("/auth/register", formData);
    setUser(res.data.user);
    return res.data;
  };

  const login = async (formData) => {
    const res = await api.post("/auth/login", formData);
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  const forgetPassword = async (formData) => {
    const res = await api.post("/auth/forget", formData);
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, setLoading, checkingAuth, register, login, logout, forgetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);