import type { AnswerResult } from "../../../../../domains/game/types";
import type { Question } from "../../../../../domains/quiz/types";

import QuestionResultDisplay from "./components/question-result/QuestionResultDisplay";
import { PlayingLayout } from "./components/PlayingLayout";
import { QuestionTimerHeader } from "./components/QuestionTimerHeader";
import { QuestionCard } from "./components/QuestionCard";
import { PlayingAnswers } from "./components/PlayingAnswers";
import { useQuestionTimerState } from "./hooks/useQuestionTimerState";

interface PlayingPageProps {
  currentQuestion: Question;
  questionNumber: number;
  totalQuestions: number;
  timeLeft: number;
  userAnswer: string | null;
  answerSubmitted: boolean;
  showResult: boolean;
  answerResult: AnswerResult | null;
  isAdmin: boolean;
  onSubmitAnswer: (answer: string) => void;
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
  isAdmin,
  onSubmitAnswer,
  onNextQuestion,
}: PlayingPageProps) {
  const timeLimit = currentQuestion.time_limit ?? 0;
  const { progressPercent, severity } = useQuestionTimerState(
    timeLeft,
    timeLimit
  );

  return (
    <PlayingLayout>
      <QuestionTimerHeader
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        timeLeft={timeLeft}
        progressPercent={progressPercent}
        severity={severity}
      />

      <QuestionCard questionText={currentQuestion.question_text} />

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
          isAdmin={isAdmin}
          onNextQuestion={onNextQuestion}
        />
      )}
    </PlayingLayout>
  );
}
