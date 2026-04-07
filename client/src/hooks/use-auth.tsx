import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, type User, type AuthResponse } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["auth-me", token],
    queryFn: () => api.get<User>("/auth/me"),
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  const login = async (data: { email: string; password: string }) => {
    const res = await api.post<AuthResponse>("/auth/login", data);
    setToken(res.token);
    await refetch();
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string }) => {
    const res = await api.post<AuthResponse>("/auth/register", data);
    setToken(res.token);
    await refetch();
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, login, register, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
