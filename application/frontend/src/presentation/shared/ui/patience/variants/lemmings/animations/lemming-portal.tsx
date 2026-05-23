import { motion } from 'motion/react';
import type { IdleVariantConfig } from '../lemmings-idle-variant-registry';

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
      <motion.ellipse
        animate={{
          rx: [0, 12, 11, 12, 3, 0],
          ry: [0, 5, 4.5, 5, 1, 0],
          opacity: [0, 0.9, 0.7, 0.9, 0.4, 0],
        }}
        cx="9"
        cy="20"
        fill="none"
        initial={{ rx: 0, ry: 0, opacity: 0 }}
        stroke="var(--ui-color-brand-accent)"
        strokeWidth="1.5"
        transition={{ duration: 1.8, times: [0, 0.25, 0.5, 0.65, 0.88, 1], ease: 'easeOut' }}
      />
      {/* Middle ring */}
      <motion.ellipse
        animate={{
          rx: [0, 9, 8, 9, 2, 0],
          ry: [0, 3.5, 3, 3.5, 0.8, 0],
          opacity: [0, 0.6, 0.4, 0.6, 0.3, 0],
        }}
        cx="9"
        cy="20"
        fill="none"
        initial={{ rx: 0, ry: 0, opacity: 0 }}
        stroke="var(--ui-color-brand-primary)"
        strokeWidth="0.8"
        transition={{ duration: 1.8, times: [0, 0.3, 0.55, 0.7, 0.9, 1], ease: 'easeOut' }}
      />
      {/* Inner vortex glow */}
      <motion.ellipse
        animate={{
          rx: [0, 7, 6, 7, 1.5, 0],
          ry: [0, 2.5, 2, 2.5, 0.5, 0],
          opacity: [0, 0.45, 0.25, 0.45, 0.2, 0],
        }}
        cx="9"
        cy="20"
        fill="var(--ui-color-brand-accent)"
        initial={{ rx: 0, ry: 0, opacity: 0 }}
        transition={{ duration: 1.8, times: [0, 0.3, 0.55, 0.7, 0.9, 1], ease: 'easeOut' }}
      />
      {/* Swirling energy particles */}
      <motion.circle
        animate={{
          cx: [9, 3, 15, 9],
          cy: [20, 17, 17, 14],
          opacity: [0, 0.8, 0.6, 0],
        }}
        fill="var(--ui-color-brand-accent)"
        initial={{ opacity: 0 }}
        r="1.2"
        transition={{ duration: 1.8, times: [0.25, 0.5, 0.7, 0.9], ease: 'easeIn' }}
      />
      <motion.circle
        animate={{
          cx: [9, 15, 3, 9],
          cy: [20, 18, 18, 13],
          opacity: [0, 0.6, 0.5, 0],
        }}
        fill="var(--ui-color-brand-primary)"
        initial={{ opacity: 0 }}
        r="0.9"
        transition={{ duration: 1.8, times: [0.3, 0.55, 0.75, 0.95], ease: 'easeIn' }}
      />
    </g>
  );
}
