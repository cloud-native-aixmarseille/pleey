import { motion } from 'motion/react';

export function LemmingParachute() {
  return (
    <motion.g
      animate={{ x: [0, 1, 0, -1, 0], rotate: [0, 2, 0, -2, 0] }}
      transition={{ duration: 0.42, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Canopy */}
      <path
        d="M1 -8 Q1 -16 9 -16 Q17 -16 17 -8 Z"
        fill="var(--ui-color-brand-accent)"
        opacity="0.7"
        stroke="var(--ui-color-border-subtle)"
        strokeWidth="0.5"
      />
      {/* Stripes */}
      <path d="M5 -15 L4 -8" opacity="0.25" stroke="#fff" strokeWidth="0.4" />
      <path d="M9 -16 L9 -8" opacity="0.25" stroke="#fff" strokeWidth="0.4" />
      <path d="M13 -15 L14 -8" opacity="0.25" stroke="#fff" strokeWidth="0.4" />
      {/* Lines */}
      <line
        stroke="var(--ui-color-text-secondary)"
        strokeWidth="0.4"
        x1="2"
        x2="5"
        y1="-8"
        y2="0"
      />
      <line
        stroke="var(--ui-color-text-secondary)"
        strokeWidth="0.4"
        x1="16"
        x2="13"
        y1="-8"
        y2="0"
      />
    </motion.g>
  );
}
