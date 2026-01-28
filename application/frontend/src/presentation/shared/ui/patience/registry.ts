import type { ComponentType } from 'react';
import { PatienceAnimationId } from './types';
import { LemmingsPatienceAnimation } from './variants/lemmings/lemmings-patience-animation';

type PatienceAnimationComponent = ComponentType<{ container: HTMLElement | null }>;

export const PATIENCE_ANIMATIONS: Record<PatienceAnimationId, PatienceAnimationComponent> = {
  [PatienceAnimationId.LEMMINGS]: LemmingsPatienceAnimation,
};
