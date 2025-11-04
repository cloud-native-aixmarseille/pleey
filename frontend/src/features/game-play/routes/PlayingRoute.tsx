import { Navigate } from "react-router-dom";
import { useAuth } from "../../../shared/context/AuthContext";
import { useGame } from "../../../shared/context/GameContext";
import { useTimer } from "../../../shared/hooks/useTimer";
import PlayingPage from "../components/PlayingPage";
import AdminHostPlayingView from "../components/AdminHostPlayingView";

/**
 * Playing Route Component
 * Handles playing page logic and authentication
 * Following Single Responsibility Principle
 */
export function PlayingRoute() {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const {
    currentQuestion,
    questionNumber,
    totalQuestions,
    timeLeft,
    setTimeLeft,
    userAnswer,
    setUserAnswer,
    showResult,
    answerResult,
    gamePin,
    submitAnswer,
    nextQuestion,
  } = useGame();

  // Timer management
  useTimer(timeLeft, setTimeLeft, !!currentQuestion, !!userAnswer);

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!currentQuestion) {
    return <Navigate to="/game/lobby" replace />;
  }

  const handleSubmitAnswer = (answer: string) => {
    if (user) {
      setUserAnswer(answer);
      submitAnswer(gamePin, user.id, answer, timeLeft);
    }
  };

  const handleNextQuestion = () => {
    nextQuestion(gamePin);
  };

  // Admin sees host view (display-only), players see interactive view
  if (isAdmin) {
    return (
      <AdminHostPlayingView
        currentQuestion={currentQuestion}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        timeLeft={timeLeft}
        showResult={showResult}
        answerResult={answerResult}
        onNextQuestion={handleNextQuestion}
      />
    );
  }

  return (
    <PlayingPage
      currentQuestion={currentQuestion}
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      timeLeft={timeLeft}
      userAnswer={userAnswer}
      showResult={showResult}
      answerResult={answerResult}
      isAdmin={isAdmin}
      onSubmitAnswer={handleSubmitAnswer}
      onNextQuestion={handleNextQuestion}
    />
  );
}
