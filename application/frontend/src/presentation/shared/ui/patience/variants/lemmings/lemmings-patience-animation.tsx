import { useAnimationFrame } from 'motion/react';
import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '../../hooks/use-prefers-reduced-motion';
import { LemmingSprite } from './animations';
import { type LemmingSnapshot, LemmingsPatienceEngine } from './lemmings-patience-engine';

const layerStyle = { position: 'absolute', inset: 0 } as const;

export function LemmingsPatienceAnimation({
  container,
  engine,
}: {
  container: HTMLElement | null;
  engine: LemmingsPatienceEngine;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [lemmings, setLemmings] = useState<Array<LemmingSnapshot>>([]);

  useEffect(() => {
    engine.syncContainer(container);
  }, [container, engine]);

  useAnimationFrame((time, delta) => {
    if (!container || prefersReducedMotion) {
      if (lemmings.length > 0) {
        setLemmings([]);
      }

      return;
    }

    setLemmings(engine.step(delta / 1000, time, container));
  });

  if (!container || prefersReducedMotion) {
    return null;
  }

  return (
    <div aria-hidden="true" style={layerStyle}>
      {lemmings.map((lemming) => (
        <LemmingSprite key={lemming.id} lemming={lemming} />
      ))}
    </div>
  );
}
