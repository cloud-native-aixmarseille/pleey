import { motion } from 'motion/react';

interface ParachuteStripe {
  readonly d: string;
}

interface ParachuteLine {
  readonly x1: string;
  readonly x2: string;
  readonly y1: string;
  readonly y2: string;
}

const parachuteStripes = [
  { d: 'M5 -15 L4 -8' },
  { d: 'M9 -16 L9 -8' },
  { d: 'M13 -15 L14 -8' },
] as const satisfies readonly ParachuteStripe[];

const parachuteLines = [
  { x1: '2', x2: '5', y1: '-8', y2: '0' },
  { x1: '16', x2: '13', y1: '-8', y2: '0' },
] as const satisfies readonly ParachuteLine[];

function ParachuteStripe({ d }: ParachuteStripe) {
  return <path d={d} opacity="0.25" stroke="#fff" strokeWidth="0.4" />;
}

function ParachuteLine({ x1, x2, y1, y2 }: ParachuteLine) {
  return (
    <line
      stroke="var(--ui-color-text-secondary)"
      strokeWidth="0.4"
      x1={x1}
      x2={x2}
      y1={y1}
      y2={y2}
    />
  );
}

export function LemmingParachute() {
  return (
    <motion.g
      animate={{ x: [0, 1, 0, -1, 0], rotate: [0, 2, 0, -2, 0] }}
      transition={{ duration: 0.42, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Canopy */}
      <path
        d="M1 -8 Q1 -16 9 -16 Q17 -16 17 -8 Z"
        fill="var(--ui-color-brand-accent)"
        opacity="0.7"
        stroke="var(--ui-color-border-subtle)"
        strokeWidth="0.5"
      />
      {/* Stripes */}
      {parachuteStripes.map((stripe) => (
        <ParachuteStripe d={stripe.d} key={stripe.d} />
      ))}
      {/* Lines */}
      {parachuteLines.map((line) => (
        <ParachuteLine
          key={`${line.x1}-${line.y1}-${line.x2}-${line.y2}`}
          x1={line.x1}
          x2={line.x2}
          y1={line.y1}
          y2={line.y2}
        />
      ))}
    </motion.g>
  );
}
