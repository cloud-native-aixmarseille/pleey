import { Navigate } from "react-router-dom";
import PlayingPage from "../components/PlayingPage";
import AdminHostPlayingView from "../components/AdminHostPlayingView";
import { useAuthManagerContext } from "../../../application/app/context/AuthManagerContext";
import { useGameSessionContext } from "../../../application/app/context/GameSessionContext";
import { useGuestSessionContext } from "../../../application/app/context/GuestSessionContext";

/**
 * Playing Route Component
 * Renders appropriate view for admins or participants.
 */
export function PlayingRoute() {
  const { isAuthenticated, isAdmin } = useAuthManagerContext();
  const { guestNickname } = useGuestSessionContext();
  const {
    currentQuestion,
    questionNumber,
    totalQuestions,
    timeLeft,
    userAnswer,
    showResult,
    answerResult,
    handleSubmitAnswer,
    handleNextQuestion,
  } = useGameSessionContext();

  const hasIdentity = isAuthenticated || Boolean(guestNickname);

  if (!hasIdentity) {
    return <Navigate to="/game/join" replace />;
  }

  if (!currentQuestion) {
    return <Navigate to="/game/lobby" replace />;
  }

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
