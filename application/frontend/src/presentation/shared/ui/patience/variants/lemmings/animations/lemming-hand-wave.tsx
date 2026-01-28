import { motion } from 'framer-motion';

export function LemmingHandWave() {
  return (
    <>
      {/* Left hand relaxed at side */}
      <circle cx="1" cy="10" fill="var(--ui-color-surface-panel)" r="1.8" />
      {/* Right arm raised high, waving wide arc */}
      <motion.g
        animate={{ rotate: [-35, 25, -35] }}
        style={{ originX: '14px', originY: '6px' }}
        transition={{ duration: 0.45, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Upper arm */}
        <rect fill="var(--ui-color-surface-panel)" height="2.2" rx="1" width="7" x="14" y="-1" />
        {/* Hand (large open palm) */}
        <circle cx="21" cy="0" fill="var(--ui-color-surface-panel)" r="2.8" />
        {/* Fingers spread for visibility */}
        <rect
          fill="var(--ui-color-surface-panel)"
          height="2.8"
          rx="0.4"
          width="0.9"
          x="19"
          y="-3"
        />
        <rect
          fill="var(--ui-color-surface-panel)"
          height="3.2"
          rx="0.4"
          width="0.9"
          x="20.5"
          y="-3.4"
        />
        <rect
          fill="var(--ui-color-surface-panel)"
          height="2.8"
          rx="0.4"
          width="0.9"
          x="22"
          y="-3"
        />
      </motion.g>
    </>
  );
}
