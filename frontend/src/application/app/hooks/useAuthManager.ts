import { useCallback, useState } from 'react';
import { authService } from '../../../domains/auth/auth.service';
import type { User } from '../../../shared/types';
import {
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
} from '../../../shared/constants/storageKeys';
import { queryClient, setAuthToken } from '../../../shared/api/openapiClient';

interface LoginParams {
  email: string;
  password: string;
}

interface RegisterParams {
  username: string;
  email: string;
  password: string;
}

interface SetSessionParams {
  token: string;
  user: User;
}

export function useAuthManager() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const persistSession = useCallback(({ token: nextToken, user: nextUser }: SetSessionParams) => {
    setToken(nextToken);
    setUser(nextUser);
    setAuthToken(nextToken);
    void queryClient.invalidateQueries();

    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
  }, []);

  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    queryClient.clear();

    if (typeof window === 'undefined') {
      return;
    }

    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }, []);

  const login = useCallback(
    async ({ email, password }: LoginParams) => {
      const result = await authService.login(email, password);
      persistSession({ token: result.token, user: result.user });
      return result;
    },
    [persistSession],
  );

  const register = useCallback(async ({ username, email, password }: RegisterParams) => {
    await authService.register(username, email, password);
  }, []);

  const restoreSession = useCallback((): User | null => {
    if (typeof window === 'undefined') {
      return null;
    }

    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (!storedToken || !storedUser) {
      return null;
    }

    try {
      const parsedUser: User = JSON.parse(storedUser);
      persistSession({ token: storedToken, user: parsedUser });
      setAuthToken(storedToken);
      return parsedUser;
    } catch (error) {
      clearSession();
      return null;
    }
  }, [clearSession, persistSession]);

  return {
    user,
    token,
    isAuthenticated: Boolean(user),
    isAdmin: user?.isAdmin ?? false,
    login,
    register,
    restoreSession,
    persistSession,
    clearSession,
  };
}
