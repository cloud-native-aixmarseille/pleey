import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface StageEntranceAnimationProps {
  readonly stageKey: string | number;
  readonly children: ReactNode;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.18 },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -24, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 22,
      mass: 0.8,
    },
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 220,
      damping: 24,
      mass: 0.9,
    },
  },
};

const glowVariants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: [0, 0.5, 0],
    scale: [0.6, 1.4, 1.6],
    transition: {
      duration: 0.9,
      ease: 'easeOut',
    },
  },
};

/**
 * Wraps stage content with a dramatic entrance animation.
 * Re-triggers when `stageKey` changes (new stage entering).
 */
export function StageEntranceAnimation({ stageKey, children }: StageEntranceAnimationProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stageKey}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{ display: 'contents' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/** Animate stage header elements (slide down + spring). */
StageEntranceAnimation.Header = function StageEntranceHeader({
  children,
}: {
  readonly children: ReactNode;
}) {
  return <motion.div variants={headerVariants}>{children}</motion.div>;
};

/** Animate stage body content (slide up + spring). */
StageEntranceAnimation.Content = function StageEntranceContent({
  children,
}: {
  readonly children: ReactNode;
}) {
  return <motion.div variants={contentVariants}>{children}</motion.div>;
};

/** Decorative neon glow burst on stage entrance. */
StageEntranceAnimation.GlowBurst = function StageEntranceGlow() {
  return (
    <motion.div
      variants={glowVariants}
      aria-hidden="true"
      style={{
        background:
          'radial-gradient(circle, rgba(30,232,215,0.25) 0%, rgba(255,79,163,0.15) 50%, transparent 70%)',
        borderRadius: '50%',
        height: '20rem',
        left: '50%',
        pointerEvents: 'none',
        position: 'absolute',
        top: '30%',
        transform: 'translate(-50%, -50%)',
        width: '20rem',
        zIndex: 0,
      }}
    />
  );
};
