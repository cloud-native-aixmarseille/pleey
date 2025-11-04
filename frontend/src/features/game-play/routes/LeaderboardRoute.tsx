import { Navigate } from "react-router-dom";
import { useAuth } from "../../../shared/context/AuthContext";
import { useGame } from "../../../shared/context/GameContext";
import LeaderboardPage from "../components/LeaderboardPage";
import AdminHostLeaderboardView from "../components/AdminHostLeaderboardView";

/**
 * Leaderboard Route Component
 * Handles leaderboard page logic and authentication
 * Following Single Responsibility Principle
 */
export function LeaderboardRoute() {
  const { isAuthenticated, isAdmin } = useAuth();
  const { leaderboard } = useGame();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Admin sees enhanced host view, players see regular view
  if (isAdmin) {
    return <AdminHostLeaderboardView leaderboard={leaderboard} />;
  }

  return <LeaderboardPage leaderboard={leaderboard} />;
}
