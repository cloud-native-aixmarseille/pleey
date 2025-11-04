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

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
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

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin ?? false,
    login,
    register,
    logout,
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
