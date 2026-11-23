import { act, fireEvent, renderHook, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { usePresentationFeedbackChannel } from './use-presentation-feedback-channel';

function FeedbackChannelNotificationHarness() {
  const feedback = usePresentationFeedbackChannel();

  return (
    <button
      onClick={() => {
        feedback.handleError(
          { reason: 'unexpected' },
          {
            fallbackMessage: 'fallback.error',
            id: 'feedback-channel-error-toast',
            notify: true,
          },
        );
      }}
      type="button"
    >
      Trigger error
    </button>
  );
}

describe('usePresentationFeedbackChannel', () => {
  it('starts with no error message', () => {
    // Arrange + Act
    const { result } = renderHook(() => usePresentationFeedbackChannel());

    // Assert
    expect(result.current.errorMessage).toBeNull();
  });

  it('sets a resolved error message from Error inputs', () => {
    // Arrange
    const { result } = renderHook(() => usePresentationFeedbackChannel());

    // Act
    act(() => {
      result.current.handleError(new Error('Failed to submit'), {
        fallbackMessage: 'fallback.error',
      });
    });

    // Assert
    expect(result.current.errorMessage).toBe('Failed to submit');
  });

  it('uses the fallback error message for unknown errors', () => {
    // Arrange
    const { result } = renderHook(() => usePresentationFeedbackChannel());

    // Act
    act(() => {
      result.current.handleError(
        { reason: 'unexpected' },
        {
          fallbackMessage: 'fallback.error',
        },
      );
    });

    // Assert
    expect(result.current.errorMessage).toBe('fallback.error');
  });

  it('clears error state when clearError is called', () => {
    // Arrange
    const { result } = renderHook(() => usePresentationFeedbackChannel());

    act(() => {
      result.current.handleError(new Error('Failed to submit'), {
        fallbackMessage: 'fallback.error',
      });
    });

    // Act
    act(() => {
      result.current.clearError();
    });

    // Assert
    expect(result.current.errorMessage).toBeNull();
  });

  it('dispatches a toast notification when notify is enabled and provider is present', () => {
    // Arrange
    renderWithUiProvider(<FeedbackChannelNotificationHarness />);
    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Trigger error' }));

    // Assert
    expect(screen.getByTestId('feedback-channel-error-toast')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('fallback.error');
  });
});
