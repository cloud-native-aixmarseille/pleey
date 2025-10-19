import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuestionResultDisplay from '../QuestionResultDisplay';
import type { AnswerResult, Question } from '../../../../shared/types';

// Mock the ShareButton component
vi.mock('../ShareButton', () => ({
  ShareButton: ({ title, text }: { title: string; text: string }) => (
    <button data-testid="share-button">{text}</button>
  ),
}));

describe('QuestionResultDisplay', () => {
  const mockQuestion: Question = {
    id: 1,
    quiz_id: 1,
    question_text: 'What is 2+2?',
    type: 'multiple',
    correct_answer: 'A',
    option_a: '4',
    option_b: '3',
    option_c: '5',
    option_d: '6',
    time_limit: 20,
    points: 1000,
  };

  const mockAnswerResultCorrect: AnswerResult = {
    isCorrect: true,
    points: 1250,
    correctAnswer: 'A',
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
    correctAnswer: 'A',
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

  it('renders correct answer result with BRAVO message', () => {
    render(
      <QuestionResultDisplay
        answerResult={mockAnswerResultCorrect}
        currentQuestion={mockQuestion}
        questionNumber={1}
        userAnswer="A"
        isAdmin={false}
        onNextQuestion={vi.fn()}
      />
    );

    expect(screen.getByText(/BRAVO/i)).toBeInTheDocument();
    expect(screen.getByText(/\+1250 points/i)).toBeInTheDocument();
  });

  it('renders incorrect answer result with OUPS message', () => {
    render(
      <QuestionResultDisplay
        answerResult={mockAnswerResultIncorrect}
        currentQuestion={mockQuestion}
        questionNumber={1}
        userAnswer="B"
        isAdmin={false}
        onNextQuestion={vi.fn()}
      />
    );

    expect(screen.getByText(/OUPS/i)).toBeInTheDocument();
    expect(screen.getByText(/Bonne réponse: A/i)).toBeInTheDocument();
  });

  it('displays answer statistics when available', () => {
    render(
      <QuestionResultDisplay
        answerResult={mockAnswerResultCorrect}
        currentQuestion={mockQuestion}
        questionNumber={1}
        userAnswer="A"
        isAdmin={false}
        onNextQuestion={vi.fn()}
      />
    );

    expect(screen.getByText(/Answer Distribution/i)).toBeInTheDocument();
    expect(screen.getByText(/10 réponses/i)).toBeInTheDocument();
  });

  it('shows next question button for admin users', () => {
    const onNextQuestion = vi.fn();
    render(
      <QuestionResultDisplay
        answerResult={mockAnswerResultCorrect}
        currentQuestion={mockQuestion}
        questionNumber={1}
        userAnswer="A"
        isAdmin={true}
        onNextQuestion={onNextQuestion}
      />
    );

    expect(screen.getByText(/Question suivante/i)).toBeInTheDocument();
  });

  it('does not show next question button for non-admin users', () => {
    render(
      <QuestionResultDisplay
        answerResult={mockAnswerResultCorrect}
        currentQuestion={mockQuestion}
        questionNumber={1}
        userAnswer="A"
        isAdmin={false}
        onNextQuestion={vi.fn()}
      />
    );

    expect(screen.queryByText(/Question suivante/i)).not.toBeInTheDocument();
  });

  it('displays statistics for true/false questions', () => {
    const tfQuestion: Question = {
      ...mockQuestion,
      type: 'truefalse',
      correct_answer: 'true',
    };

    const tfAnswerResult: AnswerResult = {
      isCorrect: true,
      points: 1000,
      correctAnswer: 'true',
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
        isAdmin={false}
        onNextQuestion={vi.fn()}
      />
    );

    expect(screen.getByText(/VRAI/i)).toBeInTheDocument();
    expect(screen.getByText(/FAUX/i)).toBeInTheDocument();
  });

  it('renders share button', () => {
    render(
      <QuestionResultDisplay
        answerResult={mockAnswerResultCorrect}
        currentQuestion={mockQuestion}
        questionNumber={1}
        userAnswer="A"
        isAdmin={false}
        onNextQuestion={vi.fn()}
      />
    );

    expect(screen.getByTestId('share-button')).toBeInTheDocument();
  });

  it('works without statistics', () => {
    const answerResultNoStats: AnswerResult = {
      isCorrect: true,
      points: 1000,
      correctAnswer: 'A',
    };

    render(
      <QuestionResultDisplay
        answerResult={answerResultNoStats}
        currentQuestion={mockQuestion}
        questionNumber={1}
        userAnswer="A"
        isAdmin={false}
        onNextQuestion={vi.fn()}
      />
    );

    expect(screen.queryByText(/Answer Distribution/i)).not.toBeInTheDocument();
  });
});
