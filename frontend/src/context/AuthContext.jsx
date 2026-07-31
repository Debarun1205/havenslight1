import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { loginUser, registerUser, fetchMe, googleLogin as googleLoginApi } from "../api/endpoints";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("havenslight_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("havenslight_token"));
  const [loading, setLoading] = useState(true);

  // On first load, if we have a token, verify it's still valid and refresh
  // the user profile — covers the case where the stored user is stale.
  useEffect(() => {
    let cancelled = false;
    async function verify() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await fetchMe();
        if (!cancelled) {
          setUser(data.user);
          localStorage.setItem("havenslight_user", JSON.stringify(data.user));
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    verify();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = (data) => {
    localStorage.setItem("havenslight_token", data.token);
    localStorage.setItem("havenslight_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const login = useCallback(async (email, password) => {
    const { data } = await loginUser({ email, password });
    persist(data);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await registerUser(payload);
    persist(data);
    return data.user;
  }, []);

  const loginWithGoogle = useCallback(async (idToken) => {
    const { data } = await googleLoginApi(idToken);
    persist(data);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("havenslight_token");
    localStorage.removeItem("havenslight_user");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
