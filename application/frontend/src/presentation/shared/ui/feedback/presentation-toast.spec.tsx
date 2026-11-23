import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
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
  function resetGlobals() {
    vi.unstubAllGlobals();
  }

  it('renders toast items on an opaque shell', async () => {
    // Arrange
    const user = userEvent.setup();
    stubMatchMedia(false);

    // Act + Assert
    try {
      renderWithUiProvider(<ToastHarness />);

      // Act
      await user.click(screen.getByRole('button', { name: 'Trigger toast' }));

      // Assert
      const toast = await screen.findByTestId('toast-shell');
      // jsdom does not resolve CSS variables in the computed background shorthand.
      expect(toast.style.background).toBe('var(--ui-color-surface-canvas)');
      const viewport = screen.getByTestId('presentation-toast-viewport');
      expect(viewport.style.right).toBe('var(--mantine-spacing-lg)');
      expect(viewport.style.top).toBe('var(--mantine-spacing-lg)');
      expect(screen.getByRole('status')).toHaveTextContent('Project created successfully.');
    } finally {
      resetGlobals();
    }
  });

  it('anchors the toast viewport to the bottom of the screen on mobile', async () => {
    // Arrange
    const user = userEvent.setup();
    // Act
    stubMatchMedia(true);

    // Assert
    try {
      renderWithUiProvider(<ToastHarness />);

      await user.click(screen.getByRole('button', { name: 'Trigger toast' }));

      const viewport = await screen.findByTestId('presentation-toast-viewport');
      expect(viewport.style.bottom).toBe('max(var(--mantine-spacing-lg), env(safe-area-inset-bottom))');
      expect(viewport.style.left).toBe('50%');
      expect(viewport.style.right).toBe('auto');
      expect(viewport.style.top).toBe('auto');
      expect(viewport.style.transform).toBe('translateX(-50%)');
    } finally {
      resetGlobals();
    }
  });
});
