import type { Segment } from "./types";
import {
  LEMMING_SIZE_PX,
  MAX_SELECTED_SEGMENTS,
  PLATFORM_EDGE_PADDING_PX,
} from "./constants";
import { clamp } from "./math";
import { getTextClientRects, segmentsFromTextRects } from "./domTextRects";

export function createFallbackSegments(width: number, height: number): Segment[] {
  const groundY = Math.max(8, height - (LEMMING_SIZE_PX + 8));
  const maxX = Math.max(16, width - (8 + LEMMING_SIZE_PX));
  return [{ x1: 8, x2: maxX, y: groundY }];
}

function isBorderedElement(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  const borderWidths = [
    style.borderTopWidth,
    style.borderRightWidth,
    style.borderBottomWidth,
    style.borderLeftWidth,
  ].map((value) => Number.parseFloat(value || "0"));

  const hasBorderWidth = borderWidths.some(
    (value) => Number.isFinite(value) && value > 0
  );

  const hasBorderStyle =
    style.borderTopStyle !== "none" ||
    style.borderRightStyle !== "none" ||
    style.borderBottomStyle !== "none" ||
    style.borderLeftStyle !== "none";

  const outlineWidth = Number.parseFloat(style.outlineWidth || "0");
  const hasOutline =
    Number.isFinite(outlineWidth) &&
    outlineWidth > 0 &&
    style.outlineStyle !== "none";

  return (hasBorderWidth && hasBorderStyle) || hasOutline;
}

function isInteractiveElement(element: HTMLElement): boolean {
  return element.matches(
    "button, [role=button], a, input, select, textarea, [data-interactive]"
  );
}

function hasInteractiveDescendant(element: HTMLElement): boolean {
  return Boolean(
    element.querySelector(
      "button, [role=button], a, input, select, textarea, [data-arcade-card]"
    )
  );
}

function isTextPlatformCandidate(element: HTMLElement, rect: DOMRect): boolean {
  if (isInteractiveElement(element)) {
    return false;
  }

  const text = element.textContent?.trim() ?? "";
  if (text.length < 12) {
    return false;
  }

  if (rect.width < 60 || rect.height < 10 || rect.height > 96) {
    return false;
  }

  const style = window.getComputedStyle(element);
  if (style.visibility === "hidden" || style.display === "none") {
    return false;
  }

  if (hasInteractiveDescendant(element)) {
    return false;
  }

  if (element.childElementCount > 3) {
    return false;
  }

  return true;
}

function isInsideArcadeCard(element: HTMLElement): boolean {
  return Boolean(element.closest("[data-arcade-card]"));
}

export function computeSegments(container: HTMLElement): Segment[] {
  const containerRect = container.getBoundingClientRect();

  const candidates = new Set<HTMLElement>();

  for (const element of Array.from(
    container.querySelectorAll<HTMLElement>(
      "button, [role=button], a, input, select, textarea, h1, h2, h3, [data-arcade-card], [data-patience-platform]"
    )
  )) {
    candidates.add(element);
  }

  // Also treat bordered elements and significant text blocks as platforms.
  // This is intentionally simple and throttled by the caller.
  const allElements = Array.from(container.querySelectorAll<HTMLElement>("*"));
  for (const element of allElements) {
    if (element.closest('[data-lemming="true"]')) {
      continue;
    }

    // Prefer walking on the Card itself rather than its internal contents.
    if (isInsideArcadeCard(element) && !element.matches("[data-arcade-card]")) {
      continue;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width < 40 || rect.height < 12) {
      continue;
    }

    if (isBorderedElement(element) || isTextPlatformCandidate(element, rect)) {
      candidates.add(element);
    }
  }

  const segments: Segment[] = [];

  for (const element of candidates) {
    const rect = element.getBoundingClientRect();
    const isArcadeCard = element.matches("[data-arcade-card]");

    // If the element is inside a Card, ignore it (the Card itself is the platform).
    if (!isArcadeCard && isInsideArcadeCard(element)) {
      continue;
    }

    // Allow thinner text elements (e.g. headings) to still become platforms.
    if (rect.width < 60 || rect.height < 10) {
      continue;
    }

    if (!isArcadeCard && isTextPlatformCandidate(element, rect)) {
      const textRects = getTextClientRects(element);
      const textSegments = segmentsFromTextRects(textRects, containerRect, 16);
      segments.push(...textSegments);
      continue;
    }

    // Non-text platforms should be reasonably tall to avoid noisy segments.
    if (rect.height < 14) {
      continue;
    }

    const top = rect.top - containerRect.top;
    const left = rect.left - containerRect.left;
    const right = rect.right - containerRect.left;

    const y = Math.round(
      clamp(top - LEMMING_SIZE_PX, 8, containerRect.height - LEMMING_SIZE_PX)
    );

    const x1 = Math.round(
      clamp(left + PLATFORM_EDGE_PADDING_PX, 6, containerRect.width - 12)
    );
    const x2 = Math.round(
      clamp(
        right - (LEMMING_SIZE_PX + PLATFORM_EDGE_PADDING_PX),
        12,
        containerRect.width - 6
      )
    );

    if (x2 - x1 < 60) {
      continue;
    }

    segments.push({ x1, x2, y });
  }

  segments.sort((a, b) => b.y - a.y);

  const selected: Segment[] = [];
  for (const seg of segments) {
    const sameRow = selected.filter(
      (existing) => Math.abs(existing.y - seg.y) < 10
    );
    if (sameRow.length > 0) {
      const overlapsExisting = sameRow.some((existing) => {
        const overlap =
          Math.min(existing.x2, seg.x2) - Math.max(existing.x1, seg.x1);
        const minWidth = Math.min(existing.x2 - existing.x1, seg.x2 - seg.x1);
        return overlap > 0 && overlap / Math.max(1, minWidth) > 0.6;
      });

      if (overlapsExisting) {
        continue;
      }
    }

    selected.push(seg);
    if (selected.length >= MAX_SELECTED_SEGMENTS) {
      break;
    }
  }

  const ground = createFallbackSegments(containerRect.width, containerRect.height)[0];

  return [ground, ...selected];
}
