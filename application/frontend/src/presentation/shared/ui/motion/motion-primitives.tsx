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
}

export function MotionScreenTransition({
  children,
  sectionKey,
  mode = 'wait',
  style,
}: MotionScreenTransitionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const initial = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 };
  const animate = prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 };
  const exit = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 };
  const transition: Transition = prefersReducedMotion
    ? REDUCED_TRANSITION
    : { duration: DEFAULT_SCREEN_DURATION, ease: 'easeOut' };

  return (
    <AnimatePresence mode={mode} initial={false}>
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
      <AnimatePresence initial={false}>{children}</AnimatePresence>
    </LayoutGroup>
  );
}

interface MotionListItemProps {
  readonly children: ReactNode;
  readonly style?: MotionProps['style'];
}

export function MotionListItem({ children, style }: MotionListItemProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const initial = prefersReducedMotion
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.85, y: DEFAULT_SLIDE_DISTANCE };
  const animate = prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 };
  const exit = prefersReducedMotion
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.85, y: -DEFAULT_SLIDE_DISTANCE };
  const transition: Transition = prefersReducedMotion
    ? REDUCED_TRANSITION
    : { type: 'spring', stiffness: 360, damping: 26 };

  return (
    <motion.div
      animate={animate}
      exit={exit}
      initial={initial}
      layout={!prefersReducedMotion}
      style={style}
      transition={transition}
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
