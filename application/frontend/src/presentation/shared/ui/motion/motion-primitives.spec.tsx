import { act, screen } from '@testing-library/react';
import { frame } from 'motion/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import {
  MotionFadeIn,
  MotionListItem,
  MotionPop,
  MotionScreenTransition,
  MotionStagger,
  MotionStaggerItem,
} from './motion-primitives';
import { usePrefersReducedMotion } from './use-prefers-reduced-motion';

vi.mock('./use-prefers-reduced-motion', () => ({
  usePrefersReducedMotion: vi.fn(() => false),
}));

describe('motion-primitives', () => {
  it('renders MotionFadeIn content', () => {
    // Arrange + Act
    renderWithUiProvider(
      <MotionFadeIn testId="fade-in">
        <span>Fade content</span>
      </MotionFadeIn>,
    );

    // Assert
    expect(screen.getByTestId('fade-in')).toBeInTheDocument();
    expect(screen.getByText('Fade content')).toBeInTheDocument();
  });

  it('renders MotionStagger and MotionStaggerItem content', () => {
    // Arrange + Act
    renderWithUiProvider(
      <MotionStagger testId="stagger-root">
        <MotionStaggerItem testId="stagger-item">
          <span>Stagger content</span>
        </MotionStaggerItem>
      </MotionStagger>,
    );

    // Assert
    expect(screen.getByTestId('stagger-root')).toBeInTheDocument();
    expect(screen.getByTestId('stagger-item')).toBeInTheDocument();
    expect(screen.getByText('Stagger content')).toBeInTheDocument();
  });

  it('renders MotionScreenTransition content', () => {
    // Arrange + Act
    renderWithUiProvider(
      <MotionScreenTransition sectionKey="details">
        <span>Screen content</span>
      </MotionScreenTransition>,
    );

    // Assert
    expect(screen.getByText('Screen content')).toBeInTheDocument();
  });

  it.each([
    {
      name: 'preserves the initial delay and spacing between child reveals',
      reducedMotion: false,
      expected: [
        ['0', '0'],
        ['1', '0'],
        ['1', '1'],
      ],
    },
    {
      name: 'shows children immediately when reduced motion is preferred',
      reducedMotion: true,
      expected: [
        ['1', '1'],
        ['1', '1'],
        ['1', '1'],
      ],
    },
  ])('$name', async ({ reducedMotion, expected }) => {
    // Arrange
    const startTime = performance.now();
    const clock = vi.spyOn(performance, 'now').mockReturnValue(startTime);
    vi.mocked(usePrefersReducedMotion).mockReturnValue(reducedMotion);
    const snapshots: string[][] = [];

    try {
      // Act
      renderWithUiProvider(
        <MotionStagger initialDelay={0.5} staggerDelay={0.5}>
          <MotionStaggerItem duration={0} testId="first-child">
            First
          </MotionStaggerItem>
          <MotionStaggerItem duration={0} testId="second-child">
            Second
          </MotionStaggerItem>
        </MotionStagger>,
      );
      await act(async () => {
        await new Promise<void>((resolve) => frame.postRender(() => resolve()));
      });
      for (const elapsed of [250, 750, 1250]) {
        clock.mockReturnValue(startTime + elapsed);
        await act(async () => {
          await new Promise<void>((resolve) => frame.postRender(() => resolve()));
        });
        snapshots.push([
          screen.getByTestId('first-child').style.opacity,
          screen.getByTestId('second-child').style.opacity,
        ]);
      }

      // Assert
      expect(snapshots).toEqual(expected);
    } finally {
      clock.mockRestore();
      vi.mocked(usePrefersReducedMotion).mockReturnValue(false);
    }
  });

  it('renders MotionPop and MotionListItem content', () => {
    // Arrange + Act
    renderWithUiProvider(
      <>
        <MotionPop>
          <span>Pop content</span>
        </MotionPop>
        <MotionListItem>
          <span>List content</span>
        </MotionListItem>
      </>,
    );

    // Assert
    expect(screen.getByText('Pop content')).toBeInTheDocument();
    expect(screen.getByText('List content')).toBeInTheDocument();
  });
});
