export const LEMMING_COUNT = 8;

// +45% vs previous 12px (~17.4px) -> round to 18px.
export const LEMMING_SIZE_PX = 18;
export const PLATFORM_EDGE_PADDING_PX = 2;
export const VIEW_EDGE_MARGIN_PX = 8;

// Let lemmings "step off" a little before they start falling.
// This avoids the visual of falling while still clearly on the platform.
export const FALL_AFTER_EDGE_OVERHANG_PX = 6;

export const MAX_SELECTED_SEGMENTS = 20;

export const SPAWN_INTERVAL_MS = 5_000;

// Slower, floatier falling.
export const GRAVITY_PX_PER_S2 = 520;
export const TERMINAL_VELOCITY_PX_PER_S = 220;

export const LEMMING_WRAPPER_CLASSES =
  "absolute top-0 left-0 h-[18px] w-[18px] rounded-[4px] bg-accent-400/90 dark:bg-accent-300/90";

// Simple "character" parts so we clearly see head/hands/feet.
export const LEMMING_HEAD_CLASSES =
  "lemming-head absolute left-[3px] top-[2px] h-[8px] w-[12px] rounded-[3px] bg-accent-300/95 dark:bg-accent-200/90";
export const LEMMING_FACE_CLASSES =
  "absolute left-[6px] top-[5px] h-[2px] w-[2px] rounded-[1px] bg-dark-500/80 dark:bg-dark-900/60";
export const LEMMING_MOUTH_CLASSES =
  "lemming-mouth absolute left-[7px] top-[6px] h-[1px] w-[4px] rounded-[2px] bg-dark-500/70 dark:bg-dark-900/50";
export const LEMMING_HAIR_CLASSES =
  "absolute left-[4px] top-[2px] h-[2px] w-[6px] rounded-[2px] bg-secondary-500/80 dark:bg-secondary-400/80";

export const LEMMING_BODY_CLASSES =
  "lemming-body absolute left-[4px] top-[10px] h-[6px] w-[10px] rounded-[3px] bg-accent-400/90 dark:bg-accent-300/90";

export const LEMMING_HAND_LEFT_CLASSES =
  "lemming-hand lemming-hand--left absolute left-[1px] top-[11px] h-[3px] w-[3px] rounded-[2px] bg-light-50/80 dark:bg-light-100/50";
export const LEMMING_HAND_RIGHT_CLASSES =
  "lemming-hand lemming-hand--right absolute left-[14px] top-[11px] h-[3px] w-[3px] rounded-[2px] bg-light-50/80 dark:bg-light-100/50";

export const LEMMING_FOOT_LEFT_CLASSES =
  "lemming-foot lemming-foot--left absolute left-[5px] top-[16px] h-[2px] w-[4px] rounded-[2px] bg-dark-500/70 dark:bg-dark-900/50";
export const LEMMING_FOOT_RIGHT_CLASSES =
  "lemming-foot lemming-foot--right absolute left-[10px] top-[16px] h-[2px] w-[4px] rounded-[2px] bg-dark-500/70 dark:bg-dark-900/50";

export const LEMMING_BACKPACK_CLASSES =
  "absolute left-[1px] top-[10px] h-[6px] w-[4px] rounded-[2px] bg-secondary-500/25 dark:bg-secondary-400/25";
export const LEMMING_TOOL_CLASSES =
  "lemming-tool absolute left-[12px] top-[12px] h-[1px] w-[7px] -rotate-[25deg] rounded bg-dark-500/60 dark:bg-dark-900/40";

export const LEMMING_PARACHUTE_WRAPPER_CLASSES =
  "lemming-parachute absolute left-[1px] top-[-9px] h-[12px] w-[16px]";
export const LEMMING_PARACHUTE_CANOPY_CLASSES =
  "absolute left-0 top-0 h-[7px] w-[16px] rounded-t-full border border-secondary-500/40 bg-secondary-500/15 dark:border-secondary-400/40 dark:bg-secondary-400/15";
export const LEMMING_PARACHUTE_LINE_LEFT_CLASSES =
  "absolute left-[3px] top-[6px] h-[7px] w-[1px] bg-secondary-500/35 dark:bg-secondary-400/35";
export const LEMMING_PARACHUTE_LINE_RIGHT_CLASSES =
  "absolute left-[12px] top-[6px] h-[7px] w-[1px] bg-secondary-500/35 dark:bg-secondary-400/35";

export const LEMMING_EMOTE_BUBBLE_CLASSES =
  "lemming-emote pointer-events-none absolute left-[2px] top-[-16px] flex h-[12px] min-w-[12px] items-center justify-center rounded-[6px] border border-light-50/40 bg-light-50/85 px-[4px] text-[9px] leading-none text-dark-500 dark:border-dark-500/40 dark:bg-dark-400/85 dark:text-light-50";
