import { act, render } from '@testing-library/react';
import { frame } from 'motion/react';
import { describe, expect, it, vi } from 'vitest';
import { LemmingsFixtureFactory } from '../../../../../../test-utils/fixtures/lemmings-fixture-factory';
import { LemmingsPatienceAnimation } from './lemmings-patience-animation';

describe('LemmingsPatienceAnimation', () => {
  it('resets the shared simulation and spawn timing when unmounted', () => {
    // Arrange
    const { container, engine } = new LemmingsFixtureFactory().create();
    engine.step(1, 5_000, container);
    const view = render(<LemmingsPatienceAnimation container={container} engine={engine} />);

    // Act
    view.unmount();
    const restarted = engine.step(0, 0, container);

    // Assert
    expect(restarted).toHaveLength(1);
    expect(restarted[0]).toMatchObject({ mode: 'fall', emote: null, idleVariant: null, greetingVariant: null });
    expect(restarted[0]?.y).toBeLessThan(0);
  });

  it('stops advancing the engine after unmount', async () => {
    // Arrange
    const { container, engine } = new LemmingsFixtureFactory().create();
    const step = vi.spyOn(engine, 'step').mockReturnValue([]);
    const view = render(<LemmingsPatienceAnimation container={container} engine={engine} />);
    // Act + Assert
    try {
      await act(() => new Promise<void>((resolve) => frame.postRender(() => resolve())));
      const frameCount = step.mock.calls.length;

      // Act
      view.unmount();
      await act(() => new Promise<void>((resolve) => frame.postRender(() => resolve())));

      // Assert
      expect(frameCount).toBeGreaterThan(0);
      expect(step).toHaveBeenCalledTimes(frameCount);
    } finally {
      view.unmount();
      step.mockRestore();
    }
  });
});
