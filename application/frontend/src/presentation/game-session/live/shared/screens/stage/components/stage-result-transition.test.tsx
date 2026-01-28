import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../../../../test-utils/render-with-providers';
import { StageResultTransition } from './stage-result-transition';

vi.mock('src/presentation/shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('StageResultTransition', () => {
  it('renders the time-up transition copy as a polite live region', () => {
    renderWithProviders(<StageResultTransition />);

    expect(screen.getByTestId('stage-result-transition')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('game.stage.timeUpTitle')).toBeInTheDocument();
    expect(screen.getByText('game.stage.timeUpDescription')).toBeInTheDocument();
  });
});
