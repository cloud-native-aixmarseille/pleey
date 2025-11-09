import { useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import LobbyPage from "../components/LobbyPage";
import { useAuthManagerContext } from "../../../application/app/context/AuthManagerContext";
import { useGameSessionContext } from "../../../application/app/context/GameSessionContext";
import { useGuestSessionContext } from "../../../application/app/context/GuestSessionContext";

/**
 * Lobby Route Component
 * Requires either an authenticated user or a registered guest.
 */
export function LobbyRoute() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { isAuthenticated, isAdmin, user } = useAuthManagerContext();
  const { guestNickname } = useGuestSessionContext();
  const {
    gamePin,
    setGamePin,
    players,
    activeQuizQuestionCount,
    handleStartGame,
  } = useGameSessionContext();

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

  const handleBackToAdmin = isAdmin ? () => navigate("/admin") : undefined;

  return (
    <LobbyPage
      gamePin={gamePin}
      players={players}
      isAdmin={isAdmin}
      hostUserId={isAdmin && user ? user.id : null}
      hostUsername={isAdmin && user ? user.username : null}
      onStartGame={handleStartGame}
      onBackToAdmin={handleBackToAdmin}
      questionCount={activeQuizQuestionCount}
    />
  );
}
