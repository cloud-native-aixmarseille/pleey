import { Buffer } from 'node:buffer';
import { Avatar, Style } from '@dicebear/core';
import botttsDefinition from '@dicebear/styles/bottts.json';
import { Injectable } from '@nestjs/common';
import type { AvatarGeneratorAdapter } from '../../../domain/identity/ports/avatar-generator.adapter';
import { Media } from '../../../domain/media/entities/media';

const SVG_MIME_TYPE = 'image/svg+xml';
const botttsStyle = new Style(botttsDefinition);

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
    const avatar = new Avatar(botttsStyle, {
      seed,
      size: 128,
    });

    return new Media(null, SVG_MIME_TYPE, Buffer.from(avatar.toString(), 'utf8'));
  }
}
