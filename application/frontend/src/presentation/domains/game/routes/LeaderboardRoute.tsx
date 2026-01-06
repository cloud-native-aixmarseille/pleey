import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";

import AdminHostLeaderboardView from "../components/AdminHostLeaderboardView";
import LeaderboardPage from "../components/LeaderboardPage";
import { useAuthManagerContext } from "../../auth";
import { useGameSessionContext } from "../contexts/GameSessionContext";
import { useGuestSessionContext } from "../contexts/GuestSessionContext";

/**
 * Leaderboard Route Component
 * Shows admin host leaderboard or participant leaderboard based on role.
 */
export function LeaderboardRoute() {
  const { isAuthenticated, isAdmin } = useAuthManagerContext();
  const { guestNickname } = useGuestSessionContext();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { gamePin, setGamePin, leaderboard } = useGameSessionContext();

  const hasIdentity = isAuthenticated || Boolean(guestNickname);
  const normalizedSessionId = sessionId?.toUpperCase() ?? "";

  useEffect(() => {
    if (normalizedSessionId && normalizedSessionId !== gamePin) {
      setGamePin(normalizedSessionId);
    }
  }, [normalizedSessionId, gamePin, setGamePin]);

  if (!normalizedSessionId) {
    return <Navigate to="/game/join" replace />;
  }

  if (!hasIdentity) {
    return <Navigate to="/game/join" replace />;
  }

  if (isAdmin) {
    return <AdminHostLeaderboardView leaderboard={leaderboard} />;
  }

  return <LeaderboardPage leaderboard={leaderboard} />;
}
