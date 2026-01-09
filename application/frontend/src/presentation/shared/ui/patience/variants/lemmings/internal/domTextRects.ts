import { clamp } from "./math";
import type { Segment } from "./types";
import { LEMMING_SIZE_PX } from "./constants";

function getLineTextClientRects(element: HTMLElement): DOMRect[] {
  const range = document.createRange();
  range.selectNodeContents(element);

  const rects = Array.from(range.getClientRects());
  range.detach?.();

  return rects.filter((rect) => rect.width >= 20 && rect.height >= 10).slice(0, 10);
}

function getWordTextClientRects(element: HTMLElement): DOMRect[] {
  // Build "word" rects so whitespace becomes a gap that lemmings can fall through.
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || node.nodeValue.trim().length === 0) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const rects: DOMRect[] = [];
  const range = document.createRange();

  let textNode = walker.nextNode() as Text | null;
  while (textNode) {
    const value = textNode.nodeValue ?? "";
    const matches = value.matchAll(/\S+/g);

    for (const match of matches) {
      const start = match.index ?? 0;
      const end = start + match[0].length;

      range.setStart(textNode, start);
      range.setEnd(textNode, end);

      for (const rect of Array.from(range.getClientRects())) {
        if (rect.width >= 12 && rect.height >= 10) {
          rects.push(rect);
          if (rects.length >= 12) {
            break;
          }
        }
      }

      if (rects.length >= 12) {
        break;
      }
    }

    if (rects.length >= 12) {
      break;
    }

    textNode = walker.nextNode() as Text | null;
  }

  range.detach?.();
  return rects;
}

export function getTextClientRects(element: HTMLElement): DOMRect[] {
  const text = element.textContent?.trim() ?? "";
  const wordCount = (text.match(/\S+/g) ?? []).length;

  // Only split into word platforms for short phrases (e.g. headings).
  // For longer text blocks, keep a single line platform to avoid flooding
  // segment selection and breaking walking on non-text components.
  if (wordCount > 0 && wordCount <= 6) {
    return getWordTextClientRects(element);
  }

  return getLineTextClientRects(element);
}

export function segmentsFromTextRects(
  textRects: DOMRect[],
  containerRect: DOMRect,
  minSegmentWidthPx: number
): Segment[] {
  const segments: Segment[] = [];

  for (const textRect of textRects) {
    const top = textRect.top - containerRect.top;
    const left = textRect.left - containerRect.left;
    const right = textRect.right - containerRect.left;

    const y = Math.round(
      clamp(top - LEMMING_SIZE_PX, 8, containerRect.height - LEMMING_SIZE_PX)
    );

    const x1 = Math.round(
      clamp(left, 6, containerRect.width - (LEMMING_SIZE_PX + 6))
    );
    const x2 = Math.round(
      clamp(
        right - LEMMING_SIZE_PX,
        12,
        containerRect.width - (LEMMING_SIZE_PX + 6)
      )
    );

    if (x2 - x1 < minSegmentWidthPx) {
      continue;
    }

    segments.push({ x1, x2, y });
  }

  return segments;
}
