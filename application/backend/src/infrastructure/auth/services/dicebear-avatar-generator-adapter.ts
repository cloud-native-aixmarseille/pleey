import { Buffer } from 'node:buffer';
import { bottts } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import { Injectable } from '@nestjs/common';
import type { AvatarGeneratorAdapter } from '../../../domain/auth/ports/avatar-generator.adapter';
import { Media } from '../../../domain/media/entities/media';

const SVG_MIME_TYPE = 'image/svg+xml';

/**
 * Avatar Generator Service
 * Provides DiceBear-based SVG avatar generation
 */
@Injectable()
export class DicebearAvatarGeneratorAdapter implements AvatarGeneratorAdapter {
  /**
   * Generates avatar media for the provided seed.
   */
  generateAvatar(seed: string): Media {
    const avatar = createAvatar(bottts, {
      seed,
      size: 128,
    });

    return new Media(null, SVG_MIME_TYPE, Buffer.from(avatar.toString(), 'utf8'));
  }
}
