import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiFetch, clearAuthToken, getAuthToken, setAuthToken } from "@/lib/api";

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string | null;
  created_at: string;
}

interface AuthSession {
  access_token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signUp: (email: string, password: string, fullName?: string) => Promise<AuthUser>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  signIn: async () => { throw new Error("Auth not ready"); },
  signUp: async () => { throw new Error("Auth not ready"); },
  resetPassword: async () => {},
  updatePassword: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrateUser = async () => {
    const token = getAuthToken();
    if (!token) {
      setSession(null);
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const me = await apiFetch<{ id: string; email: string; full_name?: string | null; created_at: string }>("/api/v1/auth/me");
      setSession({ access_token: token });
      setUser(me as AuthUser);
    } catch {
      clearAuthToken();
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    hydrateUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await apiFetch<{ access_token: string; user: AuthUser }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(result.access_token);
    setSession({ access_token: result.access_token });
    setUser(result.user);
    return result.user;
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const result = await apiFetch<{ access_token: string; user: AuthUser }>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name: fullName || null }),
    });
    setAuthToken(result.access_token);
    setSession({ access_token: result.access_token });
    setUser(result.user);
    return result.user;
  };

  const resetPassword = async (_email: string) => {
    // No reset endpoint is implemented in the backend; keep the UI but defer to support contact.
    return;
  };

  const updatePassword = async (_password: string) => {
    // Update-password is not part of the Phase 2 auth surface; the route remains intentionally disabled.
    return;
  };

  const signOut = async () => {
    clearAuthToken();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, signIn, signUp, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};
