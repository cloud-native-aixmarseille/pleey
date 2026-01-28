import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PromptFormState } from '../../../../domains/prediction/entities/prediction-prompt-form-state';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { PredictionPromptForm } from './prediction-prompt-form';

vi.mock('../../../shared/i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createModule();
});

function createDefaultFormState(): PromptFormState {
  return {
    promptText: '',
    options: [
      { position: 1, text: '' },
      { position: 2, text: '' },
      { position: 3, text: '' },
      { position: 4, text: '' },
    ],
    correctOptionPosition: 1,
    timeLimit: '30',
    points: '100',
  };
}

describe('PredictionPromptForm', () => {
  it('forwards prompt text changes through the form state setter', () => {
    const formState = createDefaultFormState();
    const setFormState = vi.fn();

    renderWithUiProvider(
      <PredictionPromptForm
        editingPromptId={null}
        formState={formState}
        isSubmitting={false}
        onCancelEdit={vi.fn()}
        onSubmit={vi.fn()}
        setFormState={setFormState}
      />,
    );

    fireEvent.change(screen.getByLabelText('prediction.management.promptLabel'), {
      target: { value: 'Forecast next quarter demand' },
    });

    const update = setFormState.mock.calls[0]?.[0] as (
      current: typeof formState,
    ) => typeof formState;
    expect(update(formState).promptText).toBe('Forecast next quarter demand');
    expect(
      screen.getByRole('button', { name: 'prediction.management.createPromptAction' }),
    ).toBeInTheDocument();
  });
});
