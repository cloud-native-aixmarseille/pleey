import { Navigate, Route, Routes } from "react-router-dom";

import { homeRoutes } from "../domains/home/routing/home.routes";
import { authRoutes } from "../domains/auth/routing/auth.routes";
import { adminRoutes } from "../domains/admin/routing/admin.routes";
import { quizRoutes } from "../domains/quiz/routing/quiz.routes";
import { JoinGameRoute } from "../domains/game/routes/JoinGameRoute";
import { LobbyRoute } from "../domains/game/routes/LobbyRoute";
import { PlayingRoute } from "../domains/game/routes/PlayingRoute";
import { LeaderboardRoute } from "../domains/game/routes/LeaderboardRoute";
import { profileRoutes } from "../domains/profile/routing/profile.routes";
import { AccountBar, AppLifecycleManager } from "../domains/app-shell";

export function AppRoutes() {
  return (
    <>
      <AppLifecycleManager />
      <div data-app-shell="true">
        <AccountBar />

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
