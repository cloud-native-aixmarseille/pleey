import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";

import LeaderboardPage from "../components/leaderboard/LeaderboardPage";
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
 */
export function LeaderboardRoute() {
  const { isAuthenticated, isAdmin } = useAuthManagerContext();
  const { guestNickname } = useGuestSessionContext();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { gamePin, setGamePin, leaderboard, isPaused, handleTogglePause } =
    useGameSessionContext();

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

  return (
    <PatiencePlayground className="relative">
      <LeaderboardPage
        leaderboard={leaderboard}
        isHost={isAdmin}
        isPaused={isPaused}
        onTogglePause={isAdmin ? handleTogglePause : undefined}
      />
      <PatienceOverlay active={isIdle} />
    </PatiencePlayground>
  );
}
