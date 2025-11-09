import { useCallback, useEffect, useRef, useState } from 'react';
import { authService } from '../../../domains/auth/auth.service';
import type { User } from '../../../shared/types';
import {
  TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
} from '../../../shared/constants/storageKeys';
import {
  queryClient,
  registerAuthSessionHandlers,
  setAuthSessionTokens,
} from '../../../shared/api/openapiClient';
import { useNotifications } from './useNotifications';

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
  accessToken: string;
  refreshToken: string;
  user: User;
}

export function useAuthManager() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const sessionExpiryNotified = useRef(false);
  const { notify } = useNotifications();

  const storeUser = useCallback((nextUser: User) => {
    setUser(nextUser);
    void queryClient.invalidateQueries();

    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
  }, []);

  const persistSession = useCallback(({ accessToken: nextToken, refreshToken: nextRefreshToken, user: nextUser }: SetSessionParams) => {
    setToken(nextToken);
    setUser(nextUser);
    setAuthSessionTokens({ accessToken: nextToken, refreshToken: nextRefreshToken });
    void queryClient.invalidateQueries();
    sessionExpiryNotified.current = false;

    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, nextRefreshToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
  }, []);

  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
    setAuthSessionTokens({ accessToken: null, refreshToken: null });
    queryClient.clear();

    if (typeof window === 'undefined') {
      return;
    }

    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }, []);

  const login = useCallback(
    async ({ email, password }: LoginParams) => {
      const result = await authService.login(email, password);
      persistSession({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      });
      return result;
    },
    [persistSession],
  );

  const register = useCallback(async ({ username, email, password }: RegisterParams) => {
    await authService.register(username, email, password);
  }, []);

  const refreshProfile = useCallback(async (): Promise<User | null> => {
    if (!token) {
      return null;
    }

    const nextUser = await authService.getProfile();
    storeUser(nextUser);
    return nextUser;
  }, [storeUser, token]);

  const updateProfile = useCallback(
    async (updates: { username?: string; email?: string }): Promise<User> => {
      const nextUser = await authService.updateProfile(updates);
      storeUser(nextUser);
      return nextUser;
    },
    [storeUser],
  );

  const regenerateAvatar = useCallback(async (): Promise<User> => {
    const nextUser = await authService.regenerateAvatar();
    storeUser(nextUser);
    return nextUser;
  }, [storeUser]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      // Ignore logout failures to avoid blocking client-side cleanup
    } finally {
      clearSession();
      sessionExpiryNotified.current = false;
    }
  }, [clearSession]);

  const restoreSession = useCallback((): User | null => {
    if (typeof window === 'undefined') {
      return null;
    }

    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (!storedToken || !storedRefreshToken || !storedUser) {
      return null;
    }

    try {
      const parsedUser: User = JSON.parse(storedUser);
      persistSession({ accessToken: storedToken, refreshToken: storedRefreshToken, user: parsedUser });
      return parsedUser;
    } catch (error) {
      clearSession();
      return null;
    }
  }, [clearSession, persistSession]);

  const handleSessionInvalidated = useCallback(() => {
    if (!sessionExpiryNotified.current) {
      notify('auth.notifications.sessionExpired', 'error');
      sessionExpiryNotified.current = true;
    }
    clearSession();
  }, [clearSession, notify]);

  useEffect(() => {
    registerAuthSessionHandlers({
      onSessionRefreshed: (payload) => {
        persistSession({
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          user: payload.user,
        });
      },
      onSessionInvalidated: handleSessionInvalidated,
    });
  }, [handleSessionInvalidated, persistSession]);

  return {
    user,
    token,
    isAuthenticated: Boolean(user),
    isAdmin: user?.isAdmin ?? false,
    login,
    register,
    logout,
    restoreSession,
    persistSession,
    clearSession,
    refreshProfile,
    updateProfile,
    regenerateAvatar,
  };
}
