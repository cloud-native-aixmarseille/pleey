import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { usePresentationFeedbackChannel } from './use-presentation-feedback-channel';

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    addEventListener: vi.fn(),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches,
    media: query,
    onchange: null,
    removeEventListener: vi.fn(),
    removeListener: vi.fn(),
  }));
}

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
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders toast items on an opaque shell', async () => {
    const user = userEvent.setup();
    stubMatchMedia(false);

    renderWithUiProvider(<ToastHarness />);

    await user.click(screen.getByRole('button', { name: 'Trigger toast' }));

    expect(await screen.findByTestId('toast-shell')).toHaveStyle({
      background: 'var(--ui-color-surface-canvas)',
    });
    expect(screen.getByTestId('presentation-toast-viewport')).toHaveStyle({
      right: 'var(--mantine-spacing-lg)',
      top: 'var(--mantine-spacing-lg)',
    });
    expect(screen.getByRole('status')).toHaveTextContent('Project created successfully.');
  });

  it('anchors the toast viewport to the bottom of the screen on mobile', async () => {
    const user = userEvent.setup();
    stubMatchMedia(true);

    renderWithUiProvider(<ToastHarness />);

    await user.click(screen.getByRole('button', { name: 'Trigger toast' }));

    expect(await screen.findByTestId('presentation-toast-viewport')).toHaveStyle({
      bottom: 'max(var(--mantine-spacing-lg), env(safe-area-inset-bottom))',
      left: '50%',
      right: 'auto',
      top: 'auto',
      transform: 'translateX(-50%)',
    });
  });
});
