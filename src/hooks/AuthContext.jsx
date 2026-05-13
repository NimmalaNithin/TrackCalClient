import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";

const STORAGE_KEY = "trackcal.session";
const AuthContext = createContext(null);

function readStoredSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);

  function persistSession(nextSession) {
    setSession(nextSession);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
  }

  const login = useCallback(async (values) => {
    const response = await apiRequest("/api/auth/login", {
      method: "POST",
      body: values,
    });
    persistSession(response);
    return response;
  }, []);

  const requestRegistrationOtp = useCallback(async (values) => {
    return apiRequest("/api/auth/register/request-otp", {
      method: "POST",
      body: values,
    });
  }, []);

  const resendRegistrationOtp = useCallback(async (email) => {
    return apiRequest("/api/auth/register/resend-otp", {
      method: "POST",
      body: { email },
    });
  }, []);

  const verifyRegistrationOtp = useCallback(async (values) => {
    const response = await apiRequest("/api/auth/register/verify-otp", {
      method: "POST",
      body: values,
    });
    persistSession(response);
    return response;
  }, []);

  const exchangeOAuthCode = useCallback(async (code) => {
    const response = await apiRequest("/api/auth/oauth/exchange", {
      method: "POST",
      body: { code },
    });
    persistSession(response);
    return response;
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      session,
      token: session?.token,
      user: session
        ? {
            firstName: session.firstName,
            lastName: session.lastName,
            email: session.email,
            avatar: session.profilePictureUrl,
          }
        : null,
      isAuthenticated: Boolean(session?.token),
      login,
      requestRegistrationOtp,
      resendRegistrationOtp,
      verifyRegistrationOtp,
      exchangeOAuthCode,
      logout,
    }),
    [exchangeOAuthCode, login, logout, requestRegistrationOtp, resendRegistrationOtp, session, verifyRegistrationOtp]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
