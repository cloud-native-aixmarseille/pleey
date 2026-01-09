import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import JoinGameWithGuestPage from "../components/JoinGameWithGuestPage";
import { useAuthManagerContext } from "../../auth";
import { useGameSessionContext } from "../contexts/GameSessionContext";
import { useGuestSessionContext } from "../contexts/GuestSessionContext";
import {
  PatienceOverlay,
  PatiencePlayground,
} from "../../../shared/ui/patience";
import { useUserIdle } from "../../../shared/ui/patience/hooks/useUserIdle";

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

  const isIdle = useUserIdle(true, 4_000);

  useEffect(() => {
    const pinFromUrl = searchParams.get("pin");
    if (pinFromUrl && pinFromUrl.length === 6) {
      setGamePin(pinFromUrl);
    }
  }, [searchParams, setGamePin]);

  const username = user?.username ?? guestNickname ?? undefined;

  return (
    <PatiencePlayground className="relative">
      <JoinGameWithGuestPage
        gamePin={gamePin}
        onGamePinChange={setGamePin}
        onJoinGame={handleJoinGame}
        onJoinAsGuest={handleJoinAsGuest}
        isAuthenticated={isAuthenticated}
        username={username}
      />
      <PatienceOverlay active={isIdle} />
    </PatiencePlayground>
  );
}
