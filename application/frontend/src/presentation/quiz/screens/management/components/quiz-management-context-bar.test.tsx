import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../../test-utils/render-with-ui-provider';
import { QuizManagementContextBar } from './quiz-management-context-bar';

vi.mock('../../../../shared/i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createModule();
});

describe('QuizManagementContextBar', () => {
  it('renders the quiz title and question count', () => {
    renderWithUiProvider(
      <QuizManagementContextBar
        quizTitle="Quarterly quiz"
        questionCount={5}
        createdAt="2026-03-15T10:00:00.000Z"
      />,
    );

    expect(screen.getByText('Quarterly quiz')).toBeInTheDocument();
    expect(screen.getByText(/quiz\.management\.questionSummary/)).toBeInTheDocument();
  });

  it('renders the created date', () => {
    renderWithUiProvider(
      <QuizManagementContextBar
        quizTitle="Weekly trivia"
        questionCount={0}
        createdAt="2026-03-15T10:00:00.000Z"
      />,
    );

    expect(screen.getByText(/quiz\.management\.createdAt/)).toBeInTheDocument();
  });

  it('renders with banner role and accessible label', () => {
    renderWithUiProvider(
      <QuizManagementContextBar
        quizTitle="Onboarding quiz"
        questionCount={3}
        createdAt="2026-03-15T10:00:00.000Z"
      />,
    );

    expect(
      screen.getByRole('banner', { name: 'quiz.management.contextBarLabel' }),
    ).toBeInTheDocument();
  });

  it('shows zero question count when no questions exist', () => {
    renderWithUiProvider(
      <QuizManagementContextBar
        quizTitle="Empty quiz"
        questionCount={0}
        createdAt="2026-01-01T00:00:00.000Z"
      />,
    );

    expect(screen.getByText('Empty quiz')).toBeInTheDocument();
    expect(screen.getByText(/quiz\.management\.questionSummary/)).toBeInTheDocument();
  });
});
