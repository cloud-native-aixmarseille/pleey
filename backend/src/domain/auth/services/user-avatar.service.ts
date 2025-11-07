import { Buffer } from 'node:buffer';
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

  /**
   * Converts an avatar data URI to a UTF-8 SVG buffer.
   */
  toSvgBuffer(avatarDataUri: string): Buffer {
    const sanitized = avatarDataUri.trim();
    const dataUriPrefix = 'data:image/svg+xml;base64,';
    if (!sanitized.startsWith(dataUriPrefix)) {
      throw new Error('Invalid avatar data URI');
    }

    const base64Payload = sanitized.slice(dataUriPrefix.length);
    return Buffer.from(base64Payload, 'base64');
  }

  private generateSeed(): string {
    if (typeof randomUUID === 'function') {
      return randomUUID();
    }

    return Math.random().toString(36).slice(2);
  }
}
