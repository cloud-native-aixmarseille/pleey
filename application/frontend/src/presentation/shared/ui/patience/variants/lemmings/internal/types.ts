export type Segment = {
  x1: number;
  x2: number;
  y: number;
};

export type LemmingMode = "fall" | "walk";

export type LemmingGreetVariant = "wave" | "highfive" | "emote";

export type LemmingIdleVariant =
  | "emote"
  | "jetpack"
  | "banana"
  | "trumpet"
  | "portal";

export type LemmingState = {
  el: HTMLDivElement | null;
  mode: LemmingMode;
  segmentIndex: number | null;
  x: number;
  y: number;
  vy: number;
  spawnAt: number;
  hasSpawned: boolean;
  speedPxPerSecond: number;
  direction: 1 | -1;
  nextIdleAt: number;
  idleUntil: number;
  idleStartedAt: number;
  idleStartX: number;
  idleStartY: number;
  idleVariant: LemmingIdleVariant | null;
  idleEmote: string | null;
  bananaSlipPending: boolean;
  greetUntil: number;
  greetCooldownUntil: number;
  greetPartnerIndex: number | null;
  greetVariant: LemmingGreetVariant | null;
  greetEmote: string | null;
  ignoredSegmentIndex: number | null;
  ignoreUntilY: number;
};
