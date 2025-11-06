import { Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./features/home/components/HomePage";
import { LoginRoute } from "./features/authentication/routes/LoginRoute";
import { RegisterRoute } from "./features/authentication/routes/RegisterRoute";
import { AdminRoute } from "./features/quiz-management/routes/AdminRoute";
import { ManageQuestionsRoute } from "./features/quiz-management/routes/ManageQuestionsRoute";
import { OrganizationRoute } from "./features/organization-management/routes/OrganizationRoute";
import { JoinGameRoute } from "./features/game-play/routes/JoinGameRoute";
import { LobbyRoute } from "./features/game-play/routes/LobbyRoute";
import { PlayingRoute } from "./features/game-play/routes/PlayingRoute";
import { LeaderboardRoute } from "./features/game-play/routes/LeaderboardRoute";
import { ProfileRoute } from "./features/profile/routes/ProfileRoute";
import { AccountBar } from "./application/app/components/AccountBar";
import { AppLifecycleManager } from "./application/app/components/AppLifecycleManager";

/**
 * Application routes and global UI shell. Keeps routing declarations declarative
 * while lifecycle and chrome live in dedicated components.
 */
export function AppRoutes() {
  return (
    <>
      <AppLifecycleManager />
      <div className="pt-36 pb-12">
        <AccountBar />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/login" element={<LoginRoute />} />
          <Route path="/auth/register" element={<RegisterRoute />} />

          <Route path="/admin" element={<AdminRoute />} />
          <Route
            path="/admin/quizzes/:quizId"
            element={<ManageQuestionsRoute />}
          />
          <Route path="/admin/organization" element={<OrganizationRoute />} />

          <Route path="/game/join" element={<JoinGameRoute />} />
          <Route path="/game/lobby" element={<LobbyRoute />} />
          <Route path="/game/playing" element={<PlayingRoute />} />
          <Route path="/game/leaderboard" element={<LeaderboardRoute />} />

          <Route path="/profile" element={<ProfileRoute />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}
