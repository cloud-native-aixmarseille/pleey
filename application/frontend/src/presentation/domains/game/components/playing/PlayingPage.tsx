import type { AnswerResult } from "../../../../../domains/game/types";
import type { Question } from "../../../../../domains/quiz/types";

import HostPlayingView from "./host/HostPlayingView";
import { PlayingQuestionPage } from "./PlayingQuestionPage";

interface PlayingPageProps {
  currentQuestion: Question;
  questionNumber: number;
  totalQuestions: number;
  timeLeft: number;
  userAnswer: number | null;
  answerSubmitted: boolean;
  showResult: boolean;
  answerResult: AnswerResult | null;
  isHost: boolean;
  isPaused?: boolean;
  quizTitle?: string | null;
  onBackToLobby: () => void;
  onBackToAdmin: () => void;
  onTogglePause: () => void;
  onSubmitAnswer: (answerId: number) => void;
  onNextQuestion: () => void;
}

export default function PlayingPage({
  currentQuestion,
  questionNumber,
  totalQuestions,
  timeLeft,
  userAnswer,
  answerSubmitted,
  showResult,
  answerResult,
  isHost,
  isPaused = false,
  quizTitle,
  onBackToLobby,
  onBackToAdmin,
  onTogglePause,
  onSubmitAnswer,
  onNextQuestion,
}: PlayingPageProps) {
  if (isHost) {
    return (
      <HostPlayingView
        currentQuestion={currentQuestion}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        timeLeft={timeLeft}
        showResult={showResult}
        answerResult={answerResult}
        onNextQuestion={onNextQuestion}
        quizTitle={quizTitle}
        isPaused={isPaused}
        onBackToLobby={onBackToLobby}
        onBackToAdmin={onBackToAdmin}
        onTogglePause={onTogglePause}
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
      isHost={isHost}
      isPaused={isPaused}
      onSubmitAnswer={onSubmitAnswer}
      onNextQuestion={onNextQuestion}
    />
  );
}
