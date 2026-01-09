import type { ComponentType } from "react";

import type { PatienceAnimationId } from "./types";
import { LemmingsPatienceAnimation } from "./variants/lemmings/LemmingsPatienceAnimation";

type PatienceAnimationComponent = ComponentType<{ container: HTMLElement | null }>;

export const PATIENCE_ANIMATIONS: Record<PatienceAnimationId, PatienceAnimationComponent> = {
  lemmings: LemmingsPatienceAnimation,
};
