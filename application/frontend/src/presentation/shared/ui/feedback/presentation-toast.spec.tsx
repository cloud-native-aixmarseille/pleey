import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { usePresentationFeedbackChannel } from './use-presentation-feedback-channel';

function ToastHarness() {
  const feedback = usePresentationFeedbackChannel();

  return (
    <button
      onClick={() => {
        feedback.notify('success', 'Project created successfully.', {
          id: 'toast-shell',
        });
      }}
      type="button"
    >
      Trigger toast
    </button>
  );
}

describe('PresentationToastViewport', () => {
  it('renders toast items on an opaque shell', async () => {
    const user = userEvent.setup();

    renderWithUiProvider(<ToastHarness />);

    await user.click(screen.getByRole('button', { name: 'Trigger toast' }));

    expect(await screen.findByTestId('toast-shell')).toHaveStyle({
      background: 'var(--ui-color-surface-canvas)',
    });
    expect(screen.getByRole('status')).toHaveTextContent('Project created successfully.');
  });
});
