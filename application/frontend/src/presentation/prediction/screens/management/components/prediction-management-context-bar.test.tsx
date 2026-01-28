import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../../test-utils/render-with-ui-provider';
import { PredictionManagementContextBar } from './prediction-management-context-bar';

vi.mock('../../../../shared/i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createModule();
});

describe('PredictionManagementContextBar', () => {
  it('renders the prediction title and prompt count', () => {
    renderWithUiProvider(
      <PredictionManagementContextBar
        predictionTitle="Q4 market forecast"
        promptCount={5}
        createdAt="2026-03-15T10:00:00.000Z"
      />,
    );

    expect(screen.getByText('Q4 market forecast')).toBeInTheDocument();
    expect(screen.getByText(/prediction\.management\.promptSummary/)).toBeInTheDocument();
  });

  it('renders the created date', () => {
    renderWithUiProvider(
      <PredictionManagementContextBar
        predictionTitle="Weekly prediction"
        promptCount={0}
        createdAt="2026-03-15T10:00:00.000Z"
      />,
    );

    expect(screen.getByText(/prediction\.management\.createdAt/)).toBeInTheDocument();
  });

  it('renders with banner role and accessible label', () => {
    renderWithUiProvider(
      <PredictionManagementContextBar
        predictionTitle="Onboarding prediction"
        promptCount={3}
        createdAt="2026-03-15T10:00:00.000Z"
      />,
    );

    expect(
      screen.getByRole('banner', { name: 'prediction.management.contextBarLabel' }),
    ).toBeInTheDocument();
  });

  it('shows zero prompt count when no prompts exist', () => {
    renderWithUiProvider(
      <PredictionManagementContextBar
        predictionTitle="Empty prediction"
        promptCount={0}
        createdAt="2026-01-01T00:00:00.000Z"
      />,
    );

    expect(screen.getByText('Empty prediction')).toBeInTheDocument();
    expect(screen.getByText(/prediction\.management\.promptSummary/)).toBeInTheDocument();
  });
});
