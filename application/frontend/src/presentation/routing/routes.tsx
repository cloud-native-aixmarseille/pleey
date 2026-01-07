import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { homeRoutes } from "../domains/home/routing/home.routes";
import { authRoutes } from "../domains/auth/routing/auth.routes";
import { adminRoutes } from "../domains/admin/routing/admin.routes";
import { quizRoutes } from "../domains/quiz/routing/quiz.routes";
import { JoinGameRoute } from "../domains/game/routes/JoinGameRoute";
import { LobbyRoute } from "../domains/game/routes/LobbyRoute";
import { PlayingRoute } from "../domains/game/routes/PlayingRoute";
import { LeaderboardRoute } from "../domains/game/routes/LeaderboardRoute";
import { profileRoutes } from "../domains/profile/routing/profile.routes";
import {
  AccountBar,
  AppLifecycleManager,
  QuickSettingsMenu,
} from "../domains/app-shell";

const QUICK_SETTINGS_WRAPPER_CLASSES =
  "fixed right-4 top-4 z-50 sm:right-6 sm:top-6";

export function AppRoutes() {
  const location = useLocation();
  const isGameJoinRoute = location.pathname === "/game/join";
  const isGameLobbyRoute =
    location.pathname === "/game/lobby" ||
    /^\/game\/[^/]+\/lobby\/?$/.test(location.pathname);
  const isGameLeaderboardRoute = /^\/game\/[^/]+\/leaderboard\/?$/.test(
    location.pathname
  );

  return (
    <>
      <AppLifecycleManager />
      <div data-app-shell="true">
        {isGameLobbyRoute || isGameJoinRoute || isGameLeaderboardRoute ? (
          <QuickSettingsMenu className={QUICK_SETTINGS_WRAPPER_CLASSES} />
        ) : (
          <AccountBar />
        )}

        <Routes>
          {homeRoutes}
          {authRoutes}
          {adminRoutes}
          {quizRoutes}

          <Route path="/game/join" element={<JoinGameRoute />} />
          <Route path="/game/:sessionId/lobby" element={<LobbyRoute />} />
          <Route path="/game/:sessionId/playing" element={<PlayingRoute />} />
          <Route
            path="/game/:sessionId/leaderboard"
            element={<LeaderboardRoute />}
          />

          <Route
            path="/game/lobby"
            element={<Navigate to="/game/join" replace />}
          />
          <Route
            path="/game/playing"
            element={<Navigate to="/game/join" replace />}
          />
          <Route
            path="/game/leaderboard"
            element={<Navigate to="/game/join" replace />}
          />

          {profileRoutes}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}
