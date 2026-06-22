import type { MotionProps, Transition } from 'motion/react';
import { motion } from 'motion/react';
import type { IdleVariantConfig } from '../lemmings-idle-variant-registry';

interface JetpackParticleProps {
  readonly animate: MotionProps['animate'];
  readonly cx: string;
  readonly cy: string;
  readonly fill: string;
  readonly initial: MotionProps['initial'];
  readonly kind: 'circle' | 'ellipse';
  readonly rx?: string;
  readonly transition: Transition;
}

const exhaustSmokeParticles: readonly JetpackParticleProps[] = [
  {
    animate: { opacity: [0, 0.4, 0], cy: [20, 28, 36], r: [0, 2.5, 5] },
    cx: '-0.5',
    cy: '20',
    fill: 'var(--ui-color-text-quiet)',
    initial: { opacity: 0 },
    kind: 'circle',
    transition: { delay: 0.4, duration: 1.4, ease: 'easeOut', repeat: Infinity },
  },
  {
    animate: { opacity: [0, 0.3, 0], cy: [20, 26, 32], r: [0, 2, 4] },
    cx: '0.5',
    cy: '20',
    fill: 'var(--ui-color-text-quiet)',
    initial: { opacity: 0 },
    kind: 'circle',
    transition: { delay: 0.9, duration: 1.2, ease: 'easeOut', repeat: Infinity },
  },
];

const flamePlumes: readonly JetpackParticleProps[] = [
  {
    animate: { ry: [0, 1, 7, 5, 7, 5, 7], opacity: [0, 0.4, 1, 0.9, 1, 0.9, 1] },
    cx: '0',
    cy: '16',
    fill: 'var(--ui-color-brand-accent)',
    initial: { opacity: 0, ry: 0 },
    kind: 'ellipse',
    rx: '2',
    transition: {
      duration: 2.8,
      ease: 'easeOut',
      times: [0, 0.08, 0.22, 0.45, 0.6, 0.8, 1],
    },
  },
  {
    animate: { ry: [0, 0.5, 5, 3.5, 5, 3.5, 5], opacity: [0, 0.2, 1, 0.8, 1, 0.8, 1] },
    cx: '0',
    cy: '15',
    fill: '#fff',
    initial: { opacity: 0, ry: 0 },
    kind: 'ellipse',
    rx: '1',
    transition: {
      duration: 2.8,
      ease: 'easeOut',
      times: [0, 0.08, 0.22, 0.45, 0.6, 0.8, 1],
    },
  },
];

const flameSparks: readonly JetpackParticleProps[] = [
  {
    animate: { cy: [16, 22, 28], opacity: [0, 0.8, 0], r: [0.3, 0.6, 0] },
    cx: '-1.5',
    cy: '16',
    fill: '#FFA500',
    initial: { opacity: 0 },
    kind: 'circle',
    transition: { delay: 0.5, duration: 0.6, ease: 'easeOut', repeat: Infinity },
  },
  {
    animate: { cy: [16, 20, 26], opacity: [0, 0.7, 0], r: [0.2, 0.5, 0] },
    cx: '1.5',
    cy: '16',
    fill: '#FFA500',
    initial: { opacity: 0 },
    kind: 'circle',
    transition: { delay: 0.8, duration: 0.5, ease: 'easeOut', repeat: Infinity },
  },
];

function JetpackParticle({
  animate,
  cx,
  cy,
  fill,
  initial,
  kind,
  rx,
  transition,
}: JetpackParticleProps) {
  if (kind === 'ellipse') {
    return (
      <motion.ellipse
        animate={animate}
        cx={cx}
        cy={cy}
        fill={fill}
        initial={initial}
        rx={rx}
        transition={transition}
      />
    );
  }

  return (
    <motion.circle
      animate={animate}
      cx={cx}
      fill={fill}
      initial={initial}
      transition={transition}
    />
  );
}

export const jetpackIdleConfig: IdleVariantConfig = {
  variant: 'jetpack',
  durationMs: 5_500,
  jitterMs: 0,
  emotes: null,
};

export function LemmingJetpack() {
  return (
    <g>
      {/* Pack body */}
      <rect fill="var(--ui-color-text-secondary)" height="6" rx="1" width="4" x="-2" y="5" />
      {/* Nozzle */}
      <rect fill="var(--ui-color-text-quiet)" height="2" rx="0.5" width="3" x="-1.5" y="11" />
      {/* Exhaust smoke puffs */}
      {exhaustSmokeParticles.map((particle) => (
        <JetpackParticle {...particle} key={`${particle.kind}-${particle.cx}-${particle.cy}`} />
      ))}
      {/* Primary flame – ignites small then grows to full thrust */}
      {flamePlumes.map((particle) => (
        <JetpackParticle
          {...particle}
          key={`${particle.kind}-${particle.cx}-${particle.cy}-${particle.fill}`}
        />
      ))}
      {/* Inner flame core */}
      {/* Flame sparks */}
      {flameSparks.map((particle) => (
        <JetpackParticle
          {...particle}
          key={`${particle.kind}-${particle.cx}-${particle.cy}-${particle.transition.delay ?? 0}`}
        />
      ))}
    </g>
  );
}
