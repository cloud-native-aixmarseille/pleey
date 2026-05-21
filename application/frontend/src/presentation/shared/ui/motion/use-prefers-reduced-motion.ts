import { useReducedMotion } from 'framer-motion';

export function usePrefersReducedMotion(): boolean {
  return Boolean(useReducedMotion());
}
