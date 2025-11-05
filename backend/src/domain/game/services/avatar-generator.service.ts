import { Injectable } from '@nestjs/common';
import { createAvatar } from '@dicebear/core';
import { bottts } from '@dicebear/collection';

/**
 * Avatar Generator Service
 * Generates unique avatars for players using DiceBear
 */
@Injectable()
export class AvatarGeneratorService {
  /**
   * Generates an avatar URL for a player
   * @param seed - A unique identifier (userId as string, or guestId)
   * @param sessionId - The session ID to ensure uniqueness across sessions
   * @returns SVG data URL string for the avatar
   */
  generateAvatar(seed: string, sessionId: number): string {
    // Create a stable seed based on player seed and sessionId
    const combinedSeed = `${seed}-${sessionId}`;

    // Generate the avatar using DiceBear bottts style
    const avatar = createAvatar(bottts, {
      seed: combinedSeed,
      size: 128,
    });

    // Return as SVG data URL
    const svg = avatar.toString();
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }
}
