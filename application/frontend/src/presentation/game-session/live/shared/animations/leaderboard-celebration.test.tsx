import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LeaderboardCelebration } from './leaderboard-celebration';

vi.mock('../../../../shared/ui/patience/hooks/use-prefers-reduced-motion', () => ({
  usePrefersReducedMotion: vi.fn(() => false),
}));

describe('LeaderboardCelebration', () => {
  it('renders confetti particles', () => {
    const { container } = render(<LeaderboardCelebration />);

    const wrapper = container.querySelector('[aria-hidden="true"]');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.children.length).toBeGreaterThan(0);
  });

  it('renders nothing when reduced motion is preferred', async () => {
    const mod = await import('../../../../shared/ui/patience/hooks/use-prefers-reduced-motion');
    vi.mocked(mod.usePrefersReducedMotion).mockReturnValue(true);

    const { container } = render(<LeaderboardCelebration />);

    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();
  });
});
