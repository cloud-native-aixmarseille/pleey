import { useEffect, useState } from "react";
import type { AnswerResult } from "../../../../../../domains/game/types";
import type { Question } from "../../../../../../domains/quiz/types";

import { PlayingLayout } from "../components/PlayingLayout";
import { useQuestionTimerState } from "../hooks/useQuestionTimerState";
import { HostBadge } from "./components/HostBadge";
import { HostControlMenu } from "./components/HostControlMenu";
import {
  RoundStatusCard,
  type TimerUrgency,
} from "./components/RoundStatusCard";
import { QuestionDisplay } from "./components/QuestionDisplay";
import { WaitingForAnswers } from "./components/WaitingForAnswers";
import { ResultsDisplay } from "./components/ResultsDisplay";
import { PausedHostBanner } from "../../shared/PausedHostBanner";

export interface HostPlayingViewProps {
  currentQuestion: Question;
  questionNumber: number;
  totalQuestions: number;
  timeLeft: number;
  showResult: boolean;
  answerResult: AnswerResult | null;
  onNextQuestion: () => void;
  quizTitle?: string | null;
  isPaused?: boolean;
  onBackToLobby: () => void;
  onBackToAdmin: () => void;
  onTogglePause: () => void;
}

function useTimerPulse(timerUrgency: TimerUrgency) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setPulse(timerUrgency === "low");
  }, [timerUrgency]);

  return pulse;
}

function severityToUrgency(
  severity: "normal" | "warning" | "critical"
): TimerUrgency {
  if (severity === "critical") {
    return "low";
  }

  if (severity === "warning") {
    return "medium";
  }

  return "high";
}

export default function HostPlayingView({
  currentQuestion,
  questionNumber,
  totalQuestions,
  timeLeft,
  showResult,
  answerResult,
  onNextQuestion,
  quizTitle,
  isPaused = false,
  onBackToLobby,
  onBackToAdmin,
  onTogglePause,
}: HostPlayingViewProps) {
  const timeLimit = currentQuestion.timeLimit ?? 0;
  const { progressPercent, severity } = useQuestionTimerState(
    timeLeft,
    timeLimit
  );
  const timerUrgency = severityToUrgency(severity);
  const pulseAnimation = useTimerPulse(timerUrgency);

  const totalAnswers = answerResult?.statistics?.totalAnswers ?? null;
  const shouldShowResults = showResult && Boolean(answerResult);

  const hostOverlayContent = (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-8 top-20 h-72 w-72 rounded-full bg-primary-500/10 blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-24 right-10 h-80 w-80 rounded-full bg-accent-500/10 blur-3xl animate-pulse-slow" />
      <div className="absolute right-1/4 top-1/3 h-28 w-28 rounded-full bg-secondary-500/10 blur-2xl animate-float" />
    </div>
  );

  return (
    <PlayingLayout overlays={hostOverlayContent} wrapInContainer>
      <HostControlMenu
        isPaused={isPaused}
        className="absolute top-4 right-4 z-50"
        onBackToLobby={onBackToLobby}
        onBackToAdmin={onBackToAdmin}
        onTogglePause={onTogglePause}
      />

      <HostBadge quizTitle={quizTitle} />

      <PausedHostBanner isPaused={isPaused} onResume={onTogglePause} />

      <RoundStatusCard
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        timeLeft={timeLeft}
        progressPercent={progressPercent}
        timerUrgency={timerUrgency}
        pulseAnimation={pulseAnimation}
        totalAnswers={totalAnswers}
        showResult={showResult}
      />

      <QuestionDisplay question={currentQuestion} />

      {!shouldShowResults && <WaitingForAnswers question={currentQuestion} />}

      {shouldShowResults && answerResult && (
        <ResultsDisplay
          question={currentQuestion}
          answerResult={answerResult}
          onNextQuestion={onNextQuestion}
        />
      )}
    </PlayingLayout>
  );
}
