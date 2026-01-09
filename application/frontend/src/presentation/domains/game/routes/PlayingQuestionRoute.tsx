import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { useAuthManagerContext } from "../../auth";
import { useGameSessionContext } from "../contexts/GameSessionContext";
import { useGuestSessionContext } from "../contexts/GuestSessionContext";
import { PatiencePlayground } from "../../../shared/ui/patience";
import HostPlayingView from "../components/playing/host/HostPlayingView";
import { PlayingQuestionPage } from "../components/playing/PlayingQuestionPage";

const GAME_STATE_TIMEOUT_MS = 3000;

/**
 * Playing Question Route Component
 * Renders appropriate view for admins or participants.
 */
export function PlayingQuestionRoute() {
  const { isAuthenticated, isAdmin, hasRestoredSession } =
    useAuthManagerContext();
  const { guestNickname, hasHydratedGuest } = useGuestSessionContext();
  const { sessionId, questionId } = useParams<{
    sessionId: string;
    questionId?: string;
  }>();
  const navigate = useNavigate();
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
    activeQuizTitle,
    isPaused,
    handleSubmitAnswer,
    handleNextQuestion,
    handleTogglePause,
    handleBackToLobby,
    handleBackToAdmin,
  } = useGameSessionContext();

  const [waitingForGameState, setWaitingForGameState] = useState(true);

  const hasIdentity = isAuthenticated || Boolean(guestNickname);
  const isHydratingIdentity = !hasRestoredSession || !hasHydratedGuest;
  const normalizedSessionId = sessionId?.toUpperCase() ?? "";
  const normalizedQuestionId = questionId ?? "";

  useEffect(() => {
    if (normalizedSessionId && normalizedSessionId !== gamePin) {
      setGamePin(normalizedSessionId);
    }
  }, [normalizedSessionId, gamePin, setGamePin]);

  useEffect(() => {
    if (!normalizedSessionId || !currentQuestion) {
      return;
    }

    const currentId = String(currentQuestion.id);
    if (normalizedQuestionId === currentId) {
      return;
    }

    navigate(`/game/${normalizedSessionId}/playing/${currentId}`, {
      replace: true,
    });
  }, [normalizedSessionId, normalizedQuestionId, currentQuestion, navigate]);

  // Give time for the game state to arrive via socket before redirecting
  useEffect(() => {
    if (currentQuestion) {
      setWaitingForGameState(false);
      return;
    }

    const timeout = setTimeout(() => {
      setWaitingForGameState(false);
    }, GAME_STATE_TIMEOUT_MS);

    return () => clearTimeout(timeout);
  }, [currentQuestion]);

  if (!normalizedSessionId) {
    return <Navigate to="/game/join" replace />;
  }

  if (!hasIdentity) {
    if (isHydratingIdentity) {
      return (
        <PatiencePlayground className="relative">
          <div className="crt-screen" />
        </PatiencePlayground>
      );
    }
    return <Navigate to="/game/join" replace />;
  }

  // Wait for game state to arrive before deciding to redirect
  if (!currentQuestion) {
    if (waitingForGameState) {
      return (
        <PatiencePlayground className="relative">
          <div className="crt-screen" />
        </PatiencePlayground>
      );
    }
    return <Navigate to={`/game/${normalizedSessionId}/lobby`} replace />;
  }

  if (isAdmin) {
    return (
      <HostPlayingView
        currentQuestion={currentQuestion}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        timeLeft={timeLeft}
        showResult={showResult}
        answerResult={answerResult}
        onNextQuestion={handleNextQuestion}
        quizTitle={activeQuizTitle}
        isPaused={isPaused}
        onBackToLobby={handleBackToLobby}
        onBackToAdmin={handleBackToAdmin}
        onTogglePause={handleTogglePause}
      />
    );
  }

  return (
    <PlayingQuestionPage
      currentQuestion={currentQuestion}
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      timeLeft={timeLeft}
      userAnswer={userAnswer}
      answerSubmitted={answerSubmitted}
      showResult={showResult}
      answerResult={answerResult}
      isHost={isAdmin}
      isPaused={isPaused}
      onSubmitAnswer={handleSubmitAnswer}
      onNextQuestion={handleNextQuestion}
    />
  );
}
