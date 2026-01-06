import { useEffect, useMemo, useState } from "react";
import type { AnswerResult } from "../../../../domains/game/types";
import type { Question } from "../../../../domains/quiz/types";

import {
  calculateProgressPercentage,
  determineTimerUrgency,
  TimerUrgency,
} from "./constants";
import { PlayingLayout } from "./components/PlayingLayout";
import { HostBadge } from "./components/HostBadge";
import { RoundStatusCard } from "./components/RoundStatusCard";
import { QuestionDisplay } from "./components/QuestionDisplay";
import { WaitingForAnswers } from "./components/WaitingForAnswers";
import { ResultsDisplay } from "./components/ResultsDisplay";

export interface AdminHostPlayingViewProps {
  currentQuestion: Question;
  questionNumber: number;
  totalQuestions: number;
  timeLeft: number;
  showResult: boolean;
  answerResult: AnswerResult | null;
  onNextQuestion: () => void;
}

function useTimerPulse(timerUrgency: TimerUrgency) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setPulse(timerUrgency === "low");
  }, [timerUrgency]);

  return pulse;
}

export default function AdminHostPlayingView({
  currentQuestion,
  questionNumber,
  totalQuestions,
  timeLeft,
  showResult,
  answerResult,
  onNextQuestion,
}: AdminHostPlayingViewProps) {
  const timerUrgency = determineTimerUrgency(timeLeft);
  const pulseAnimation = useTimerPulse(timerUrgency);

  const progressPercent = useMemo(
    () => calculateProgressPercentage(timeLeft, currentQuestion.time_limit),
    [timeLeft, currentQuestion.time_limit]
  );

  const totalAnswers = answerResult?.statistics?.totalAnswers ?? null;
  const shouldShowResults = showResult && Boolean(answerResult);

  return (
    <PlayingLayout>
      <HostBadge />

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
