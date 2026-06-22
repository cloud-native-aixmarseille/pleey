import { screen } from '@testing-library/react';
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

vi.mock('./use-prefers-reduced-motion', () => ({
  usePrefersReducedMotion: () => false,
}));

describe('motion-primitives', () => {
  it('renders MotionFadeIn content', () => {
    renderWithUiProvider(
      <MotionFadeIn testId="fade-in">
        <span>Fade content</span>
      </MotionFadeIn>,
    );

    expect(screen.getByTestId('fade-in')).toBeInTheDocument();
    expect(screen.getByText('Fade content')).toBeInTheDocument();
  });

  it('renders MotionStagger and MotionStaggerItem content', () => {
    renderWithUiProvider(
      <MotionStagger testId="stagger-root">
        <MotionStaggerItem testId="stagger-item">
          <span>Stagger content</span>
        </MotionStaggerItem>
      </MotionStagger>,
    );

    expect(screen.getByTestId('stagger-root')).toBeInTheDocument();
    expect(screen.getByTestId('stagger-item')).toBeInTheDocument();
    expect(screen.getByText('Stagger content')).toBeInTheDocument();
  });

  it('renders MotionScreenTransition content', () => {
    renderWithUiProvider(
      <MotionScreenTransition sectionKey="details">
        <span>Screen content</span>
      </MotionScreenTransition>,
    );

    expect(screen.getByText('Screen content')).toBeInTheDocument();
  });

  it('renders MotionPop and MotionListItem content', () => {
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

    expect(screen.getByText('Pop content')).toBeInTheDocument();
    expect(screen.getByText('List content')).toBeInTheDocument();
  });
});
