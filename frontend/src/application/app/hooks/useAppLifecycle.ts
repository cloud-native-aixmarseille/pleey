import { useEffect } from "react";
import type { NavigateFunction } from "react-router-dom";
import type { User } from "../../../shared/types";

type LoadQuizzes = (token: string) => Promise<unknown>;

type RestoreSession = () => User | null;

type ClearSession = () => void;

type NotifyFromError = (error: unknown, fallbackKey: string) => void;

interface UseAppLifecycleParams {
  restoreSession: RestoreSession;
  user: User | null;
  token: string | null;
  loadQuizzes: LoadQuizzes;
  clearSession: ClearSession;
  notifyFromError: NotifyFromError;
  navigate: NavigateFunction;
  locationPathname: string;
  gameStarted: boolean;
  gameEnded: boolean;
}

export function useAppLifecycle({
  restoreSession,
  user,
  token,
  loadQuizzes,
  clearSession,
  notifyFromError,
  navigate,
  locationPathname,
  gameStarted,
  gameEnded,
}: UseAppLifecycleParams) {
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (!user?.isAdmin || !token) {
      return;
    }

    loadQuizzes(token).catch((error) => {
      clearSession();
      notifyFromError(error, "errors.quizzesLoadFailed");
      navigate("/auth/login", { replace: true });
    });
  }, [user, token, loadQuizzes, clearSession, notifyFromError, navigate]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const isAuthRoute =
      locationPathname === "/" || locationPathname.startsWith("/auth");

    if (user.isAdmin && isAuthRoute) {
      navigate("/admin", { replace: true });
      return;
    }

    if (!user.isAdmin && isAuthRoute) {
      navigate("/game/join", { replace: true });
    }
  }, [user, locationPathname, navigate]);

  useEffect(() => {
    if (gameStarted) {
      navigate("/game/playing");
    }
  }, [gameStarted, navigate]);

  useEffect(() => {
    if (gameEnded) {
      navigate("/game/leaderboard");
    }
  }, [gameEnded, navigate]);
}
