import { Question } from "../../../../../shared/types";

import { MultipleChoiceAnswers } from "./MultipleChoiceAnswers";
import { TrueFalseAnswers } from "./TrueFalseAnswers";

interface PlayingAnswersProps {
  question: Question;
  userAnswer: string | null;
  onSubmitAnswer: (value: string) => void;
}

export function PlayingAnswers({
  question,
  userAnswer,
  onSubmitAnswer,
}: PlayingAnswersProps) {
  if (question.type === "multiple") {
    return (
      <MultipleChoiceAnswers
        userAnswer={userAnswer}
        onSubmit={onSubmitAnswer}
        options={getMultipleChoiceOptions(question)}
      />
    );
  }

  return <TrueFalseAnswers userAnswer={userAnswer} onSubmit={onSubmitAnswer} />;
}

function getMultipleChoiceOptions(question: Question) {
  return [
    {
      letter: "A",
      text: question.option_a ?? "",
      className: "answer-option-a",
    },
    {
      letter: "B",
      text: question.option_b ?? "",
      className: "answer-option-b",
    },
    {
      letter: "C",
      text: question.option_c ?? "",
      className: "answer-option-c",
    },
    {
      letter: "D",
      text: question.option_d ?? "",
      className: "answer-option-d",
    },
  ];
}
