import { motion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';

interface LeaderboardRevealAnimationProps {
  readonly children: ReactNode;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.15,
    },
  },
};

const heroVariants = {
  hidden: { opacity: 0, y: -30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
      mass: 0.8,
    },
  },
};

const trophyVariants = {
  hidden: { opacity: 0, scale: 0, rotate: -30 },
  visible: {
    opacity: 1,
    scale: [0, 1.3, 1],
    rotate: [-30, 8, 0],
    transition: {
      duration: 0.7,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -24, scaleX: 0.96 },
  visible: {
    opacity: 1,
    x: 0,
    scaleX: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 24,
    },
  },
};

const playerBarVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 240,
      damping: 20,
      delay: 0.3,
    },
  },
};

const ctaVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 22,
      delay: 1.8,
    },
  },
};

/**
 * Leaderboard reveal animation with dramatic staggered entrances.
 * Trophy pops in with rotation, podium columns rise, rows slide in.
 */
export function LeaderboardRevealAnimation({ children }: LeaderboardRevealAnimationProps) {
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

/** Hero header area with scale + slide-down spring. */
LeaderboardRevealAnimation.Hero = function LeaderboardRevealHero({
  children,
}: {
  readonly children: ReactNode;
}) {
  return <motion.div variants={heroVariants}>{children}</motion.div>;
};

/** Trophy icon with pop + rotation bounce. */
LeaderboardRevealAnimation.Trophy = function LeaderboardRevealTrophy({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <motion.div variants={trophyVariants} style={{ display: 'inline-flex' }}>
      {children}
    </motion.div>
  );
};

/** Podium column rising from the bottom with spring + glow. Supports staggered reveal via delay. */
LeaderboardRevealAnimation.Podium = function LeaderboardRevealPodium({
  children,
  delay = 0,
  glowColor,
}: {
  readonly children: ReactNode;
  readonly delay?: number;
  readonly glowColor?: string;
}) {
  const riseVariants = {
    hidden: { opacity: 0, y: 100, scaleY: 0.3 },
    visible: {
      opacity: 1,
      y: 0,
      scaleY: 1,
      transition: {
        type: 'spring',
        stiffness: 120,
        damping: 14,
        mass: 1.2,
        delay,
      },
    },
  };

  const glowFadeVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: [0, 0.8, 0.4],
      transition: {
        duration: 1.2,
        ease: 'easeOut',
        delay: delay + 0.5,
      },
    },
  };

  const glowStyle: CSSProperties = {
    background: glowColor
      ? `radial-gradient(ellipse at center bottom, ${glowColor} 0%, transparent 70%)`
      : 'none',
    borderRadius: '50%',
    bottom: '-20%',
    height: '160%',
    left: '50%',
    pointerEvents: 'none',
    position: 'absolute',
    transform: 'translateX(-50%)',
    width: '140%',
    zIndex: 0,
  };

  return (
    <motion.div
      variants={riseVariants}
      style={{ position: 'relative', transformOrigin: 'bottom center' }}
    >
      {glowColor ? (
        <motion.div variants={glowFadeVariants} aria-hidden="true" style={glowStyle} />
      ) : null}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </motion.div>
  );
};

/** Session / player bar with scale-in animation. */
LeaderboardRevealAnimation.PlayerBar = function LeaderboardRevealPlayerBar({
  children,
}: {
  readonly children: ReactNode;
}) {
  return <motion.div variants={playerBarVariants}>{children}</motion.div>;
};

/** Rankings group with staggered row reveal. */
LeaderboardRevealAnimation.Rankings = function LeaderboardRevealRankings({
  children,
  style,
}: {
  readonly children: ReactNode;
  readonly style?: CSSProperties;
}) {
  return (
    <motion.div
      style={style}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: 1.2,
            staggerChildren: 0.06,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

/** Ranking row sliding in from left. */
LeaderboardRevealAnimation.Row = function LeaderboardRevealRow({
  children,
}: {
  readonly children: ReactNode;
}) {
  return <motion.div variants={rowVariants}>{children}</motion.div>;
};

/** CTA button area fading up. */
LeaderboardRevealAnimation.Cta = function LeaderboardRevealCta({
  children,
}: {
  readonly children: ReactNode;
}) {
  return <motion.div variants={ctaVariants}>{children}</motion.div>;
};

// Keep backward-compat alias
LeaderboardRevealAnimation.Header = LeaderboardRevealAnimation.Hero;
