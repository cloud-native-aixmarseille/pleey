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
  refreshProfile: () => Promise<User | null>;
  loadQuizzes: LoadQuizzes;
  clearSession: ClearSession;
  notifyFromError: NotifyFromError;
  navigate: NavigateFunction;
  locationPathname: string;
  gameStarted: boolean;
  gameEnded: boolean;
  gamePin: string;
}

export function useAppLifecycle({
  restoreSession,
  user,
  token,
  refreshProfile,
  loadQuizzes,
  clearSession,
  notifyFromError,
  navigate,
  locationPathname,
  gameStarted,
  gameEnded,
  gamePin,
}: UseAppLifecycleParams) {
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (!token) {
      return;
    }

    refreshProfile().catch((error) => {
      notifyFromError(error, "profile.errors.loadFailed");
    });
  }, [refreshProfile, token, notifyFromError]);

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
    if (!locationPathname.startsWith("/game")) {
      return;
    }

    if (gameStarted && gamePin) {
      navigate(`/game/${gamePin}/playing`);
    }
  }, [gameStarted, gamePin, navigate, locationPathname]);

  useEffect(() => {
    if (!locationPathname.startsWith("/game")) {
      return;
    }

    if (gameEnded && gamePin) {
      navigate(`/game/${gamePin}/leaderboard`);
    }
  }, [gameEnded, gamePin, navigate, locationPathname]);
}
