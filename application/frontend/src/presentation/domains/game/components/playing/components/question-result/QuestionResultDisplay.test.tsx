import { createElement } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import QuestionResultDisplay from "./QuestionResultDisplay";
import type { AnswerResult } from "../../../../../../../domains/game/types";
import type { Question } from "../../../../../../../domains/quiz/types";
import { createQuestionFixture } from "../../../../../../../test/fixtures";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options: Record<string, unknown> = {}) => {
      const translations: Record<string, string> = {
        "game.playing.result.titleCorrect": "BRAVO !",
        "game.playing.result.titleIncorrect": "OOPS !",
        "game.playing.result.summaryPoints": "+{{points}} points",
        "game.playing.result.summaryCorrectAnswer":
          "Correct answer: {{answer}}",
        "game.playing.result.distributionTitle": "📊 Answer Distribution",
        "game.playing.result.distributionAriaLabel":
          "Answer distribution statistics",
        "game.playing.result.distributionCount_one": "{{count}} response",
        "game.playing.result.distributionCount_other": "{{count}} responses",
        "game.playing.result.optionLabel": "{{option}}. {{text}}",
        "game.playing.result.booleanLabel.true": "✓ TRUE",
        "game.playing.result.booleanLabel.false": "✗ FALSE",
        "game.playing.result.ariaPercent": "{{percent}}% of players",
        "game.playing.result.ariaCount":
          "{{count}} out of {{total}} players selected this answer",
        "game.playing.result.ariaCorrect": "correct answer",
        "game.playing.result.ariaUser": "your answer",
        "game.playing.result.shareTitle": "QuizMaster - Question Result",
        "game.playing.result.shareText":
          "I {{result}} and scored {{points}} points on question {{question}}! 🎯",
        "game.playing.result.shareTextResult.correct": "got it right",
        "game.playing.result.shareTextResult.incorrect": "missed it",
        "game.playing.result.announcementCorrect":
          "Correct! You earned {{points}} points.",
        "game.playing.result.announcementIncorrect":
          "Incorrect. The correct answer was {{answer}}.",
        "game.playing.result.announcementStatistics":
          "{{count}} players have answered this question.",
        "game.playing.result.nextQuestion": "Next question",
      };

      let template = translations[key];

      if (!template && typeof options.count === "number") {
        const suffix = options.count === 1 ? "_one" : "_other";
        template = translations[`${key}${suffix}`];
      }

      if (!template) {
        template = key;
      }

      return template.replace(/{{(\w+)}}/g, (_, match) => {
        const value = options[match as keyof typeof options];
        return value !== undefined ? String(value) : "";
      });
    },
  }),
}));

vi.mock("./components/ResultActions", () => ({
  ResultActions: ({
    shareText,
    isHost,
    onNextQuestion,
    nextQuestionLabel,
  }: {
    shareText: string;
    isHost: boolean;
    onNextQuestion: () => void;
    nextQuestionLabel: string;
  }) => (
    <div>
      {createElement("button", { "data-testid": "share-button" }, shareText)}
      {isHost
        ? createElement(
            "button",
            { type: "button", onClick: onNextQuestion },
            nextQuestionLabel
          )
        : null}
    </div>
  ),
}));

describe("QuestionResultDisplay", () => {
  const mockQuestion: Question = createQuestionFixture({
    question_text: "What is 2+2?",
    correct_answer: "A",
    option_a: "4",
    option_b: "3",
    option_c: "5",
    option_d: "6",
  });

  const mockAnswerResultCorrect: AnswerResult = {
    isCorrect: true,
    points: 1250,
    correctAnswer: "A",
    statistics: {
      totalAnswers: 10,
      answerDistribution: {
        A: 7,
        B: 2,
        C: 1,
        D: 0,
      },
    },
  };

  const mockAnswerResultIncorrect: AnswerResult = {
    isCorrect: false,
    points: 0,
    correctAnswer: "A",
    statistics: {
      totalAnswers: 10,
      answerDistribution: {
        A: 7,
        B: 2,
        C: 1,
        D: 0,
      },
    },
  };

  it("renders correct answer result with BRAVO message", () => {
    render(
      <QuestionResultDisplay
        answerResult={mockAnswerResultCorrect}
        currentQuestion={mockQuestion}
        questionNumber={1}
        userAnswer="A"
        isHost={false}
        onNextQuestion={vi.fn()}
      />
    );

    expect(screen.getByText(/BRAVO/i)).toBeInTheDocument();
    expect(screen.getByText(/\+1250 points/i)).toBeInTheDocument();
  });

  it("renders incorrect answer result with OUPS message", () => {
    render(
      <QuestionResultDisplay
        answerResult={mockAnswerResultIncorrect}
        currentQuestion={mockQuestion}
        questionNumber={1}
        userAnswer="B"
        isHost={false}
        onNextQuestion={vi.fn()}
      />
    );

    expect(screen.getByText(/OOPS/i)).toBeInTheDocument();
    expect(screen.getByText(/Correct answer: A/i)).toBeInTheDocument();
  });

  it("displays answer statistics when available", () => {
    render(
      <QuestionResultDisplay
        answerResult={mockAnswerResultCorrect}
        currentQuestion={mockQuestion}
        questionNumber={1}
        userAnswer="A"
        isHost={false}
        onNextQuestion={vi.fn()}
      />
    );

    expect(screen.getByText(/Answer Distribution/i)).toBeInTheDocument();
    expect(screen.getByText(/10 responses/i)).toBeInTheDocument();
  });

  it("shows next question button for admin users", () => {
    const onNextQuestion = vi.fn();
    render(
      <QuestionResultDisplay
        answerResult={mockAnswerResultCorrect}
        currentQuestion={mockQuestion}
        questionNumber={1}
        userAnswer="A"
        isHost={true}
        onNextQuestion={onNextQuestion}
      />
    );

    expect(screen.getByText(/Next question/i)).toBeInTheDocument();
  });

  it("does not show next question button for non-admin users", () => {
    render(
      <QuestionResultDisplay
        answerResult={mockAnswerResultCorrect}
        currentQuestion={mockQuestion}
        questionNumber={1}
        userAnswer="A"
        isHost={false}
        onNextQuestion={vi.fn()}
      />
    );

    expect(screen.queryByText(/Next question/i)).not.toBeInTheDocument();
  });

  it("displays statistics for true/false questions", () => {
    const tfQuestion: Question = createQuestionFixture({
      ...mockQuestion,
      type: "truefalse",
      correct_answer: "true",
    });

    const tfAnswerResult: AnswerResult = {
      isCorrect: true,
      points: 1000,
      correctAnswer: "true",
      statistics: {
        totalAnswers: 10,
        answerDistribution: {
          true: 8,
          false: 2,
        },
      },
    };

    render(
      <QuestionResultDisplay
        answerResult={tfAnswerResult}
        currentQuestion={tfQuestion}
        questionNumber={1}
        userAnswer="true"
        isHost={false}
        onNextQuestion={vi.fn()}
      />
    );

    expect(screen.getByText(/TRUE/i)).toBeInTheDocument();
    expect(screen.getByText(/FALSE/i)).toBeInTheDocument();
  });
});
