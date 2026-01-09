import type { Segment } from "./types";
import { LEMMING_SIZE_PX } from "./constants";
import { clamp } from "./math";

export function pickLandingSegmentCrossing(
  segments: Segment[],
  x: number,
  previousY: number,
  nextY: number,
  ignoredIndex: number | null,
  ignoreUntilY: number
): number | null {
  if (nextY <= previousY) {
    return null;
  }

  let bestIndex: number | null = null;
  let bestY = Number.POSITIVE_INFINITY;

  for (let index = 0; index < segments.length; index += 1) {
    if (
      ignoredIndex !== null &&
      index === ignoredIndex &&
      previousY < ignoreUntilY
    ) {
      continue;
    }

    const seg = segments[index];
    if (x < seg.x1 || x > seg.x2) {
      continue;
    }

    // Did we cross the platform Y between frames?
    if (seg.y <= previousY || seg.y > nextY) {
      continue;
    }

    if (seg.y < bestY) {
      bestY = seg.y;
      bestIndex = index;
    }
  }

  return bestIndex;
}

export function clampToGroundX(x: number, ground: Segment): number {
  return clamp(x, ground.x1, ground.x2);
}

export function isAtViewEdge(x: number, containerWidth: number, marginPx: number): boolean {
  return (
    x <= marginPx ||
    x >= containerWidth - (LEMMING_SIZE_PX + marginPx)
  );
}
