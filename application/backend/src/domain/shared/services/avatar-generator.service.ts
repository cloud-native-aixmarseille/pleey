import { Buffer } from 'node:buffer';
import { bottts } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import { Injectable } from '@nestjs/common';

/**
 * Avatar Generator Service
 * Provides DiceBear-based SVG avatar generation
 */
@Injectable()
export class AvatarGeneratorService {
  /**
   * Generates a raw SVG avatar string.
   * @param seed Base identifier for the avatar.
   * @param sessionId Optional session identifier to ensure uniqueness per session.
   */
  generateAvatarSvg(seed: string, sessionId?: number): string {
    const normalizedSeed = sessionId === undefined ? seed : `${seed}-${sessionId}`;
    const avatar = createAvatar(bottts, {
      seed: normalizedSeed,
      size: 128,
    });

    return avatar.toString();
  }

  /**
   * Generates a base64-encoded SVG avatar data URL.
   * @param seed Base identifier for the avatar.
   * @param sessionId Optional session identifier to ensure uniqueness per session.
   */
  generateAvatar(seed: string, sessionId?: number): string {
    const svg = this.generateAvatarSvg(seed, sessionId);
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }

  /**
   * Generates a Buffer for the avatar SVG.
   * Useful when returning avatars over HTTP.
   */
  generateAvatarBuffer(seed: string, sessionId?: number): Buffer {
    const svg = this.generateAvatarSvg(seed, sessionId);
    return Buffer.from(svg, 'utf8');
  }
}
