import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getToken, setToken, removeToken, apiRequest } from "@/lib/queryClient";
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

  const login = async (data: LoginUser) => {
    const res = await apiRequest("POST", "/api/auth/login", data);
    const { token, user: userData } = await res.json();
    setToken(token);
    setUser(userData);
    queryClient.invalidateQueries();
  };

  const register = async (data: RegisterUser) => {
    const res = await apiRequest("POST", "/api/auth/register", data);
    const { token, user: userData } = await res.json();
    setToken(token);
    setUser(userData);
    queryClient.invalidateQueries();
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
