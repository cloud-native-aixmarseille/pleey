import { motion } from 'motion/react';
import type { IdleVariantConfig } from '../lemmings-idle-variant-registry';

export const bananaIdleConfig: IdleVariantConfig = {
  variant: 'banana',
  durationMs: 2_500,
  jitterMs: 0,
  emotes: null,
};

const peelStyle = {
  position: 'absolute',
  bottom: -2,
  right: -6,
  fontSize: 14,
  lineHeight: 1,
  pointerEvents: 'none',
} as const;

const exclamationStyle = {
  position: 'absolute',
  top: -18,
  left: 4,
  fontSize: 14,
  lineHeight: 1,
  fontWeight: 'bold',
  color: 'var(--ui-color-text-emphasis)',
  pointerEvents: 'none',
} as const;

const starStyle = {
  position: 'absolute',
  top: -8,
  left: 0,
  fontSize: 10,
  lineHeight: 1,
  pointerEvents: 'none',
} as const;

const dizzyStyle = {
  position: 'absolute',
  top: -6,
  right: -4,
  fontSize: 8,
  lineHeight: 1,
  pointerEvents: 'none',
} as const;

export function LemmingBanana() {
  return (
    <>
      {/* Banana peel on the ground – HTML overlay so emoji renders properly */}
      <motion.span
        animate={{ opacity: [0, 1, 1, 1, 1, 0.3] }}
        initial={{ opacity: 0 }}
        style={peelStyle}
        transition={{ duration: 2.3, times: [0, 0.08, 0.3, 0.6, 0.85, 1] }}
      >
        🍌
      </motion.span>
      {/* Exclamation on slip */}
      <motion.span
        animate={{ opacity: [0, 1, 1, 0, 0], y: [0, -4, -4, -4, -4] }}
        initial={{ opacity: 0 }}
        style={exclamationStyle}
        transition={{ duration: 2.3, times: [0, 0.08, 0.2, 0.3, 1] }}
      >
        ❗
      </motion.span>
      {/* Dizzy stars when fallen */}
      <motion.span
        animate={{
          opacity: [0, 0, 1, 1, 0],
          rotate: [0, 0, 0, 360, 360],
          y: [0, 0, 0, -6, -6],
        }}
        initial={{ opacity: 0 }}
        style={starStyle}
        transition={{ duration: 2.3, times: [0, 0.25, 0.35, 0.65, 0.8] }}
      >
        ⭐
      </motion.span>
      <motion.span
        animate={{
          opacity: [0, 0, 0.8, 0.8, 0],
          rotate: [0, 0, 0, -360, -360],
          y: [0, 0, 0, -4, -4],
        }}
        initial={{ opacity: 0 }}
        style={dizzyStyle}
        transition={{ duration: 2.3, times: [0, 0.3, 0.4, 0.7, 0.85] }}
      >
        💫
      </motion.span>
    </>
  );
}
