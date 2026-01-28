import { AnimatePresence, motion } from 'framer-motion';
import type { LemmingSnapshot } from '../lemmings-patience-engine';
import { LemmingBanana } from './lemming-banana';
import { LemmingEyes } from './lemming-eyes';
import { LemmingHandHighFive } from './lemming-hand-high-five';
import { LemmingHandWave } from './lemming-hand-wave';
import { LemmingJetpack } from './lemming-jetpack';
import { LemmingMouth } from './lemming-mouth';
import { LemmingParachute } from './lemming-parachute';
import { LemmingPortal } from './lemming-portal';
import { LemmingTrumpet } from './lemming-trumpet';

const LEMMING_PX = 18;

const lemmingStyle = { position: 'absolute', width: LEMMING_PX, height: LEMMING_PX } as const;

const svgStyle = {
  display: 'block',
  overflow: 'visible',
  filter: 'drop-shadow(0 0 3px var(--ui-color-brand-accent))',
} as const;

const emoteStyle = {
  position: 'absolute',
  top: -20,
  left: -2,
  fontSize: 11,
  lineHeight: 1,
  pointerEvents: 'none',
} as const;

const speechBubbleStyle = {
  position: 'absolute',
  top: -24,
  left: -6,
  minWidth: 18,
  padding: '2px 4px',
  borderRadius: 6,
  background: 'var(--ui-color-surface-panel)',
  border: '1px solid var(--ui-color-border-subtle)',
  fontSize: 9,
  lineHeight: 1.2,
  textAlign: 'center',
  color: 'var(--ui-color-text-primary)',
  pointerEvents: 'none',
  whiteSpace: 'nowrap',
} as const;

const walkBob = [0, -1, 0, 1, 0];
const leftLegWalk = { y: [0, -1.5, 0, 1.5, 0] };
const rightLegWalk = { y: [0, 1.5, 0, -1.5, 0] };
const legStill = { y: 0 };
const legLoop = { duration: 0.3, repeat: Infinity, ease: 'linear' as const };

/* Body motion per variant ------------------------------------------------ */

const JETPACK_BODY = {
  animate: {
    y: [0, 3, -80, -120, -70, -130, -60, -120, -80, -110, -40, 0],
    x: [0, 0, 20, -18, 25, -22, 28, -15, 18, -12, 8, 0],
  },
  transition: {
    duration: 5,
    times: [0, 0.04, 0.14, 0.24, 0.34, 0.44, 0.54, 0.64, 0.74, 0.84, 0.94, 1],
    ease: 'easeInOut' as const,
  },
};

const BANANA_BODY = {
  animate: {
    rotate: [0, -15, 80, 85, 75, 85, 60, 15, 0],
    y: [0, 0, 3, 3, 3, 3, 2, 0, 0],
  },
  transition: {
    duration: 2.3,
    times: [0, 0.1, 0.28, 0.38, 0.48, 0.58, 0.68, 0.85, 1],
    ease: 'easeInOut' as const,
  },
};

const HIGHFIVE_BODY = {
  animate: { y: [0, -2, 1, 0], x: [0, 1, 0, 0] },
  transition: { duration: 1, times: [0, 0.3, 0.5, 1], ease: 'easeOut' as const },
};

const WAVE_BODY = {
  animate: { y: [0, -1, 0, -1, 0] },
  transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' as const },
};

const WALK_BODY = {
  animate: { y: walkBob },
  transition: { duration: 0.55, repeat: Infinity, ease: 'linear' as const },
};

const IDLE_BODY = {
  animate: { y: 0, rotate: 0 },
  transition: { duration: 0.3 },
};

/* Portal wrapper --------------------------------------------------------- */

const PORTAL_WRAP = {
  animate: {
    rotate: [0, 0, 540, 720, 720],
    scale: [1, 1, 0.02, 0.02, 1],
    opacity: [1, 1, 0, 0, 1],
  },
  transition: {
    duration: 1.8,
    times: [0, 0.25, 0.7, 0.85, 1],
    ease: 'easeIn' as const,
  },
};

const NO_PORTAL = {
  animate: { rotate: 0, scale: 1, opacity: 1 },
  transition: { duration: 0.2 },
};

/* Banana leg kick -------------------------------------------------------- */

const bananaLeftLeg = { y: [0, 0, 0, -3, 1, -3, 1, 0, 0] };
const bananaRightLeg = { y: [0, 0, 0, 1, -3, 1, -3, 0, 0] };
const bananaLegTransition = {
  duration: 2.3,
  times: [0, 0.1, 0.28, 0.38, 0.48, 0.58, 0.68, 0.85, 1],
  ease: 'easeInOut' as const,
};

const bananaOriginStyle = { transformOrigin: 'center bottom' } as const;

export function LemmingSprite({ lemming }: { lemming: LemmingSnapshot }) {
  const isWalking = lemming.mode === 'walk' && !lemming.idleVariant && !lemming.greetingVariant;
  const isFalling = lemming.mode === 'fall';
  const isSleeping = lemming.emote === 'Zzz';
  const isTalking = lemming.idleVariant === 'emote' || lemming.greetingVariant === 'emote';
  const isPortal = lemming.idleVariant === 'portal';
  const isJetpack = lemming.idleVariant === 'jetpack';
  const isBanana = lemming.idleVariant === 'banana';
  const isTrumpet = lemming.idleVariant === 'trumpet';
  const isWaving = lemming.greetingVariant === 'wave';
  const isHighFive = lemming.greetingVariant === 'highfive';

  const body = isJetpack
    ? JETPACK_BODY
    : isBanana
      ? BANANA_BODY
      : isHighFive
        ? HIGHFIVE_BODY
        : isWaving
          ? WAVE_BODY
          : isWalking
            ? WALK_BODY
            : IDLE_BODY;

  const portal = isPortal ? PORTAL_WRAP : NO_PORTAL;

  const leftLeg = isWalking ? leftLegWalk : isBanana ? bananaLeftLeg : legStill;
  const rightLeg = isWalking ? rightLegWalk : isBanana ? bananaRightLeg : legStill;
  const legTrans = isBanana ? bananaLegTransition : legLoop;

  return (
    <motion.div
      animate={{
        x: lemming.x,
        y: lemming.y,
        rotate: lemming.rotation,
        scaleX: lemming.direction,
      }}
      data-lemming="true"
      style={lemmingStyle}
      transition={{ duration: 0.14, ease: 'linear' }}
    >
      <motion.div
        animate={body.animate}
        style={isBanana ? bananaOriginStyle : undefined}
        transition={body.transition}
      >
        <motion.div animate={portal.animate} transition={portal.transition}>
          <svg
            aria-hidden="true"
            height={LEMMING_PX}
            style={svgStyle}
            viewBox="0 0 18 22"
            width={LEMMING_PX}
          >
            <AnimatePresence>{isFalling ? <LemmingParachute /> : null}</AnimatePresence>

            {/* Left leg + foot */}
            <motion.g animate={leftLeg} transition={legTrans}>
              <rect
                fill="var(--ui-color-brand-primary)"
                height="5"
                rx="1.5"
                width="3.5"
                x="4"
                y="13"
              />
              <ellipse cx="5.75" cy="18" fill="var(--ui-color-brand-primary)" rx="2.4" ry="1.3" />
            </motion.g>

            {/* Right leg + foot */}
            <motion.g animate={rightLeg} transition={legTrans}>
              <rect
                fill="var(--ui-color-brand-primary)"
                height="5"
                rx="1.5"
                width="3.5"
                x="10.5"
                y="13"
              />
              <ellipse cx="12.25" cy="18" fill="var(--ui-color-brand-primary)" rx="2.4" ry="1.3" />
            </motion.g>

            {/* Body capsule */}
            <rect fill="var(--ui-color-brand-accent)" height="13" rx="5" width="14" x="2" y="1" />

            {/* Hair tufts */}
            <circle cx="6.5" cy="1.8" fill="var(--ui-color-brand-primary)" r="2" />
            <circle cx="11.5" cy="1.8" fill="var(--ui-color-brand-primary)" r="2" />
            <circle cx="9" cy="1" fill="var(--ui-color-brand-primary)" r="2.2" />

            {/* Face highlight */}
            <ellipse cx="9" cy="7" fill="#fff" opacity="0.15" rx="5" ry="4" />

            <LemmingEyes sleeping={isSleeping} />
            <LemmingMouth talking={isTalking} />

            {isJetpack ? <LemmingJetpack /> : null}
            {isTrumpet ? <LemmingTrumpet /> : null}
            {isPortal ? <LemmingPortal /> : null}
            {isWaving ? <LemmingHandWave /> : null}
            {isHighFive ? <LemmingHandHighFive /> : null}
          </svg>
        </motion.div>
      </motion.div>

      {/* Banana overlay – rendered as HTML so emoji is always visible */}
      {isBanana ? <LemmingBanana /> : null}

      <AnimatePresence>
        {lemming.emote && isTalking ? (
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 4 }}
            initial={{ opacity: 0, scale: 0.3, y: 8 }}
            key={`${lemming.id}-bubble`}
            style={speechBubbleStyle}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          >
            {lemming.emote}
          </motion.div>
        ) : lemming.emote ? (
          <motion.span
            animate={{ opacity: 1, y: -4 }}
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: 0 }}
            key={`${lemming.id}-emote`}
            style={emoteStyle}
          >
            {lemming.emote}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
