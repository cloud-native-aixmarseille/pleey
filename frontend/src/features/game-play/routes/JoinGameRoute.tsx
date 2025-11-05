import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../shared/context/AuthContext";
import { useGame } from "../../../shared/context/GameContext";
import JoinGamePage from "../components/JoinGamePage";
import { useEffect } from "react";

/**
 * Join Game Route Component
 * Handles authentication check for join game page
 * Following Single Responsibility Principle
 */
export function JoinGameRoute() {
  const { isAuthenticated } = useAuth();
  const { gamePin, setGamePin, joinGame } = useGame();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Auto-fill PIN from QR code scan
  useEffect(() => {
    const pinFromUrl = searchParams.get("pin");
    if (pinFromUrl && pinFromUrl.length === 6) {
      setGamePin(pinFromUrl);
    }
  }, [searchParams, setGamePin]);

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  const handleJoinGame = () => {
    if (user) {
      joinGame(gamePin, user.username, user.id);
    }
  };

  return (
    <JoinGamePage
      gamePin={gamePin}
      onGamePinChange={setGamePin}
      onJoinGame={handleJoinGame}
    />
  );
}
