import { motion } from 'motion/react';

export function LemmingMouth({ talking }: { talking: boolean }) {
  if (talking) {
    return (
      <motion.ellipse
        animate={{ ry: [0.8, 1.5, 0.8] }}
        cx="9"
        cy="10.5"
        fill="var(--ui-color-text-emphasis)"
        rx="1.2"
        ry="0.8"
        transition={{ duration: 0.16, repeat: Infinity, ease: 'easeInOut' }}
      />
    );
  }

  return (
    <path
      d="M7.5 10 Q9 11.8 10.5 10"
      fill="none"
      stroke="var(--ui-color-text-emphasis)"
      strokeLinecap="round"
      strokeWidth="0.7"
    />
  );
}
