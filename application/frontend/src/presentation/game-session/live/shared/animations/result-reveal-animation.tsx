import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ResultRevealAnimationProps {
  readonly children: ReactNode;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const bannerVariants = {
  hidden: { opacity: 0, scale: 0.75, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 18,
      mass: 0.7,
    },
  },
};

const barVariants = {
  hidden: { opacity: 0, x: -30, scaleX: 0.3 },
  visible: {
    opacity: 1,
    x: 0,
    scaleX: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
      mass: 0.6,
    },
  },
};

const scorePopVariants = {
  hidden: { opacity: 0, scale: 0, y: 10 },
  visible: {
    opacity: 1,
    scale: [0, 1.25, 1],
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
};

/**
 * Wraps stage result content with staggered reveal animations.
 * The banner pops in, then distribution bars slide in sequentially.
 */
export function ResultRevealAnimation({ children }: ResultRevealAnimationProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ display: 'contents' }}
    >
      {children}
    </motion.div>
  );
}

/** Animate the result banner (correct/incorrect) with a pop-in effect. */
ResultRevealAnimation.Banner = function ResultRevealBanner({
  children,
}: {
  readonly children: ReactNode;
}) {
  return <motion.div variants={bannerVariants}>{children}</motion.div>;
};

/** Animate a distribution bar sliding in from the left. */
ResultRevealAnimation.Bar = function ResultRevealBar({
  children,
}: {
  readonly children: ReactNode;
}) {
  return <motion.div variants={barVariants}>{children}</motion.div>;
};

/** Animate the score/points with a pop effect. */
ResultRevealAnimation.Score = function ResultRevealScore({
  children,
}: {
  readonly children: ReactNode;
}) {
  return <motion.div variants={scorePopVariants}>{children}</motion.div>;
};
