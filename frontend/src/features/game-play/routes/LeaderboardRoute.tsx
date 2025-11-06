import { Navigate } from "react-router-dom";
import LeaderboardPage from "../components/LeaderboardPage";
import AdminHostLeaderboardView from "../components/AdminHostLeaderboardView";
import { useAuthManagerContext } from "../../../application/app/context/AuthManagerContext";
import { useGameSessionContext } from "../../../application/app/context/GameSessionContext";
import { useGuestSessionContext } from "../../../application/app/context/GuestSessionContext";

/**
 * Leaderboard Route Component
 * Shows admin host leaderboard or participant leaderboard based on role.
 */
export function LeaderboardRoute() {
  const { isAuthenticated, isAdmin } = useAuthManagerContext();
  const { guestNickname } = useGuestSessionContext();
  const { leaderboard } = useGameSessionContext();

  const hasIdentity = isAuthenticated || Boolean(guestNickname);

  if (!hasIdentity) {
    return <Navigate to="/game/join" replace />;
  }

  if (isAdmin) {
    return <AdminHostLeaderboardView leaderboard={leaderboard} />;
  }

  return <LeaderboardPage leaderboard={leaderboard} />;
}
