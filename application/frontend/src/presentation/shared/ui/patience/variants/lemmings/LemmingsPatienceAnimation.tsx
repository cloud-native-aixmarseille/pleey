import { useMemo } from "react";

import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

import {
  LEMMING_BACKPACK_CLASSES,
  LEMMING_BODY_CLASSES,
  LEMMING_COUNT,
  LEMMING_FACE_CLASSES,
  LEMMING_MOUTH_CLASSES,
  LEMMING_FOOT_LEFT_CLASSES,
  LEMMING_FOOT_RIGHT_CLASSES,
  LEMMING_EMOTE_BUBBLE_CLASSES,
  LEMMING_HAND_LEFT_CLASSES,
  LEMMING_HAND_RIGHT_CLASSES,
  LEMMING_HAIR_CLASSES,
  LEMMING_HEAD_CLASSES,
  LEMMING_PARACHUTE_CANOPY_CLASSES,
  LEMMING_PARACHUTE_LINE_LEFT_CLASSES,
  LEMMING_PARACHUTE_LINE_RIGHT_CLASSES,
  LEMMING_PARACHUTE_WRAPPER_CLASSES,
  LEMMING_TOOL_CLASSES,
  LEMMING_WRAPPER_CLASSES,
} from "./internal/constants";
import { LEMMINGS_ANIMATION_CSS } from "./internal/lemmingsAnimationCss";
import { useLemmingsPatienceEngine } from "./useLemmingsPatienceEngine";

export function LemmingsPatienceAnimation({
  container,
}: {
  container: HTMLElement | null;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const lemmingIds = useMemo(
    () =>
      Array.from({ length: LEMMING_COUNT }, (_, index) => `lemming-${index}`),
    []
  );

  const { lemmingsRef } = useLemmingsPatienceEngine(
    container,
    prefersReducedMotion,
    lemmingIds
  );

  if (!container) {
    return null;
  }

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div className="absolute inset-0">
      <style>{LEMMINGS_ANIMATION_CSS}</style>
      {lemmingIds.map((id, index) => (
        <div
          key={id}
          className={LEMMING_WRAPPER_CLASSES}
          ref={(node) => {
            const state = lemmingsRef.current[index];
            if (state) {
              state.el = node;
            }
          }}
          style={{ transform: "translate3d(-9999px, -9999px, 0)" }}
          data-lemming="true"
          data-lemming-mode="walk"
        >
          <div
            className={LEMMING_EMOTE_BUBBLE_CLASSES}
            data-lemming-emote-bubble="true"
            aria-hidden="true"
          />
          <div className={LEMMING_PARACHUTE_WRAPPER_CLASSES}>
            <div className={LEMMING_PARACHUTE_CANOPY_CLASSES} />
            <div className={LEMMING_PARACHUTE_LINE_LEFT_CLASSES} />
            <div className={LEMMING_PARACHUTE_LINE_RIGHT_CLASSES} />
          </div>
          <div
            className="lemming-portal pointer-events-none absolute left-[-2px] top-[13px] h-[9px] w-[22px] rounded-full border border-secondary-500/35 dark:border-secondary-400/35"
            aria-hidden="true"
          />
          <div className="lemming-sprite relative h-full w-full">
            <div
              className="lemming-jetpack pointer-events-none absolute left-[6px] top-[14px] h-[6px] w-[6px] rounded-[3px] bg-secondary-500/45 dark:bg-secondary-400/45"
              aria-hidden="true"
            >
              <div
                className="lemming-jetpack-flame absolute left-[2px] top-[5px] h-[6px] w-[2px] rounded-full bg-secondary-500/60 blur-[0.5px] dark:bg-secondary-400/60"
                aria-hidden="true"
              />
              <div
                className="lemming-jetpack-flame lemming-jetpack-flame--alt absolute left-[1px] top-[5px] h-[7px] w-[3px] rounded-full bg-accent-400/35 blur-[0.5px] dark:bg-accent-300/35"
                aria-hidden="true"
              />
            </div>
            <div
              className="lemming-banana pointer-events-none absolute left-[10px] top-[15px] text-[9px] leading-none"
              aria-hidden="true"
            >
              🍌
            </div>
            <div
              className="lemming-flag pointer-events-none absolute left-[1px] top-[1px] text-[9px] leading-none"
              aria-hidden="true"
            >
              🏁
            </div>
            <div className={LEMMING_HEAD_CLASSES}>
              <div className={LEMMING_HAIR_CLASSES} />
              <div className={LEMMING_FACE_CLASSES} />
              <div className={LEMMING_MOUTH_CLASSES} />
            </div>
            <div className={LEMMING_BODY_CLASSES} />
            <div className={LEMMING_HAND_LEFT_CLASSES} />
            <div className={LEMMING_HAND_RIGHT_CLASSES} />
            <div className={LEMMING_FOOT_LEFT_CLASSES} />
            <div className={LEMMING_FOOT_RIGHT_CLASSES} />
            <div className={LEMMING_BACKPACK_CLASSES} />
            <div className={LEMMING_TOOL_CLASSES} />
          </div>
        </div>
      ))}
    </div>
  );
}
