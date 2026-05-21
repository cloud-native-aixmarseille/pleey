import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../../../../test-utils/render-with-ui-provider';
import { StageCountdownTimer } from './stage-countdown-timer';

vi.mock('../../../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;

  return {
    ...actual,
    usePresentationTranslation: () => ({
      t: (key: string, options?: Record<string, unknown>) =>
        options
          ? `${key}:${Object.entries(options)
              .map(([optionKey, optionValue]) => `${optionKey}=${String(optionValue)}`)
              .join(',')}`
          : key,
    }),
  };
});

describe('StageCountdownTimer', () => {
  it('returns nothing when remaining duration is unknown', () => {
    renderWithUiProvider(
      <StageCountdownTimer
        isPaused={false}
        remainingDurationMs={null}
        testId="timer"
        totalDurationMs={10_000}
      />,
    );

    expect(screen.queryByTestId('timer')).not.toBeInTheDocument();
  });

  it('renders normal tone when more than half the time remains', () => {
    renderWithUiProvider(
      <StageCountdownTimer
        isPaused={false}
        remainingDurationMs={9_000}
        testId="timer"
        totalDurationMs={10_000}
      />,
    );

    const timer = screen.getByTestId('timer');

    expect(timer).toHaveAttribute('data-tone', 'normal');
    expect(timer).toHaveAttribute('aria-live', 'off');
    expect(timer).toHaveAttribute('role', 'group');
    expect(timer).toHaveTextContent('00:09');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('switches to warning tone when half the time or less remains', () => {
    renderWithUiProvider(
      <StageCountdownTimer
        isPaused={false}
        remainingDurationMs={20_000}
        testId="timer"
        totalDurationMs={60_000}
      />,
    );

    expect(screen.getByTestId('timer')).toHaveAttribute('data-tone', 'warning');
  });

  it('switches to critical tone in the final seconds', () => {
    renderWithUiProvider(
      <StageCountdownTimer
        isPaused={false}
        remainingDurationMs={3_000}
        testId="timer"
        totalDurationMs={60_000}
      />,
    );

    expect(screen.getByTestId('timer')).toHaveAttribute('data-tone', 'critical');
  });

  it('renders the expired tone and label when no time is left', () => {
    renderWithUiProvider(
      <StageCountdownTimer
        isPaused={false}
        remainingDurationMs={0}
        testId="timer"
        totalDurationMs={10_000}
      />,
    );

    const timer = screen.getByTestId('timer');

    expect(timer).toHaveAttribute('data-tone', 'expired');
    expect(timer).toHaveAccessibleName('game.party.route.runtimeTimeUp');
    expect(screen.getByRole('status')).toHaveTextContent('game.party.route.runtimeTimeUp');
  });

  it('announces paused state changes without turning the whole countdown into a live region', () => {
    renderWithUiProvider(
      <StageCountdownTimer
        isPaused
        remainingDurationMs={5_000}
        testId="timer"
        totalDurationMs={10_000}
      />,
    );

    expect(screen.getByTestId('timer')).toHaveAttribute('aria-live', 'off');
    expect(screen.getByRole('status')).toHaveTextContent('game.party.status.paused');
  });

  it('renders the paused tone while the party is paused', () => {
    renderWithUiProvider(
      <StageCountdownTimer
        isPaused
        remainingDurationMs={5_000}
        testId="timer"
        totalDurationMs={10_000}
      />,
    );

    expect(screen.getByTestId('timer')).toHaveAttribute('data-tone', 'paused');
  });
});
