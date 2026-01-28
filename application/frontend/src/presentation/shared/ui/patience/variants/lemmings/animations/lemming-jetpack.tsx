import { motion } from 'framer-motion';
import type { IdleVariantConfig } from '../lemmings-idle-variant-registry';

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
      <motion.circle
        animate={{ opacity: [0, 0.4, 0], cy: [20, 28, 36], r: [0, 2.5, 5] }}
        cx="-0.5"
        fill="var(--ui-color-text-quiet)"
        initial={{ opacity: 0 }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
      />
      <motion.circle
        animate={{ opacity: [0, 0.3, 0], cy: [20, 26, 32], r: [0, 2, 4] }}
        cx="0.5"
        fill="var(--ui-color-text-quiet)"
        initial={{ opacity: 0 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut', delay: 0.9 }}
      />
      {/* Primary flame – ignites small then grows to full thrust */}
      <motion.ellipse
        animate={{ ry: [0, 1, 7, 5, 7, 5, 7], opacity: [0, 0.4, 1, 0.9, 1, 0.9, 1] }}
        cx="0"
        cy="16"
        fill="var(--ui-color-brand-accent)"
        initial={{ ry: 0, opacity: 0 }}
        rx="2"
        transition={{
          duration: 2.8,
          times: [0, 0.08, 0.22, 0.45, 0.6, 0.8, 1],
          ease: 'easeOut',
        }}
      />
      {/* Inner flame core */}
      <motion.ellipse
        animate={{ ry: [0, 0.5, 5, 3.5, 5, 3.5, 5], opacity: [0, 0.2, 1, 0.8, 1, 0.8, 1] }}
        cx="0"
        cy="15"
        fill="#fff"
        initial={{ ry: 0, opacity: 0 }}
        rx="1"
        transition={{
          duration: 2.8,
          times: [0, 0.08, 0.22, 0.45, 0.6, 0.8, 1],
          ease: 'easeOut',
        }}
      />
      {/* Flame sparks */}
      <motion.circle
        animate={{ cy: [16, 22, 28], opacity: [0, 0.8, 0], r: [0.3, 0.6, 0] }}
        cx="-1.5"
        fill="#FFA500"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.6, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
      />
      <motion.circle
        animate={{ cy: [16, 20, 26], opacity: [0, 0.7, 0], r: [0.2, 0.5, 0] }}
        cx="1.5"
        fill="#FFA500"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.5, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}
      />
    </g>
  );
}
