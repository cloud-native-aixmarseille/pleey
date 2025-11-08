import { useNavigate } from "react-router-dom";

import { JoinGameLayout } from "./components/JoinGameLayout";
import { JoinGameHeader } from "./components/JoinGameHeader";
import { JoinGameContentCard } from "./components/JoinGameContentCard";
import { JoinGameSystemStatus } from "./components/JoinGameSystemStatus";
import { JoinGamePinSection } from "./components/JoinGamePinSection";
import { JoinGamePrimaryAction } from "./components/JoinGamePrimaryAction";
import { JoinGameInstructions } from "./components/JoinGameInstructions";
import { JoinGameFooterMessage } from "./components/JoinGameFooterMessage";

interface JoinGamePageProps {
  gamePin: string;
  onGamePinChange: (pin: string) => void;
  onJoinGame: () => void;
}

export default function JoinGamePage({
  gamePin,
  onGamePinChange,
  onJoinGame,
}: JoinGamePageProps) {
  const navigate = useNavigate();

  const handleNavigateHome = () => navigate("/");

  return (
    <JoinGameLayout>
      <JoinGameHeader onNavigateHome={handleNavigateHome} />

      <JoinGameContentCard>
        <JoinGameSystemStatus />
        <JoinGamePinSection
          gamePin={gamePin}
          onGamePinChange={onGamePinChange}
          onPinSubmit={onJoinGame}
        />
        <JoinGamePrimaryAction gamePin={gamePin} onSubmit={onJoinGame} />
        <JoinGameInstructions />
      </JoinGameContentCard>

      <JoinGameFooterMessage />
    </JoinGameLayout>
  );
}
