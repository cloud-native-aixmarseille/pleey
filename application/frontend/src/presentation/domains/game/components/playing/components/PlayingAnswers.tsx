import type { Question } from "../../../../../../domains/quiz/types";

import { MultipleChoiceAnswers } from "./MultipleChoiceAnswers";
import { TrueFalseAnswers } from "./TrueFalseAnswers";

interface PlayingAnswersProps {
  question: Question;
  userAnswer: number | null;
  answerSubmitted: boolean;
  onSubmitAnswer: (answerId: number) => void;
}

export function PlayingAnswers({
  question,
  userAnswer,
  answerSubmitted,
  onSubmitAnswer,
}: PlayingAnswersProps) {
  if (question.type === "multiple") {
    return (
      <MultipleChoiceAnswers
        userAnswer={userAnswer}
        answerSubmitted={answerSubmitted}
        onSubmit={onSubmitAnswer}
        options={getMultipleChoiceOptions(question)}
      />
    );
  }

  const trueAnswer = question.answers.find((answer) => answer.position === 0);
  const falseAnswer = question.answers.find((answer) => answer.position === 1);

  if (!trueAnswer || !falseAnswer) {
    return null;
  }

  return (
    <TrueFalseAnswers
      userAnswer={userAnswer}
      answerSubmitted={answerSubmitted}
      trueAnswerId={trueAnswer.id}
      falseAnswerId={falseAnswer.id}
      onSubmit={onSubmitAnswer}
    />
  );
}

function getMultipleChoiceOptions(question: Question) {
  return [...question.answers]
    .sort((left, right) => left.position - right.position)
    .map((answer) => ({
      id: answer.id,
      label: getOptionLabel(answer.position),
      text: answer.text ?? "",
    }));
}

const MULTIPLE_OPTION_LABELS = ["A", "B", "C", "D"];

function getOptionLabel(position: number): string {
  return MULTIPLE_OPTION_LABELS[position] ?? `${position + 1}`;
}
