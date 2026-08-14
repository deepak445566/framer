import { createContext, useContext, useState, useEffect } from "react";
import { adminLogin, adminLogout, getAdminMe } from "../api/adminApi.js";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await getAdminMe();
        setAdmin(res.data.admin);
      } catch (err) {
        setAdmin(null);
      } finally {
        setCheckingAuth(false);
      }
    };
    fetchMe();
  }, []);

  const login = async (formData) => {
    const res = await adminLogin(formData);
    const me = await getAdminMe();
    setAdmin(me.data.admin);
    return res.data;
  };

  const logout = async () => {
    await adminLogout();
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, checkingAuth, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);