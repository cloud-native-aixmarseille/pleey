import { useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import LobbyPage from "../components/LobbyPage";
import { useAuthManagerContext } from "../../auth";
import { useGameSessionContext } from "../contexts/GameSessionContext";
import { useGuestSessionContext } from "../contexts/GuestSessionContext";
import {
  PatienceOverlay,
  PatiencePlayground,
} from "../../../shared/ui/patience";
import { useUserIdle } from "../../../shared/ui/patience/hooks/useUserIdle";

/**
 * Lobby Route Component
 * Requires either an authenticated user or a registered guest.
 */
export function LobbyRoute() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { isAuthenticated, isAdmin, user, hasRestoredSession } =
    useAuthManagerContext();
  const { guestNickname, hasHydratedGuest } = useGuestSessionContext();
  const {
    gamePin,
    setGamePin,
    players,
    activeQuizQuestionCount,
    handleStartGame,
    handleStopSession,
  } = useGameSessionContext();

  const isIdle = useUserIdle(true, 4_000);

  const hasIdentity = isAuthenticated || Boolean(guestNickname);
  const isHydratingIdentity = !hasRestoredSession || !hasHydratedGuest;
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
    if (isHydratingIdentity) {
      return (
        <PatiencePlayground className="relative">
          <div className="crt-screen" />
        </PatiencePlayground>
      );
    }
    return <Navigate to="/game/join" replace />;
  }

  const handleBackToAdmin = isAdmin ? () => navigate("/admin") : undefined;

  return (
    <PatiencePlayground className="relative">
      <LobbyPage
        gamePin={gamePin}
        players={players}
        isAdmin={isAdmin}
        hostUserId={isAdmin && user ? user.id : null}
        hostUsername={isAdmin && user ? user.username : null}
        onStartGame={handleStartGame}
        onStopSession={isAdmin ? handleStopSession : undefined}
        onBackToAdmin={handleBackToAdmin}
        questionCount={activeQuizQuestionCount}
      />
      <PatienceOverlay active={isIdle} />
    </PatiencePlayground>
  );
}
