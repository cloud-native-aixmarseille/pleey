import { act, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PatienceTestAppFactory } from '../../../../test-utils/patience-test-app-factory';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';

vi.mock('src/presentation/shared/i18n/use-presentation-translation', () => ({
  usePresentationTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('PatienceHost', () => {
  it('mounts the playground once at the host and exposes route-enabled patience state', async () => {
    // Arrange + Act
    renderWithUiProvider(new PatienceTestAppFactory().create(0).element);

    // Assert
    expect(document.querySelector('[data-patience-playground="true"]')).not.toBeNull();
    expect(await screen.findByTestId('patience-route-probe')).toHaveTextContent('true:true');
  });

  it('stops the animation on navigation even when the route component is reused', async () => {
    // Arrange
    vi.useFakeTimers();
    const { element, router } = new PatienceTestAppFactory().create();
    const view = renderWithUiProvider(element);
    // Act + Assert
    try {
      act(() => vi.advanceTimersByTime(1_000));
      act(() => vi.advanceTimersByTime(600));
      const previousAnimation = screen.getByTestId('patience-animation');
      const screenInput = screen.getByRole('textbox');

      // Act
      await act(() => router.navigate('/screens/second'));

      // Assert
      expect(previousAnimation).not.toBeInTheDocument();
      expect(screen.getByTestId('patience-route-probe')).toHaveTextContent('true:false');
      expect(screen.getByRole('textbox')).toBe(screenInput);
    } finally {
      view.unmount();
      vi.useRealTimers();
    }
  });

  it('restarts the idle and display delays when returning to a screen', async () => {
    // Arrange
    vi.useFakeTimers();
    const { element, router } = new PatienceTestAppFactory().create();
    const view = renderWithUiProvider(element);
    // Act + Assert
    try {
      act(() => vi.advanceTimersByTime(1_000));
      act(() => vi.advanceTimersByTime(600));
      const previousAnimation = screen.getByTestId('patience-animation');
      await act(() => router.navigate('/screens/second'));

      // Act
      await act(() => router.navigate(-1));
      act(() => vi.advanceTimersByTime(999));
      const beforeIdle = screen.queryByTestId('patience-animation');
      act(() => vi.advanceTimersByTime(1));
      act(() => vi.advanceTimersByTime(599));
      const beforeDisplay = screen.queryByTestId('patience-animation');
      act(() => vi.advanceTimersByTime(1));

      // Assert
      expect(beforeIdle).toBeNull();
      expect(beforeDisplay).toBeNull();
      expect(screen.getByTestId('patience-animation')).not.toBe(previousAnimation);
    } finally {
      view.unmount();
      vi.useRealTimers();
    }
  });

  it('cancels a pending animation when leaving a patience-enabled screen', async () => {
    // Arrange
    vi.useFakeTimers();
    const { element, router } = new PatienceTestAppFactory().create();
    const view = renderWithUiProvider(element);
    // Act + Assert
    try {
      act(() => vi.advanceTimersByTime(1_000));

      // Act
      await act(() => router.navigate('/outside'));
      act(() => vi.advanceTimersByTime(10_000));

      // Assert
      expect(screen.queryByTestId('patience-animation')).toBeNull();
      expect(screen.getByTestId('patience-route-probe')).toHaveTextContent('false:false');
    } finally {
      view.unmount();
      vi.useRealTimers();
    }
  });
});
