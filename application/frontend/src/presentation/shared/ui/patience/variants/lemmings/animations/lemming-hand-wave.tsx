import { motion } from 'motion/react';

interface WavingFingerSegment {
  readonly height: string;
  readonly x: string;
  readonly y: string;
}

const wavingFingerSegments = [
  { height: '2.8', x: '19', y: '-3' },
  { height: '3.2', x: '20.5', y: '-3.4' },
  { height: '2.8', x: '22', y: '-3' },
] as const satisfies readonly WavingFingerSegment[];

function WavingFinger({ height, x, y }: WavingFingerSegment) {
  return (
    <rect fill="var(--ui-color-surface-panel)" height={height} rx="0.4" width="0.9" x={x} y={y} />
  );
}

export function LemmingHandWave() {
  return (
    <>
      {/* Left hand relaxed at side */}
      <circle cx="1" cy="10" fill="var(--ui-color-surface-panel)" r="1.8" />
      {/* Right arm raised high, waving wide arc */}
      <motion.g
        animate={{ rotate: [-35, 25, -35] }}
        style={{ originX: '14px', originY: '6px' }}
        transition={{ duration: 0.45, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Upper arm */}
        <rect fill="var(--ui-color-surface-panel)" height="2.2" rx="1" width="7" x="14" y="-1" />
        {/* Hand (large open palm) */}
        <circle cx="21" cy="0" fill="var(--ui-color-surface-panel)" r="2.8" />
        {/* Fingers spread for visibility */}
        {wavingFingerSegments.map((segment) => (
          <WavingFinger
            height={segment.height}
            key={`${segment.x}-${segment.y}`}
            x={segment.x}
            y={segment.y}
          />
        ))}
      </motion.g>
    </>
  );
}
