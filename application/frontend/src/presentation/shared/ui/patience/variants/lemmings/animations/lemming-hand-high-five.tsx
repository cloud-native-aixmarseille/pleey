import { motion } from 'motion/react';

interface HighFiveFingerSegment {
  readonly height: string;
  readonly x: string;
  readonly y: string;
}

interface HighFiveImpactRaySegment {
  readonly x1: string;
  readonly x2: string;
  readonly y1: string;
  readonly y2: string;
}

const highFiveFingerSegments = [
  { height: '3', x: '19.5', y: '1' },
  { height: '3.5', x: '21', y: '0.5' },
  { height: '3.2', x: '22.5', y: '0.8' },
  { height: '2.8', x: '24', y: '1.5' },
] as const satisfies readonly HighFiveFingerSegment[];

const impactFlashRays = [
  { x1: '24', x2: '24', y1: '-4', y2: '-7' },
  { x1: '28', x2: '31', y1: '0', y2: '0' },
  { x1: '26', x2: '28', y1: '-3', y2: '-5' },
  { x1: '26', x2: '28', y1: '3', y2: '5' },
] as const satisfies readonly HighFiveImpactRaySegment[];

function HighFiveFinger({ height, x, y }: HighFiveFingerSegment) {
  return (
    <rect fill="var(--ui-color-surface-panel)" height={height} rx="0.4" width="0.9" x={x} y={y} />
  );
}

function HighFiveImpactRay({ x1, x2, y1, y2 }: HighFiveImpactRaySegment) {
  return (
    <line stroke="var(--ui-color-brand-accent)" strokeWidth="0.8" x1={x1} x2={x2} y1={y1} y2={y2} />
  );
}

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
          {highFiveFingerSegments.map((segment) => (
            <HighFiveFinger
              height={segment.height}
              key={`${segment.x}-${segment.y}`}
              x={segment.x}
              y={segment.y}
            />
          ))}
        </motion.g>
      </motion.g>
      {/* Impact flash at the slap point */}
      <motion.g
        animate={{ opacity: [0, 0, 1, 0, 0], scale: [0, 0, 1.5, 2, 0] }}
        transition={{ duration: 1, times: [0, 0.28, 0.34, 0.45, 0.55] }}
      >
        <circle cx="24" cy="0" fill="var(--ui-color-brand-accent)" r="3" />
        {impactFlashRays.map((ray) => (
          <HighFiveImpactRay
            key={`${ray.x1}-${ray.y1}-${ray.x2}-${ray.y2}`}
            x1={ray.x1}
            x2={ray.x2}
            y1={ray.y1}
            y2={ray.y2}
          />
        ))}
      </motion.g>
    </>
  );
}
