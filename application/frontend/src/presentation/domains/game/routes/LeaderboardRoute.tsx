import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";

import AdminHostLeaderboardView from "../components/AdminHostLeaderboardView";
import LeaderboardPage from "../components/LeaderboardPage";
import { useAuthManagerContext } from "../../auth";
import { useGameSessionContext } from "../contexts/GameSessionContext";
import { useGuestSessionContext } from "../contexts/GuestSessionContext";
import {
  PatienceOverlay,
  PatiencePlayground,
} from "../../../shared/ui/patience";
import { useUserIdle } from "../../../shared/ui/patience/hooks/useUserIdle";

/**
 * Leaderboard Route Component
 * Shows admin host leaderboard or participant leaderboard based on role.
 */
export function LeaderboardRoute() {
  const { isAuthenticated, isAdmin } = useAuthManagerContext();
  const { guestNickname } = useGuestSessionContext();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { gamePin, setGamePin, leaderboard } = useGameSessionContext();

  const isIdle = useUserIdle(true, 4_000);

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
    return (
      <PatiencePlayground className="relative">
        <AdminHostLeaderboardView leaderboard={leaderboard} />
        <PatienceOverlay active={isIdle} />
      </PatiencePlayground>
    );
  }

  return (
    <PatiencePlayground className="relative">
      <LeaderboardPage leaderboard={leaderboard} />
      <PatienceOverlay active={isIdle} />
    </PatiencePlayground>
  );
}
