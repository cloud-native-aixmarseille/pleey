import { motion } from 'framer-motion';

export function LemmingHandHighFive() {
  return (
    <>
      {/* Left arm at rest */}
      <circle cx="1" cy="10" fill="var(--ui-color-surface-panel)" r="1.8" />
      {/* Right arm reaching up and out for high-five */}
      <motion.g
        animate={{ rotate: [0, 0, -70, -70, 0] }}
        style={{ originX: '14px', originY: '8px' }}
        transition={{ duration: 1, times: [0, 0.15, 0.3, 0.7, 0.9], ease: 'easeInOut' }}
      >
        {/* Forearm */}
        <motion.rect
          animate={{ opacity: [0, 0, 1, 1, 0], width: [0, 0, 8, 8, 0] }}
          fill="var(--ui-color-surface-panel)"
          height="2.2"
          rx="1"
          width="8"
          x="14"
          y="3"
          transition={{ duration: 1, times: [0, 0.12, 0.28, 0.72, 0.92] }}
        />
        {/* Open palm */}
        <motion.circle
          animate={{ opacity: [0, 0, 1, 1.2, 0], scale: [0, 0, 1, 1.2, 0] }}
          cx="22"
          cy="4"
          fill="var(--ui-color-surface-panel)"
          r="2.8"
          transition={{ duration: 1, times: [0, 0.12, 0.28, 0.35, 0.92] }}
        />
        {/* Fingers spread open */}
        <motion.g
          animate={{ opacity: [0, 0, 1, 1, 0] }}
          transition={{ duration: 1, times: [0, 0.2, 0.3, 0.7, 0.9] }}
        >
          <rect
            fill="var(--ui-color-surface-panel)"
            height="3"
            rx="0.4"
            width="0.9"
            x="19.5"
            y="1"
          />
          <rect
            fill="var(--ui-color-surface-panel)"
            height="3.5"
            rx="0.4"
            width="0.9"
            x="21"
            y="0.5"
          />
          <rect
            fill="var(--ui-color-surface-panel)"
            height="3.2"
            rx="0.4"
            width="0.9"
            x="22.5"
            y="0.8"
          />
          <rect
            fill="var(--ui-color-surface-panel)"
            height="2.8"
            rx="0.4"
            width="0.9"
            x="24"
            y="1.5"
          />
        </motion.g>
      </motion.g>
      {/* Impact flash at the slap point */}
      <motion.g
        animate={{ opacity: [0, 0, 1, 0, 0], scale: [0, 0, 1.5, 2, 0] }}
        transition={{ duration: 1, times: [0, 0.28, 0.34, 0.45, 0.55] }}
      >
        <circle cx="24" cy="0" fill="var(--ui-color-brand-accent)" r="3" />
        <line
          stroke="var(--ui-color-brand-accent)"
          strokeWidth="0.8"
          x1="24"
          x2="24"
          y1="-4"
          y2="-7"
        />
        <line
          stroke="var(--ui-color-brand-accent)"
          strokeWidth="0.8"
          x1="28"
          x2="31"
          y1="0"
          y2="0"
        />
        <line
          stroke="var(--ui-color-brand-accent)"
          strokeWidth="0.8"
          x1="26"
          x2="28"
          y1="-3"
          y2="-5"
        />
        <line
          stroke="var(--ui-color-brand-accent)"
          strokeWidth="0.8"
          x1="26"
          x2="28"
          y1="3"
          y2="5"
        />
      </motion.g>
    </>
  );
}
