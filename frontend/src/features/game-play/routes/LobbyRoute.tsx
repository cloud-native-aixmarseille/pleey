import { Navigate } from "react-router-dom";
import { useAuth } from "../../../shared/context/AuthContext";
import { useGame } from "../../../shared/context/GameContext";
import { useQuiz } from "../../../shared/context/QuizContext";
import LobbyPage from "../components/LobbyPage";

/**
 * Lobby Route Component
 * Handles lobby page logic and authentication
 * Following Single Responsibility Principle
 */
export function LobbyRoute() {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const { gamePin, players, startGame } = useGame();
  const { questionsByQuiz } = useQuiz();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Calculate question count from loaded quizzes
  const questionCount = Object.values(questionsByQuiz).flat().length;

  const handleStartGame = () => {
    startGame(gamePin);
  };

  return (
    <LobbyPage
      gamePin={gamePin}
      players={players}
      isAdmin={isAdmin}
      hostUserId={isAdmin ? user?.id ?? null : null}
      hostUsername={isAdmin ? user?.username ?? null : null}
      onStartGame={handleStartGame}
      questionCount={questionCount}
    />
  );
}
