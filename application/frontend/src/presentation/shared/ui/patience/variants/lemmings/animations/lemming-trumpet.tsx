import { motion } from 'motion/react';
import type { IdleVariantConfig } from '../lemmings-idle-variant-registry';

export const trumpetIdleConfig: IdleVariantConfig = {
  variant: 'trumpet',
  durationMs: 700,
  jitterMs: 700,
  emotes: null,
};

export function LemmingTrumpet() {
  return (
    <g>
      {/* Horn body */}
      <motion.g
        animate={{ rotate: [-4, 4, -4] }}
        style={{ originX: '14px', originY: '8px' }}
        transition={{ duration: 0.26, repeat: Infinity, ease: 'easeInOut' }}
      >
        <rect fill="var(--ui-color-text-quiet)" height="2.5" rx="0.5" width="6" x="14" y="7" />
        <path d="M20 6 L22 4.5 L22 11.5 L20 10 Z" fill="var(--ui-color-text-quiet)" />
      </motion.g>
      {/* Musical notes */}
      <motion.text
        animate={{ opacity: [0, 1, 0], y: [-2, -8] }}
        fill="var(--ui-color-text-secondary)"
        fontSize="6"
        transition={{ duration: 0.9, repeat: Infinity, ease: 'easeOut' }}
        x="22"
        y="2"
      >
        ♪
      </motion.text>
    </g>
  );
}
