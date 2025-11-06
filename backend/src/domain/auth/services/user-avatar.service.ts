import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { AvatarGeneratorService } from '../../shared/services/avatar-generator.service';

/**
 * User Avatar Service
 * Generates SVG avatars for users using DiceBear
 */
@Injectable()
export class UserAvatarService {
  constructor(private readonly avatarGenerator: AvatarGeneratorService) { }

  /**
   * Generates an avatar using the provided seed or a random one.
   */
  generateAvatar(seed?: string): string {
    const effectiveSeed = seed?.trim().length ? seed : this.generateSeed();
    return this.avatarGenerator.generateAvatar(effectiveSeed);
  }

  /**
   * Generates a new random avatar without relying on caller-provided input.
   */
  generateRandomAvatar(): string {
    return this.avatarGenerator.generateAvatar(this.generateSeed());
  }

  private generateSeed(): string {
    if (typeof randomUUID === 'function') {
      return randomUUID();
    }

    return Math.random().toString(36).slice(2);
  }
}
