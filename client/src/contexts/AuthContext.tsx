import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getToken, setToken, removeToken } from "@/lib/queryClient";
import type { SafeUser, RegisterUser, LoginUser } from "@shared/schema";

interface AuthContextType {
  user: SafeUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginUser) => Promise<void>;
  register: (data: RegisterUser) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const fetchUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        removeToken();
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      removeToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const authFetch = async (url: string, body: unknown) => {
    const token = getToken();
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      credentials: "include",
    });
    const json = await res.json();
    return { res, json };
  };

  const login = async (data: LoginUser) => {
    const { res, json } = await authFetch("/api/auth/login", data);
    if (!res.ok) {
      const err: any = new Error(json.message || "Login failed");
      err.code = json.code;
      err.status = res.status;
      throw err;
    }
    setToken(json.token);
    setUser(json.user);
    queryClient.invalidateQueries();
  };

  const register = async (data: RegisterUser) => {
    const { res, json } = await authFetch("/api/auth/register", data);
    if (!res.ok) {
      const err: any = new Error(json.message || "Registration failed");
      err.code = json.code;
      err.status = res.status;
      throw err;
    }
    // On success the server does NOT issue a JWT — user must verify email first
    const err: any = new Error(json.message);
    err.code = json.code; // "REGISTRATION_SUCCESS" or "VERIFICATION_RESENT"
    throw err;
  };

  const logout = () => {
    removeToken();
    setUser(null);
    queryClient.clear();
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
