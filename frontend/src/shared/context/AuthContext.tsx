import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { User } from "../../shared/types";
import { container } from "../../shared/di/container";
import { setAuthToken } from "../api/openapiClient";
import type { LoginResponse } from "../../application/auth/use-cases/login.use-case";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<User | null>;
  updateProfile: (updates: {
    username?: string;
    email?: string;
  }) => Promise<User>;
  regenerateAvatar: () => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Auth Context Provider
 * Manages authentication state and operations
 * Following Context API pattern and Single Responsibility Principle
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Restore session on mount
  useEffect(() => {
    const session = container.restoreSessionUseCase.execute();
    if (session) {
      setUser(session.user);
      setToken(session.token);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await container.loginUseCase.execute({ email, password });
    setUser(result.user);
    setToken(result.token);
    return result;
  }, []);

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      await container.registerUseCase.execute({ username, email, password });
    },
    []
  );

  const logout = useCallback(() => {
    container.logoutUseCase.execute();
    setUser(null);
    setToken(null);
  }, []);

  const refreshProfile = useCallback(async (): Promise<User | null> => {
    try {
      const updated = await container.getProfileUseCase.execute();
      setUser(updated);
      return updated;
    } catch (error) {
      return null;
    }
  }, []);

  const updateProfile = useCallback(
    async (updates: { username?: string; email?: string }) => {
      const updated = await container.updateProfileUseCase.execute(updates);
      setUser(updated);
      return updated;
    },
    []
  );

  const regenerateAvatar = useCallback(async () => {
    const updated = await container.regenerateAvatarUseCase.execute();
    setUser(updated);
    return updated;
  }, []);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin ?? false,
    login,
    register,
    logout,
    refreshProfile,
    updateProfile,
    regenerateAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use Auth Context
 * @throws Error if used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
