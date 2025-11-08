import { AnswerResult, Question } from "../../../../shared/types";

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
