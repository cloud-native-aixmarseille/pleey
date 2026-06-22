import type { MotionProps, Transition } from 'motion/react';
import { motion } from 'motion/react';
import type { IdleVariantConfig } from '../lemmings-idle-variant-registry';

interface PortalRingProps {
  readonly animate: MotionProps['animate'];
  readonly fill: string;
  readonly initial: MotionProps['initial'];
  readonly stroke?: string;
  readonly strokeWidth?: string;
  readonly transition: Transition;
}

interface PortalParticleProps {
  readonly animate: MotionProps['animate'];
  readonly fill: string;
  readonly transition: Transition;
}

const portalRings: readonly PortalRingProps[] = [
  {
    animate: {
      rx: [0, 12, 11, 12, 3, 0],
      ry: [0, 5, 4.5, 5, 1, 0],
      opacity: [0, 0.9, 0.7, 0.9, 0.4, 0],
    },
    fill: 'none',
    initial: { rx: 0, ry: 0, opacity: 0 },
    stroke: 'var(--ui-color-brand-accent)',
    strokeWidth: '1.5',
    transition: {
      duration: 1.8,
      ease: 'easeOut',
      times: [0, 0.25, 0.5, 0.65, 0.88, 1],
    },
  },
  {
    animate: {
      rx: [0, 9, 8, 9, 2, 0],
      ry: [0, 3.5, 3, 3.5, 0.8, 0],
      opacity: [0, 0.6, 0.4, 0.6, 0.3, 0],
    },
    fill: 'none',
    initial: { rx: 0, ry: 0, opacity: 0 },
    stroke: 'var(--ui-color-brand-primary)',
    strokeWidth: '0.8',
    transition: {
      duration: 1.8,
      ease: 'easeOut',
      times: [0, 0.3, 0.55, 0.7, 0.9, 1],
    },
  },
  {
    animate: {
      rx: [0, 7, 6, 7, 1.5, 0],
      ry: [0, 2.5, 2, 2.5, 0.5, 0],
      opacity: [0, 0.45, 0.25, 0.45, 0.2, 0],
    },
    fill: 'var(--ui-color-brand-accent)',
    initial: { rx: 0, ry: 0, opacity: 0 },
    transition: {
      duration: 1.8,
      ease: 'easeOut',
      times: [0, 0.3, 0.55, 0.7, 0.9, 1],
    },
  },
];

const portalParticles: readonly PortalParticleProps[] = [
  {
    animate: {
      cx: [9, 3, 15, 9],
      cy: [20, 17, 17, 14],
      opacity: [0, 0.8, 0.6, 0],
    },
    fill: 'var(--ui-color-brand-accent)',
    transition: { duration: 1.8, ease: 'easeIn', times: [0.25, 0.5, 0.7, 0.9] },
  },
  {
    animate: {
      cx: [9, 15, 3, 9],
      cy: [20, 18, 18, 13],
      opacity: [0, 0.6, 0.5, 0],
    },
    fill: 'var(--ui-color-brand-primary)',
    transition: { duration: 1.8, ease: 'easeIn', times: [0.3, 0.55, 0.75, 0.95] },
  },
];

function PortalRing({ animate, fill, initial, stroke, strokeWidth, transition }: PortalRingProps) {
  return (
    <motion.ellipse
      animate={animate}
      cx="9"
      cy="20"
      fill={fill}
      initial={initial}
      stroke={stroke}
      strokeWidth={strokeWidth}
      transition={transition}
    />
  );
}

function PortalParticle({ animate, fill, transition }: PortalParticleProps) {
  return (
    <motion.circle
      animate={animate}
      fill={fill}
      initial={{ opacity: 0 }}
      r="1.2"
      transition={transition}
    />
  );
}

export const portalIdleConfig: IdleVariantConfig = {
  variant: 'portal',
  durationMs: 2_000,
  jitterMs: 0,
  emotes: null,
};

export function LemmingPortal() {
  return (
    <g>
      {/* Outer energy ring – spawns from nothing and grows */}
      {portalRings.map((ring, index) => (
        <PortalRing
          animate={ring.animate}
          fill={ring.fill}
          initial={ring.initial}
          key={`${ring.fill}-${index}`}
          stroke={ring.stroke}
          strokeWidth={ring.strokeWidth}
          transition={ring.transition}
        />
      ))}
      {/* Swirling energy particles */}
      {portalParticles.map((particle, index) => (
        <PortalParticle
          animate={particle.animate}
          fill={particle.fill}
          key={`${particle.fill}-${index}`}
          transition={particle.transition}
        />
      ))}
    </g>
  );
}
