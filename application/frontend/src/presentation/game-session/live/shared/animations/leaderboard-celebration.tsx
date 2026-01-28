import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { usePrefersReducedMotion } from '../../../../shared/ui/patience/hooks/use-prefers-reduced-motion';

const PARTICLE_COUNT = 28;
const CELEBRATION_COLORS = [
  '#b8ff5c', // lime / gold
  '#1ee8d7', // cyan / accent
  '#ff4fa3', // pink / highlight
  '#ffffff', // white spark
  '#a78bfa', // purple
];

const PARTICLE_SHAPES = ['circle', 'square', 'strip'] as const;
type ParticleShape = (typeof PARTICLE_SHAPES)[number];

interface Particle {
  readonly color: string;
  readonly delay: number;
  readonly duration: number;
  readonly id: number;
  readonly rotation: number;
  readonly shape: ParticleShape;
  readonly size: number;
  readonly x: number;
}

function buildParticles(count: number): readonly Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    color: CELEBRATION_COLORS[i % CELEBRATION_COLORS.length],
    delay: Math.random() * 1.8,
    duration: 2.2 + Math.random() * 1.6,
    id: i,
    rotation: Math.random() * 720 - 360,
    shape: PARTICLE_SHAPES[i % PARTICLE_SHAPES.length],
    size: 4 + Math.random() * 6,
    x: Math.random() * 100,
  }));
}

function particleStyle(p: Particle): React.CSSProperties {
  const base: React.CSSProperties = {
    backgroundColor: p.color,
    left: `${p.x}%`,
    position: 'absolute',
    top: -12,
  };

  if (p.shape === 'circle') {
    return { ...base, borderRadius: '50%', height: p.size, width: p.size };
  }
  if (p.shape === 'strip') {
    return { ...base, borderRadius: 1, height: p.size * 2.5, width: p.size * 0.5 };
  }
  return { ...base, borderRadius: 1, height: p.size, width: p.size };
}

const containerStyle: React.CSSProperties = {
  height: '100%',
  left: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
  position: 'absolute',
  top: 0,
  width: '100%',
  zIndex: 0,
};

export function LeaderboardCelebration() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const particles = useMemo(() => buildParticles(PARTICLE_COUNT), []);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div aria-hidden="true" style={containerStyle}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={particleStyle(p)}
          initial={{ opacity: 0, y: -20, rotate: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            rotate: p.rotation,
            y: 'calc(100vh + 20px)',
          }}
          transition={{
            delay: 0.6 + p.delay,
            duration: p.duration,
            ease: 'easeIn',
            times: [0, 0.05, 0.75, 1],
          }}
        />
      ))}
    </div>
  );
}
