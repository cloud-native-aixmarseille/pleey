import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { Media } from '../../media/entities/media';
import {
  type AvatarGeneratorAdapter,
  AvatarGeneratorAdapterProvider,
} from '../ports/avatar-generator.adapter';

/**
 * User Avatar Service
 * Generates SVG avatars for users using DiceBear
 */
@Injectable()
export class UserAvatarService {
  constructor(
    @Inject(AvatarGeneratorAdapterProvider)
    private readonly avatarGenerator: AvatarGeneratorAdapter,
  ) {}

  /**
   * Generates an avatar using the provided seed or a random one.
   */
  generateAvatar(seed?: string, sessionId?: number): Media {
    const baseSeed = seed?.trim().length ? seed : this.generateSeed();
    const forgedSeed = this.forgeSeed(baseSeed, sessionId);

    return this.avatarGenerator.generateAvatar(forgedSeed);
  }

  private generateSeed(): string {
    if (typeof randomUUID === 'function') {
      return randomUUID();
    }

    return Math.random().toString(36).slice(2);
  }

  private forgeSeed(seed: string, sessionId?: number): string {
    if (sessionId === undefined) {
      return seed;
    }

    return `${seed}-${sessionId}`;
  }
}
