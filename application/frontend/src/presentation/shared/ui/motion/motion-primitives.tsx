import {
  AnimatePresence,
  type AnimatePresenceProps,
  LayoutGroup,
  type MotionProps,
  motion,
  type Transition,
  type Variants,
} from 'motion/react';
import type { ElementType, ReactNode } from 'react';
import { usePrefersReducedMotion } from './use-prefers-reduced-motion';

const DEFAULT_DURATION = 0.32;
const DEFAULT_STAGGER = 0.06;
const DEFAULT_SCREEN_DURATION = 0.28;
const DEFAULT_SLIDE_DISTANCE = 12;
const POP_SPRING: Transition = { type: 'spring', stiffness: 320, damping: 22 };
const REDUCED_TRANSITION: Transition = { duration: 0 };

interface MotionFadeInProps {
  readonly as?: ElementType;
  readonly children: ReactNode;
  readonly delay?: number;
  readonly duration?: number;
  readonly y?: number;
  readonly x?: number;
  readonly style?: MotionProps['style'];
  readonly testId?: string;
}

export function MotionFadeIn({
  as,
  children,
  delay = 0,
  duration = DEFAULT_DURATION,
  y = DEFAULT_SLIDE_DISTANCE,
  x = 0,
  style,
  testId,
}: MotionFadeInProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const Component = (
    as ? (motion.create(as) as typeof motion.div) : motion.div
  ) as typeof motion.div;
  const initial = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y, x };
  const animate = prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, x: 0 };
  const transition: Transition = prefersReducedMotion
    ? REDUCED_TRANSITION
    : { duration, delay, ease: 'easeOut' };

  return (
    <Component
      animate={animate}
      data-testid={testId}
      initial={initial}
      style={style}
      transition={transition}
    >
      {children}
    </Component>
  );
}

interface MotionStaggerProps {
  readonly as?: ElementType;
  readonly children: ReactNode;
  readonly initialDelay?: number;
  readonly staggerDelay?: number;
  readonly style?: MotionProps['style'];
  readonly testId?: string;
}

export function MotionStagger({
  as,
  children,
  initialDelay = 0,
  staggerDelay = DEFAULT_STAGGER,
  style,
  testId,
}: MotionStaggerProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const Component = (
    as ? (motion.create(as) as typeof motion.div) : motion.div
  ) as typeof motion.div;
  const variants: Variants = prefersReducedMotion
    ? {
        hidden: { opacity: 1 },
        visible: { opacity: 1, transition: REDUCED_TRANSITION },
      }
    : {
        hidden: { opacity: 1 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: initialDelay,
            staggerChildren: staggerDelay,
          },
        },
      };

  return (
    <Component
      animate="visible"
      data-testid={testId}
      initial="hidden"
      style={style}
      variants={variants}
    >
      {children}
    </Component>
  );
}

interface MotionStaggerItemProps {
  readonly as?: ElementType;
  readonly children: ReactNode;
  readonly distance?: number;
  readonly duration?: number;
  readonly style?: MotionProps['style'];
  readonly testId?: string;
}

export function MotionStaggerItem({
  as,
  children,
  distance = DEFAULT_SLIDE_DISTANCE,
  duration = DEFAULT_DURATION,
  style,
  testId,
}: MotionStaggerItemProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const Component = (
    as ? (motion.create(as) as typeof motion.div) : motion.div
  ) as typeof motion.div;
  const variants: Variants = prefersReducedMotion
    ? {
        hidden: { opacity: 1 },
        visible: { opacity: 1, transition: REDUCED_TRANSITION },
      }
    : {
        hidden: { opacity: 0, y: distance },
        visible: { opacity: 1, y: 0, transition: { duration, ease: 'easeOut' } },
      };

  return (
    <Component data-testid={testId} style={style} variants={variants}>
      {children}
    </Component>
  );
}

interface MotionScreenTransitionProps {
  readonly children: ReactNode;
  readonly sectionKey: string;
  readonly mode?: AnimatePresenceProps['mode'];
  readonly style?: MotionProps['style'];
  readonly duration?: number;
}

export function MotionScreenTransition({
  children,
  sectionKey,
  mode = 'wait',
  style,
  duration = DEFAULT_SCREEN_DURATION,
}: MotionScreenTransitionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const initial = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 };
  const animate = prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 };
  const exit = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 };
  const transition: Transition = prefersReducedMotion
    ? REDUCED_TRANSITION
    : { duration, ease: 'easeOut' };

  return (
    <AnimatePresence mode={mode}>
      <motion.div
        animate={animate}
        exit={exit}
        initial={initial}
        key={sectionKey}
        style={style}
        transition={transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

interface MotionPodiumRiseProps {
  readonly children: ReactNode;
  readonly delay?: number;
  readonly riseDistance?: number;
  readonly style?: MotionProps['style'];
  readonly testId?: string;
}

const PODIUM_RISE_SPRING: Transition = {
  type: 'spring',
  stiffness: 170,
  damping: 14,
  mass: 0.9,
};

export function MotionPodiumRise({
  children,
  delay = 0,
  riseDistance = 96,
  style,
  testId,
}: MotionPodiumRiseProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const initial = prefersReducedMotion
    ? { opacity: 0 }
    : { opacity: 0, y: riseDistance, scale: 0.55, rotate: -2 };
  const animate = prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, rotate: 0 };
  const transition: Transition = prefersReducedMotion
    ? REDUCED_TRANSITION
    : { ...PODIUM_RISE_SPRING, delay };

  return (
    <motion.div
      animate={animate}
      data-testid={testId}
      initial={initial}
      style={style}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}

interface MotionPopProps {
  readonly as?: ElementType;
  readonly children: ReactNode;
  readonly delay?: number;
  readonly style?: MotionProps['style'];
}

export function MotionPop({ as, children, delay = 0, style }: MotionPopProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const Component = (
    as ? (motion.create(as) as typeof motion.div) : motion.div
  ) as typeof motion.div;
  const initial = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6 };
  const animate = prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 };
  const transition: Transition = prefersReducedMotion
    ? REDUCED_TRANSITION
    : { ...POP_SPRING, delay };

  return (
    <Component animate={animate} initial={initial} style={style} transition={transition}>
      {children}
    </Component>
  );
}

interface MotionListPresenceProps {
  readonly children: ReactNode;
}

export function MotionListPresence({ children }: MotionListPresenceProps) {
  return (
    <LayoutGroup>
      <AnimatePresence initial={false} mode="popLayout">
        {children}
      </AnimatePresence>
    </LayoutGroup>
  );
}

interface MotionListItemProps {
  readonly children: ReactNode;
  readonly style?: MotionProps['style'];
}

export function MotionListItem({ children, style }: MotionListItemProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return (
      <motion.div
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        style={style}
        transition={REDUCED_TRANSITION}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
      exit={{
        opacity: 0,
        scale: 0.3,
        y: 24,
        rotate: 10,
        transition: {
          duration: 0.35,
          ease: 'easeIn',
          opacity: { duration: 0.25, ease: 'easeIn' },
        },
      }}
      initial={{ opacity: 0, scale: 0.3, y: -32, rotate: -10 }}
      layout
      style={style}
      transition={{
        default: { type: 'spring', stiffness: 220, damping: 14, mass: 0.9 },
        opacity: { duration: 0.35, ease: 'easeOut' },
      }}
    >
      {children}
    </motion.div>
  );
}

interface MotionPresenceProps {
  readonly children: ReactNode;
  readonly mode?: AnimatePresenceProps['mode'];
}

export function MotionPresence({ children, mode }: MotionPresenceProps) {
  return (
    <AnimatePresence initial={false} mode={mode}>
      {children}
    </AnimatePresence>
  );
}
