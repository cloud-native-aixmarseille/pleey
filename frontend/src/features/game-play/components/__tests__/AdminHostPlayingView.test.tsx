import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminHostPlayingView from '../AdminHostPlayingView';
import { Question, AnswerResult } from '../../../../shared/types';

const mockQuestion: Question = {
  id: 1,
  quiz_id: 1,
  question_text: 'What is the capital of France?',
  type: 'multiple' as const,
  correct_answer: 'A',
  option_a: 'Paris',
  option_b: 'London',
  option_c: 'Berlin',
  option_d: 'Madrid',
  time_limit: 30,
  points: 100,
  created_at: new Date().toISOString(),
};

const mockAnswerResult: AnswerResult = {
  isCorrect: true,
  points: 100,
  correctAnswer: 'A',
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

describe('AdminHostPlayingView', () => {
  it('renders host mode badge', () => {
    render(
      <AdminHostPlayingView
        currentQuestion={mockQuestion}
        questionNumber={1}
        totalQuestions={5}
        timeLeft={30}
        showResult={false}
        answerResult={null}
        onNextQuestion={vi.fn()}
      />
    );

    expect(screen.getByText(/HOST VIEW/i)).toBeInTheDocument();
    expect(screen.getByText(/SCREEN SHARE MODE/i)).toBeInTheDocument();
  });

  it('displays question number and total', () => {
    render(
      <AdminHostPlayingView
        currentQuestion={mockQuestion}
        questionNumber={2}
        totalQuestions={5}
        timeLeft={30}
        showResult={false}
        answerResult={null}
        onNextQuestion={vi.fn()}
      />
    );

    expect(screen.getByText('2 / 5')).toBeInTheDocument();
  });

  it('displays timer with correct value', () => {
    render(
      <AdminHostPlayingView
        currentQuestion={mockQuestion}
        questionNumber={1}
        totalQuestions={5}
        timeLeft={15}
        showResult={false}
        answerResult={null}
        onNextQuestion={vi.fn()}
      />
    );

    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('shows question text prominently', () => {
    render(
      <AdminHostPlayingView
        currentQuestion={mockQuestion}
        questionNumber={1}
        totalQuestions={5}
        timeLeft={30}
        showResult={false}
        answerResult={null}
        onNextQuestion={vi.fn()}
      />
    );

    expect(screen.getByText('What is the capital of France?')).toBeInTheDocument();
  });

  it('displays answer options in non-interactive mode', () => {
    render(
      <AdminHostPlayingView
        currentQuestion={mockQuestion}
        questionNumber={1}
        totalQuestions={5}
        timeLeft={30}
        showResult={false}
        answerResult={null}
        onNextQuestion={vi.fn()}
      />
    );

    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('Berlin')).toBeInTheDocument();
    expect(screen.getByText('Madrid')).toBeInTheDocument();

    // Verify options are not interactive (no buttons)
    expect(screen.queryByRole('button', { name: /Paris/i })).not.toBeInTheDocument();
  });

  it('shows waiting message when not in results phase', () => {
    render(
      <AdminHostPlayingView
        currentQuestion={mockQuestion}
        questionNumber={1}
        totalQuestions={5}
        timeLeft={30}
        showResult={false}
        answerResult={null}
        onNextQuestion={vi.fn()}
      />
    );

    expect(screen.getByText(/Waiting for players to answer/i)).toBeInTheDocument();
  });

  it('displays results and statistics when showResult is true', () => {
    render(
      <AdminHostPlayingView
        currentQuestion={mockQuestion}
        questionNumber={1}
        totalQuestions={5}
        timeLeft={0}
        showResult={true}
        answerResult={mockAnswerResult}
        onNextQuestion={vi.fn()}
      />
    );

    expect(screen.getByText(/RESULTS/i)).toBeInTheDocument();
    expect(screen.getByText(/Correct Answer:/i)).toBeInTheDocument();
    expect(screen.getByText(/Player Responses/i)).toBeInTheDocument();
  });

  it('shows answer distribution in results', () => {
    render(
      <AdminHostPlayingView
        currentQuestion={mockQuestion}
        questionNumber={1}
        totalQuestions={5}
        timeLeft={0}
        showResult={true}
        answerResult={mockAnswerResult}
        onNextQuestion={vi.fn()}
      />
    );

    // Should show percentages
    expect(screen.getByText('75%')).toBeInTheDocument(); // 3/4 for option A
    expect(screen.getByText('25%')).toBeInTheDocument(); // 1/4 for option B
    const zeroPercents = screen.getAllByText('0%');
    expect(zeroPercents.length).toBeGreaterThanOrEqual(2); // 0/4 for options C and D
  });

  it('displays Next Question button in results phase', () => {
    render(
      <AdminHostPlayingView
        currentQuestion={mockQuestion}
        questionNumber={1}
        totalQuestions={5}
        timeLeft={0}
        showResult={true}
        answerResult={mockAnswerResult}
        onNextQuestion={vi.fn()}
      />
    );

    const nextButton = screen.getByRole('button', { name: /NEXT QUESTION/i });
    expect(nextButton).toBeInTheDocument();
  });

  it('calls onNextQuestion when Next Question button is clicked', async () => {
    const user = userEvent.setup();
    const mockNextQuestion = vi.fn();

    render(
      <AdminHostPlayingView
        currentQuestion={mockQuestion}
        questionNumber={1}
        totalQuestions={5}
        timeLeft={0}
        showResult={true}
        answerResult={mockAnswerResult}
        onNextQuestion={mockNextQuestion}
      />
    );

    const nextButton = screen.getByRole('button', { name: /NEXT QUESTION/i });
    await user.click(nextButton);

    expect(mockNextQuestion).toHaveBeenCalledTimes(1);
  });

  it('renders true/false question correctly', () => {
    const trueFalseQuestion: Question = {
      ...mockQuestion,
      type: 'boolean' as const,
      correct_answer: 'true',
      option_a: null,
      option_b: null,
      option_c: null,
      option_d: null,
    };

    render(
      <AdminHostPlayingView
        currentQuestion={trueFalseQuestion}
        questionNumber={1}
        totalQuestions={5}
        timeLeft={30}
        showResult={false}
        answerResult={null}
        onNextQuestion={vi.fn()}
      />
    );

    expect(screen.getByText('VRAI')).toBeInTheDocument();
    expect(screen.getByText('FAUX')).toBeInTheDocument();
  });

  it('highlights low time with danger styling', () => {
    const { container } = render(
      <AdminHostPlayingView
        currentQuestion={mockQuestion}
        questionNumber={1}
        totalQuestions={5}
        timeLeft={3}
        showResult={false}
        answerResult={null}
        onNextQuestion={vi.fn()}
      />
    );

    // Check for danger-related text (timer showing low time)
    expect(screen.getByText('3')).toBeInTheDocument();
    // The container should have danger-colored elements when time is low
    const timerElement = container.querySelector('[class*="danger"]');
    expect(timerElement).toBeTruthy();
  });
});
