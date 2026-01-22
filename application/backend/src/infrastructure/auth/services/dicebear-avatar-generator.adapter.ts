import { Buffer } from 'node:buffer';
import { bottts } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import { Injectable } from '@nestjs/common';
import type { AvatarGeneratorAdapter } from '../../../domain/auth/ports/avatar-generator.adapter';

/**
 * Avatar Generator Service
 * Provides DiceBear-based SVG avatar generation
 */
@Injectable()
export class DicebearAvatarGeneratorAdapter implements AvatarGeneratorAdapter {
  /**
   * Generates a Buffer for the avatar SVG.
   * Useful when returning avatars over HTTP.
   */
  generateAvatar(seed: string): Buffer {
    const avatar = createAvatar(bottts, {
      seed,
      size: 128,
    });
    return Buffer.from(avatar.toDataUri(), 'utf8');
  }
}
