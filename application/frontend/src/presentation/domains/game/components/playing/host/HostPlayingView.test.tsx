import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HostPlayingView from "./HostPlayingView";
import type { AnswerResult } from "../../../../../../domains/game/types";
import type { Question } from "../../../../../../domains/quiz/types";
import i18n from "../../../../../../i18n/config";
import { createQuestionFixture } from "../../../../../../test/fixtures";

const mockQuestion: Question = createQuestionFixture({
  question_text: "What is the capital of France?",
  correct_answer: "A",
  option_a: "Paris",
  option_b: "London",
  option_c: "Berlin",
  option_d: "Madrid",
  time_limit: 30,
});

const defaultHostCallbacks = {
  onBackToLobby: vi.fn(),
  onBackToAdmin: vi.fn(),
  onTogglePause: vi.fn(),
};

const mockAnswerResult: AnswerResult = {
  isCorrect: true,
  points: 100,
  correctAnswer: "A",
  statistics: {
    totalAnswers: 4,
    answerDistribution: {
      A: 3,
      B: 1,
      C: 0,
      D: 0,
    },
  },
};

describe("HostPlayingView", () => {
  it("renders a Resume Game button in the paused host banner and calls onTogglePause", async () => {
    const user = userEvent.setup();
    const onTogglePause = vi.fn();

    render(
      <HostPlayingView
        currentQuestion={mockQuestion}
        questionNumber={1}
        totalQuestions={5}
        timeLeft={30}
        showResult={false}
        answerResult={null}
        onNextQuestion={vi.fn()}
        onBackToLobby={vi.fn()}
        onBackToAdmin={vi.fn()}
        onTogglePause={onTogglePause}
        isPaused
      />
    );

    const banner = screen.getByTestId("paused-host-banner");
    await user.click(within(banner).getByRole("button", { name: /resume/i }));
    expect(onTogglePause).toHaveBeenCalledTimes(1);
  });

  it("renders host mode badge with quiz title", () => {
    render(
      <HostPlayingView
        currentQuestion={mockQuestion}
        questionNumber={1}
        totalQuestions={5}
        timeLeft={30}
        showResult={false}
        answerResult={null}
        onNextQuestion={vi.fn()}
        {...defaultHostCallbacks}
        quizTitle="Geography Quiz"
      />
    );

    expect(screen.getByText(/HOST VIEW/i)).toBeInTheDocument();
    expect(screen.getByText("Geography Quiz")).toBeInTheDocument();
  });

  it("displays question number and total", () => {
    render(
      <HostPlayingView
        currentQuestion={mockQuestion}
        questionNumber={2}
        totalQuestions={5}
        timeLeft={30}
        showResult={false}
        answerResult={null}
        onNextQuestion={vi.fn()}
        {...defaultHostCallbacks}
      />
    );

    expect(screen.getByText("2 / 5")).toBeInTheDocument();
  });

  it("displays timer with correct value", () => {
    render(
      <HostPlayingView
        currentQuestion={mockQuestion}
        questionNumber={1}
        totalQuestions={5}
        timeLeft={15}
        showResult={false}
        answerResult={null}
        onNextQuestion={vi.fn()}
        {...defaultHostCallbacks}
      />
    );

    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("shows question text prominently", () => {
    render(
      <HostPlayingView
        currentQuestion={mockQuestion}
        questionNumber={1}
        totalQuestions={5}
        timeLeft={30}
        showResult={false}
        answerResult={null}
        onNextQuestion={vi.fn()}
        {...defaultHostCallbacks}
      />
    );

    expect(
      screen.getByText("What is the capital of France?")
    ).toBeInTheDocument();
  });

  it("displays answer options in non-interactive mode", () => {
    render(
      <HostPlayingView
        currentQuestion={mockQuestion}
        questionNumber={1}
        totalQuestions={5}
        timeLeft={30}
        showResult={false}
        answerResult={null}
        onNextQuestion={vi.fn()}
        {...defaultHostCallbacks}
      />
    );

    expect(screen.getByText("Paris")).toBeInTheDocument();
    expect(screen.getByText("London")).toBeInTheDocument();
    expect(screen.getByText("Berlin")).toBeInTheDocument();
    expect(screen.getByText("Madrid")).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /Paris/i })
    ).not.toBeInTheDocument();
  });

  it("shows waiting message when not in results phase", () => {
    render(
      <HostPlayingView
        currentQuestion={mockQuestion}
        questionNumber={1}
        totalQuestions={5}
        timeLeft={30}
        showResult={false}
        answerResult={null}
        onNextQuestion={vi.fn()}
        {...defaultHostCallbacks}
      />
    );

    expect(
      screen.getByText(/Waiting for players to answer/i)
    ).toBeInTheDocument();
  });

  it("displays results and statistics when showResult is true", () => {
    render(
      <HostPlayingView
        currentQuestion={mockQuestion}
        questionNumber={1}
        totalQuestions={5}
        timeLeft={0}
        showResult={true}
        answerResult={mockAnswerResult}
        onNextQuestion={vi.fn()}
        {...defaultHostCallbacks}
      />
    );

    expect(screen.getByText(/RESULTS/i)).toBeInTheDocument();
    expect(screen.getByText(/Correct Answer:/i)).toBeInTheDocument();
    expect(screen.getByText(/Player Responses/i)).toBeInTheDocument();
  });

  it("shows answer distribution in results", () => {
    render(
      <HostPlayingView
        currentQuestion={mockQuestion}
        questionNumber={1}
        totalQuestions={5}
        timeLeft={0}
        showResult={true}
        answerResult={mockAnswerResult}
        onNextQuestion={vi.fn()}
        {...defaultHostCallbacks}
      />
    );

    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();
    const zeroPercents = screen.getAllByText("0%");
    expect(zeroPercents.length).toBeGreaterThanOrEqual(2);
  });

  it("displays Next Question button in results phase", () => {
    render(
      <HostPlayingView
        currentQuestion={mockQuestion}
        questionNumber={1}
        totalQuestions={5}
        timeLeft={0}
        showResult={true}
        answerResult={mockAnswerResult}
        onNextQuestion={vi.fn()}
        {...defaultHostCallbacks}
      />
    );

    const nextButton = screen.getByRole("button", { name: /NEXT QUESTION/i });
    expect(nextButton).toBeInTheDocument();
  });

  it("calls onNextQuestion when Next Question button is clicked", async () => {
    const user = userEvent.setup();
    const mockNextQuestion = vi.fn();

    render(
      <HostPlayingView
        currentQuestion={mockQuestion}
        questionNumber={1}
        totalQuestions={5}
        timeLeft={0}
        showResult={true}
        answerResult={mockAnswerResult}
        onNextQuestion={mockNextQuestion}
        {...defaultHostCallbacks}
      />
    );

    const nextButton = screen.getByRole("button", { name: /NEXT QUESTION/i });
    await user.click(nextButton);

    expect(mockNextQuestion).toHaveBeenCalledTimes(1);
  });

  it("renders true/false question correctly", () => {
    const trueFalseQuestion: Question = createQuestionFixture({
      ...mockQuestion,
      type: "boolean" as const,
      correct_answer: "true",
      option_a: null,
      option_b: null,
      option_c: null,
      option_d: null,
    });

    render(
      <HostPlayingView
        currentQuestion={trueFalseQuestion}
        questionNumber={1}
        totalQuestions={5}
        timeLeft={30}
        showResult={false}
        answerResult={null}
        onNextQuestion={vi.fn()}
        {...defaultHostCallbacks}
      />
    );

    const trueLabel = i18n.t("game.playing.trueFalse.trueWord");
    const falseLabel = i18n.t("game.playing.trueFalse.falseWord");

    expect(screen.getByText(trueLabel)).toBeInTheDocument();
    expect(screen.getByText(falseLabel)).toBeInTheDocument();
  });

  it("highlights low time with danger styling", () => {
    const { container } = render(
      <HostPlayingView
        currentQuestion={mockQuestion}
        questionNumber={1}
        totalQuestions={5}
        timeLeft={3}
        showResult={false}
        answerResult={null}
        onNextQuestion={vi.fn()}
        {...defaultHostCallbacks}
      />
    );

    expect(screen.getByText("3")).toBeInTheDocument();
    const timerElement = container.querySelector('[class*="danger"]');
    expect(timerElement).toBeTruthy();
  });
});
