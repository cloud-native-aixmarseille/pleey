export function pseudoRandom01(seed: number): number {
  // Deterministic-ish pseudo random in [0, 1).
  const x = Math.sin(seed) * 10_000;
  return x - Math.floor(x);
}
