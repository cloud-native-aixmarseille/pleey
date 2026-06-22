import type { MotionProps, Transition } from 'motion/react';
import { motion } from 'motion/react';
import type { IdleVariantConfig } from '../lemmings-idle-variant-registry';

const trumpetOscillation: MotionProps['animate'] = { rotate: [-4, 4, -4] };
const trumpetOriginStyle = { originX: '14px', originY: '8px' } as const;
const trumpetOscillationTransition: Transition = {
  duration: 0.26,
  ease: 'easeInOut',
  repeat: Infinity,
};
const musicalNoteAnimation: MotionProps['animate'] = { opacity: [0, 1, 0], y: [-2, -8] };
const musicalNoteTransition: Transition = { duration: 0.9, ease: 'easeOut', repeat: Infinity };

function TrumpetHorn() {
  return (
    <motion.g
      animate={trumpetOscillation}
      style={trumpetOriginStyle}
      transition={trumpetOscillationTransition}
    >
      <rect fill="var(--ui-color-text-quiet)" height="2.5" rx="0.5" width="6" x="14" y="7" />
      <path d="M20 6 L22 4.5 L22 11.5 L20 10 Z" fill="var(--ui-color-text-quiet)" />
    </motion.g>
  );
}

function TrumpetNote() {
  return (
    <motion.text
      animate={musicalNoteAnimation}
      fill="var(--ui-color-text-secondary)"
      fontSize="6"
      transition={musicalNoteTransition}
      x="22"
      y="2"
    >
      ♪
    </motion.text>
  );
}

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
      <TrumpetHorn />
      {/* Musical notes */}
      <TrumpetNote />
    </g>
  );
}
