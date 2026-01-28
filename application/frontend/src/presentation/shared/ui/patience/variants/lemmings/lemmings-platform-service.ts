import { injectable } from 'inversify';

export interface LemmingSegment {
  readonly x1: number;
  readonly x2: number;
  readonly y: number;
}

const LEMMING_SIZE_PX = 18;
const MAX_SELECTED_SEGMENTS = 20;
const PLATFORM_EDGE_PADDING_PX = 2;

@injectable()
export class LemmingsPlatformService {
  computeSegments(container: HTMLElement): Array<LemmingSegment> {
    const containerRect = container.getBoundingClientRect();
    const candidates = new Set<HTMLElement>();

    for (const element of Array.from(
      container.querySelectorAll<HTMLElement>(
        'button, [role="button"], a, input, select, textarea, h1, h2, h3, h4, hr, [role="separator"], [data-patience-platform]',
      ),
    )) {
      candidates.add(element);
    }

    for (const element of Array.from(container.querySelectorAll<HTMLElement>('*'))) {
      if (element.closest('[data-lemming="true"]')) {
        continue;
      }

      const rect = element.getBoundingClientRect();
      if (rect.width < 40) {
        continue;
      }

      if (
        this.isDividerElement(element) ||
        this.isBorderedElement(element) ||
        this.isTextPlatformCandidate(element, rect)
      ) {
        candidates.add(element);
      }
    }

    const segments: Array<LemmingSegment> = [];

    for (const element of candidates) {
      const rect = element.getBoundingClientRect();

      if (this.isTextPlatformCandidate(element, rect)) {
        segments.push(
          ...this.segmentsFromTextRects(this.getTextClientRects(element), containerRect),
        );
        continue;
      }

      if (!this.isDividerElement(element) && rect.height < 12) {
        continue;
      }

      const top = rect.top - containerRect.top;
      const left = rect.left - containerRect.left;
      const right = rect.right - containerRect.left;

      const y = Math.round(
        this.clamp(top - LEMMING_SIZE_PX, 8, containerRect.height - LEMMING_SIZE_PX),
      );
      const x1 = Math.round(
        this.clamp(left + PLATFORM_EDGE_PADDING_PX, 6, containerRect.width - 12),
      );
      const x2 = Math.round(
        this.clamp(
          right - (LEMMING_SIZE_PX + PLATFORM_EDGE_PADDING_PX),
          12,
          containerRect.width - 6,
        ),
      );

      if (x2 - x1 < 48) {
        continue;
      }

      segments.push({ x1, x2, y });
    }

    segments.sort((left, right) => right.y - left.y);

    const selected: Array<LemmingSegment> = [];
    for (const segment of segments) {
      const sameRow = selected.filter((existing) => Math.abs(existing.y - segment.y) < 10);
      const overlapsExisting = sameRow.some((existing) => {
        const overlap = Math.min(existing.x2, segment.x2) - Math.max(existing.x1, segment.x1);
        const minWidth = Math.min(existing.x2 - existing.x1, segment.x2 - segment.x1);
        return overlap > 0 && overlap / Math.max(1, minWidth) > 0.6;
      });

      if (overlapsExisting) {
        continue;
      }

      selected.push(segment);
      if (selected.length >= MAX_SELECTED_SEGMENTS) {
        break;
      }
    }

    return [this.createFallbackGround(containerRect.width, containerRect.height), ...selected];
  }

  private createFallbackGround(width: number, height: number): LemmingSegment {
    const groundY = Math.max(8, height - (LEMMING_SIZE_PX + 8));
    const maxX = Math.max(16, width - (8 + LEMMING_SIZE_PX));

    return { x1: 8, x2: maxX, y: groundY };
  }

  private isBorderedElement(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    const borderWidths = [
      style.borderTopWidth,
      style.borderRightWidth,
      style.borderBottomWidth,
      style.borderLeftWidth,
    ].map((value) => Number.parseFloat(value || '0'));

    const hasBorderWidth = borderWidths.some((value) => Number.isFinite(value) && value > 0);
    const hasBorderStyle =
      style.borderTopStyle !== 'none' ||
      style.borderRightStyle !== 'none' ||
      style.borderBottomStyle !== 'none' ||
      style.borderLeftStyle !== 'none';

    const outlineWidth = Number.parseFloat(style.outlineWidth || '0');
    const hasOutline =
      Number.isFinite(outlineWidth) && outlineWidth > 0 && style.outlineStyle !== 'none';

    return (hasBorderWidth && hasBorderStyle) || hasOutline;
  }

  private isDividerElement(element: HTMLElement): boolean {
    return element.matches('hr, [role="separator"], [data-divider]');
  }

  private isInteractiveElement(element: HTMLElement): boolean {
    return element.matches(
      'button, [role="button"], a, input, select, textarea, [data-interactive]',
    );
  }

  private hasInteractiveDescendant(element: HTMLElement): boolean {
    return Boolean(
      element.querySelector(
        'button, [role="button"], a, input, select, textarea, [data-interactive]',
      ),
    );
  }

  private isTextPlatformCandidate(element: HTMLElement, rect: DOMRect): boolean {
    if (this.isInteractiveElement(element)) {
      return false;
    }

    const text = element.textContent?.trim() ?? '';
    if (text.length < 12) {
      return false;
    }

    if (rect.width < 60 || rect.height < 10 || rect.height > 96) {
      return false;
    }

    const style = window.getComputedStyle(element);
    if (style.visibility === 'hidden' || style.display === 'none') {
      return false;
    }

    if (this.hasInteractiveDescendant(element)) {
      return false;
    }

    if (element.childElementCount > 3) {
      return false;
    }

    return true;
  }

  private getTextClientRects(element: HTMLElement): Array<DOMRect> {
    const text = element.textContent?.trim() ?? '';
    const wordCount = (text.match(/\S+/g) ?? []).length;

    if (wordCount > 0 && wordCount <= 6) {
      return this.getWordTextClientRects(element);
    }

    return this.getLineTextClientRects(element);
  }

  private getLineTextClientRects(element: HTMLElement): Array<DOMRect> {
    const range = document.createRange();
    range.selectNodeContents(element);

    const rects = Array.from(range.getClientRects());
    range.detach?.();

    return rects.filter((rect) => rect.width >= 20 && rect.height >= 10).slice(0, 10);
  }

  private getWordTextClientRects(element: HTMLElement): Array<DOMRect> {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || node.nodeValue.trim().length === 0) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const rects: Array<DOMRect> = [];
    const range = document.createRange();

    let textNode = walker.nextNode() as Text | null;
    while (textNode) {
      const value = textNode.nodeValue ?? '';
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

  private segmentsFromTextRects(
    textRects: Array<DOMRect>,
    containerRect: DOMRect,
  ): Array<LemmingSegment> {
    const segments: Array<LemmingSegment> = [];

    for (const textRect of textRects) {
      const top = textRect.top - containerRect.top;
      const left = textRect.left - containerRect.left;
      const right = textRect.right - containerRect.left;

      const y = Math.round(
        this.clamp(top - LEMMING_SIZE_PX, 8, containerRect.height - LEMMING_SIZE_PX),
      );
      const x1 = Math.round(this.clamp(left, 6, containerRect.width - (LEMMING_SIZE_PX + 6)));
      const x2 = Math.round(
        this.clamp(right - LEMMING_SIZE_PX, 12, containerRect.width - (LEMMING_SIZE_PX + 6)),
      );

      if (x2 - x1 < 16) {
        continue;
      }

      segments.push({ x1, x2, y });
    }

    return segments;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}
