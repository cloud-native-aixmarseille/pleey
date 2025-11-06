import { Buffer } from 'node:buffer';
import { Injectable } from '@nestjs/common';
import { createAvatar } from '@dicebear/core';
import { bottts } from '@dicebear/collection';

/**
 * Avatar Generator Service
 * Provides DiceBear-based SVG avatar generation
 */
@Injectable()
export class AvatarGeneratorService {
  /**
   * Generates a base64-encoded SVG avatar data URL.
   * @param seed Base identifier for the avatar.
   * @param sessionId Optional session identifier to ensure uniqueness per session.
   */
  generateAvatar(seed: string, sessionId?: number): string {
    const normalizedSeed = sessionId === undefined ? seed : `${seed}-${sessionId}`;
    const avatar = createAvatar(bottts, {
      seed: normalizedSeed,
      size: 128,
    });

    const svg = avatar.toString();
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }
}
