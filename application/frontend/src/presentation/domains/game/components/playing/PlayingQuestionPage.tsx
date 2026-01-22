import type { AnswerResult } from "../../../../../domains/game/types";
import type { Question } from "../../../../../domains/quiz/types";

import { PlayingLayout } from "./components/PlayingLayout";
import { QuestionTimerHeader } from "./components/QuestionTimerHeader";
import { QuestionCard } from "./components/QuestionCard";
import { PlayingAnswers } from "./components/PlayingAnswers";
import { GamePausedOverlay } from "./components/GamePausedOverlay";
import { useQuestionTimerState } from "./hooks/useQuestionTimerState";
import QuestionResultDisplay from "./components/question-result/QuestionResultDisplay";
import { QuickSettingsMenu } from "../../../app-shell";

const QUICK_SETTINGS_WRAPPER_CLASSES =
  "fixed right-4 top-4 z-[60] sm:right-6 sm:top-6";

interface PlayingQuestionPageProps {
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
  onSubmitAnswer: (answerId: number) => void;
  onNextQuestion: () => void;
}

export function PlayingQuestionPage({
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
  onSubmitAnswer,
  onNextQuestion,
}: PlayingQuestionPageProps) {
  const timeLimit = currentQuestion.timeLimit ?? 0;
  const { progressPercent, severity } = useQuestionTimerState(
    timeLeft,
    timeLimit
  );

  return (
    <PlayingLayout>
      <QuickSettingsMenu className={QUICK_SETTINGS_WRAPPER_CLASSES} />
      {isPaused && <GamePausedOverlay />}

      <QuestionTimerHeader
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        timeLeft={timeLeft}
        progressPercent={progressPercent}
        severity={severity}
      />

      <QuestionCard questionText={currentQuestion.questionText} />

      {!showResult && (
        <PlayingAnswers
          question={currentQuestion}
          userAnswer={userAnswer}
          answerSubmitted={answerSubmitted}
          onSubmitAnswer={onSubmitAnswer}
        />
      )}

      {showResult && answerResult && (
        <QuestionResultDisplay
          answerResult={answerResult}
          currentQuestion={currentQuestion}
          questionNumber={questionNumber}
          userAnswer={userAnswer}
          isHost={isHost}
          onNextQuestion={onNextQuestion}
        />
      )}
    </PlayingLayout>
  );
}
