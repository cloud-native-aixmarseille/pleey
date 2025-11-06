import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import JoinGameWithGuestPage from "../components/JoinGameWithGuestPage";
import { useAuthManagerContext } from "../../../application/app/context/AuthManagerContext";
import { useGameSessionContext } from "../../../application/app/context/GameSessionContext";
import { useGuestSessionContext } from "../../../application/app/context/GuestSessionContext";

/**
 * Join Game Route Component
 * Supports both authenticated players and guests.
 */
export function JoinGameRoute() {
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuthManagerContext();
  const { guestNickname } = useGuestSessionContext();
  const { gamePin, setGamePin, handleJoinGame, handleJoinAsGuest } =
    useGameSessionContext();

  useEffect(() => {
    const pinFromUrl = searchParams.get("pin");
    if (pinFromUrl && pinFromUrl.length === 6) {
      setGamePin(pinFromUrl.toUpperCase());
    }
  }, [searchParams, setGamePin]);

  const username = user?.username ?? guestNickname ?? undefined;

  return (
    <JoinGameWithGuestPage
      gamePin={gamePin}
      onGamePinChange={setGamePin}
      onJoinGame={handleJoinGame}
      onJoinAsGuest={handleJoinAsGuest}
      isAuthenticated={isAuthenticated}
      username={username}
    />
  );
}
