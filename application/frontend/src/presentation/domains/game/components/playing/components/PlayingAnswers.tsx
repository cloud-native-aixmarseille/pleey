import type { Question } from "../../../../../../domains/quiz/types";

import { MultipleChoiceAnswers } from "./MultipleChoiceAnswers";
import { TrueFalseAnswers } from "./TrueFalseAnswers";

interface PlayingAnswersProps {
  question: Question;
  userAnswer: string | null;
  answerSubmitted: boolean;
  onSubmitAnswer: (value: string) => void;
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

  return (
    <TrueFalseAnswers
      userAnswer={userAnswer}
      answerSubmitted={answerSubmitted}
      onSubmit={onSubmitAnswer}
    />
  );
}

function getMultipleChoiceOptions(question: Question) {
  return [
    {
      letter: "A",
      text: question.option_a ?? "",
    },
    {
      letter: "B",
      text: question.option_b ?? "",
    },
    {
      letter: "C",
      text: question.option_c ?? "",
    },
    {
      letter: "D",
      text: question.option_d ?? "",
    },
  ];
}
