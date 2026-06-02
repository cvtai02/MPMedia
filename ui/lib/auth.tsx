"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getMe, Admin } from "./api";

interface AuthState { admin: Admin | null; loading: boolean; logout: () => void }
const AuthContext = createContext<AuthState>({ admin: null, loading: true, logout: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    getMe().then(setAdmin).catch(() => localStorage.removeItem("token")).finally(() => setLoading(false));
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setAdmin(null);
    window.location.href = "/login";
  };

  return <AuthContext.Provider value={{ admin, loading, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
