import type { MotionProps, Transition } from 'motion/react';
import { motion } from 'motion/react';

const talkingMouthAnimation: MotionProps['animate'] = { ry: [0.8, 1.5, 0.8] };
const talkingMouthTransition: Transition = { duration: 0.16, ease: 'easeInOut', repeat: Infinity };
const restingMouthPath = 'M7.5 10 Q9 11.8 10.5 10';

function TalkingMouth() {
  return (
    <motion.ellipse
      animate={talkingMouthAnimation}
      cx="9"
      cy="10.5"
      fill="var(--ui-color-text-emphasis)"
      rx="1.2"
      ry="0.8"
      transition={talkingMouthTransition}
    />
  );
}

function RestingMouth() {
  return (
    <path
      d={restingMouthPath}
      fill="none"
      stroke="var(--ui-color-text-emphasis)"
      strokeLinecap="round"
      strokeWidth="0.7"
    />
  );
}

export function LemmingMouth({ talking }: { talking: boolean }) {
  if (talking) {
    return <TalkingMouth />;
  }

  return <RestingMouth />;
}
