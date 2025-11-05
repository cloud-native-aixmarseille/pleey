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
   * @param userId - The user's ID
   * @param sessionId - The session ID to ensure uniqueness across sessions
   * @returns SVG data URL string for the avatar
   */
  generateAvatar(userId: number, sessionId: number): string {
    // Create a stable seed based on userId and sessionId
    const seed = `${userId}-${sessionId}`;

    // Generate the avatar using DiceBear bottts style
    const avatar = createAvatar(bottts, {
      seed,
      size: 128,
    });

    // Return as SVG data URL
    const svg = avatar.toString();
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }
}
