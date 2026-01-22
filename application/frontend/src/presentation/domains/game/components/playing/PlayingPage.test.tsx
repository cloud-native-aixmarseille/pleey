import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Question } from "../../../../../domains/quiz/types";
import PlayingPage from "./PlayingPage";
import i18n from "../../../../../i18n/config";
import { createQuestionFixture } from "../../../../../test/fixtures";
import { ColorSchemeProvider } from "../../../../../presentation/shared/ui/theme";

const mockQuestion: Question = createQuestionFixture({
  questionText: "What is the capital of France?",
  answers: [
    { id: 1, text: "Paris", position: 0, isCorrect: true },
    { id: 2, text: "London", position: 1, isCorrect: false },
    { id: 3, text: "Berlin", position: 2, isCorrect: false },
    { id: 4, text: "Madrid", position: 3, isCorrect: false },
  ],
  timeLimit: 30,
});

describe("PlayingPage (player quick settings)", () => {
  it("renders the quick settings (ellipsis) menu button", async () => {
    await i18n.changeLanguage("en");

    render(
      <ColorSchemeProvider>
        <PlayingPage
          currentQuestion={mockQuestion}
          questionNumber={1}
          totalQuestions={5}
          timeLeft={30}
          userAnswer={null}
          answerSubmitted={false}
          showResult={false}
          answerResult={null}
          isHost={false}
          isPaused={false}
          quizTitle={null}
          onBackToLobby={vi.fn()}
          onBackToAdmin={vi.fn()}
          onTogglePause={vi.fn()}
          onSubmitAnswer={vi.fn()}
          onNextQuestion={vi.fn()}
        />
      </ColorSchemeProvider>
    );

    expect(
      screen.getByRole("button", { name: /quick settings/i })
    ).toBeInTheDocument();
  });

  it("opens the quick settings menu even when paused", async () => {
    await i18n.changeLanguage("en");

    const user = userEvent.setup();

    render(
      <ColorSchemeProvider>
        <PlayingPage
          currentQuestion={mockQuestion}
          questionNumber={1}
          totalQuestions={5}
          timeLeft={30}
          userAnswer={null}
          answerSubmitted={false}
          showResult={false}
          answerResult={null}
          isHost={false}
          isPaused
          quizTitle={null}
          onBackToLobby={vi.fn()}
          onBackToAdmin={vi.fn()}
          onTogglePause={vi.fn()}
          onSubmitAnswer={vi.fn()}
          onNextQuestion={vi.fn()}
        />
      </ColorSchemeProvider>
    );

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /quick settings/i }));

    expect(screen.getByRole("menu")).toBeInTheDocument();
  });
});
