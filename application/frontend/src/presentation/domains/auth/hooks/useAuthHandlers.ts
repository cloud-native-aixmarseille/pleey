import { useCallback } from "react";
import type { NavigateFunction } from "react-router-dom";
import type { User } from "../../../../domains/auth/types";
import type { ToastVariant } from "../../app-shell";

interface LoginResult {
  token: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}


interface AuthHandlersParams {
  login: (params: { email: string; password: string }) => Promise<LoginResult>;
  register: (params: {
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;
  loadQuizzes: (token: string) => Promise<unknown>;
  clearSession: () => void;
  notify: (messageKey: string, variant?: ToastVariant) => void;
  notifyFromError: (error: unknown, fallbackKey: string) => void;
  navigate: NavigateFunction;
}

export function useAuthHandlers({
  login,
  register,
  loadQuizzes,
  clearSession,
  notify,
  notifyFromError,
  navigate,
}: AuthHandlersParams) {
  const handleLogin = useCallback(
    async (email: string, password: string) => {
      const result = await login({ email, password });

      if (result.user.isAdmin) {
        try {
          await loadQuizzes(result.token);
        } catch (error) {
          clearSession();
          notifyFromError(error, "errors.quizzesLoadFailed");
          throw error;
        }

        navigate("/admin", { replace: true });
        return;
      }

      navigate("/game/join", { replace: true });
    },
    [login, loadQuizzes, clearSession, notifyFromError, navigate],
  );

  const handleRegister = useCallback(
    async (username: string, email: string, password: string) => {
      try {
        await register({ username, email, password });
        notify("errors.registrationSuccess", "success");
        navigate("/auth/login", { replace: true });
      } catch (error) {
        notifyFromError(error, "errors.registrationError");
      }
    },
    [register, notify, notifyFromError, navigate],
  );

  return {
    handleLogin,
    handleRegister,
  };
}
