import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { JOIN_GAME_PIN_LENGTH } from "../join-game/constants";
import { JoinGameLayout } from "../join-game/components/JoinGameLayout";
import { JoinGameHeader } from "../join-game/components/JoinGameHeader";
import { JoinGameContentCard } from "../join-game/components/JoinGameContentCard";
import { JoinGameSystemStatus } from "../join-game/components/JoinGameSystemStatus";
import { JoinGamePinSection } from "../join-game/components/JoinGamePinSection";
import { JoinGamePrimaryAction } from "../join-game/components/JoinGamePrimaryAction";
import { JoinGameInstructions } from "../join-game/components/JoinGameInstructions";
import { JoinGameFooterMessage } from "../join-game/components/JoinGameFooterMessage";
import { GuestNicknameForm } from "./components/GuestNicknameForm";

interface JoinGameWithGuestPageProps {
  gamePin: string;
  onGamePinChange: (pin: string) => void;
  onJoinGame: () => void;
  onJoinAsGuest: (nickname: string) => void;
  isAuthenticated: boolean;
  username?: string;
}

export default function JoinGameWithGuestPage({
  gamePin,
  onGamePinChange,
  onJoinGame,
  onJoinAsGuest,
  isAuthenticated,
  username,
}: JoinGameWithGuestPageProps) {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [showGuestForm, setShowGuestForm] = useState(false);

  const isPinComplete = gamePin.length === JOIN_GAME_PIN_LENGTH;
  const trimmedNickname = nickname.trim();

  const handleNavigateHome = () => navigate("/");
  const handleSignIn = () => navigate("/auth/login");

  const handlePinSubmit = () => {
    if (!isPinComplete) {
      return;
    }

    if (isAuthenticated) {
      onJoinGame();
      return;
    }

    setShowGuestForm(true);
  };

  const handleGuestSubmit = () => {
    if (trimmedNickname.length === 0) {
      return;
    }

    onJoinAsGuest(trimmedNickname);
  };

  const handleBackToPinEntry = () => setShowGuestForm(false);

  const subtitle = showGuestForm
    ? "> Enter your nickname to join as guest"
    : "> Enter the PIN code to start playing";

  const statusMessage = isAuthenticated
    ? `> LOGGED IN AS: ${username ?? ""}`
    : showGuestForm
    ? "> GUEST MODE ACTIVATED"
    : "> WAITING FOR INPUT...";

  const instructionsItems = isAuthenticated
    ? [
        "Ask the game host for the 6-character PIN code",
        "Join with your account to save your progress",
        "Enter the PIN and press JOIN!",
      ]
    : showGuestForm
    ? [
        "Ask the game host for the 6-character PIN code",
        "Play as guest (no account needed) or sign in",
        "Enter your nickname and press JOIN!",
      ]
    : [
        "Ask the game host for the 6-character PIN code",
        "Play as guest (no account needed) or sign in",
        "Enter the PIN and choose your nickname!",
      ];

  const primaryButtonLabel = isAuthenticated ? "JOIN GAME" : "CONTINUE";
  const completeMessage = isAuthenticated
    ? "✓ PIN COMPLETE - PRESS JOIN"
    : "✓ PIN COMPLETE - PRESS CONTINUE";

  return (
    <JoinGameLayout>
      <JoinGameHeader onNavigateHome={handleNavigateHome} subtitle={subtitle} />

      <JoinGameContentCard>
        <JoinGameSystemStatus statusMessage={statusMessage} />

        {!showGuestForm ? (
          <>
            <JoinGamePinSection
              gamePin={gamePin}
              onGamePinChange={onGamePinChange}
              onPinSubmit={handlePinSubmit}
            />

            <JoinGamePrimaryAction
              gamePin={gamePin}
              onSubmit={handlePinSubmit}
              buttonLabel={primaryButtonLabel}
              completeMessage={completeMessage}
            />

            {!isAuthenticated && (
              <div className="text-center">
                <p className="font-mono text-xs text-light-400 mb-2">
                  Already have an account?
                </p>
                <button
                  type="button"
                  onClick={handleSignIn}
                  className="font-mono text-sm text-accent-400 hover:text-accent-300 underline"
                >
                  Sign in instead
                </button>
              </div>
            )}
          </>
        ) : (
          <GuestNicknameForm
            nickname={nickname}
            onNicknameChange={setNickname}
            onSubmit={handleGuestSubmit}
            onBack={handleBackToPinEntry}
          />
        )}

        <JoinGameInstructions items={instructionsItems} />
      </JoinGameContentCard>

      <JoinGameFooterMessage />
    </JoinGameLayout>
  );
}
