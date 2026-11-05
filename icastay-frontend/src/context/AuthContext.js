"use client";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al cargar la web, verificamos si ya había una sesión guardada en el navegador
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedToken = localStorage.getItem("icastay_token");
      const savedUser = localStorage.getItem("icastay_user");
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const iniciarSesion = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("icastay_token", userToken);
    localStorage.setItem("icastay_user", JSON.stringify(userData));
  };

  const actualizarUsuario = (userData) => {
    setUser(userData);
    localStorage.setItem("icastay_user", JSON.stringify(userData));
  };

  const cerrarSesion = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("icastay_token");
    localStorage.removeItem("icastay_user");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, iniciarSesion, actualizarUsuario, cerrarSesion }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);