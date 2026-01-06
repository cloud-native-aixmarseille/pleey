import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";

import AdminHostPlayingView from "../components/admin-host-playing/AdminHostPlayingView";
import PlayingPage from "../components/PlayingPage";
import { useAuthManagerContext } from "../../auth";
import { useGameSessionContext } from "../contexts/GameSessionContext";
import { useGuestSessionContext } from "../contexts/GuestSessionContext";

/**
 * Playing Route Component
 * Renders appropriate view for admins or participants.
 */
export function PlayingRoute() {
  const { isAuthenticated, isAdmin } = useAuthManagerContext();
  const { guestNickname } = useGuestSessionContext();
  const { sessionId } = useParams<{ sessionId: string }>();
  const {
    gamePin,
    setGamePin,
    currentQuestion,
    questionNumber,
    totalQuestions,
    timeLeft,
    userAnswer,
    answerSubmitted,
    showResult,
    answerResult,
    handleSubmitAnswer,
    handleNextQuestion,
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

  if (!currentQuestion) {
    return <Navigate to={`/game/${normalizedSessionId}/lobby`} replace />;
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
      answerSubmitted={answerSubmitted}
      showResult={showResult}
      answerResult={answerResult}
      isAdmin={isAdmin}
      onSubmitAnswer={handleSubmitAnswer}
      onNextQuestion={handleNextQuestion}
    />
  );
}
