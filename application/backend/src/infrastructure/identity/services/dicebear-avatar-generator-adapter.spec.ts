import { describe, expect, it } from 'vitest';
import { DicebearAvatarGeneratorAdapter } from './dicebear-avatar-generator-adapter';

describe('DicebearAvatarGeneratorAdapter', () => {
  function arrangeService() {
    return new DicebearAvatarGeneratorAdapter();
  }

  describe('generateAvatar', () => {
    it('should generate avatar media', () => {
      // Arrange
      const service = arrangeService();
      // Act
      const avatar = service.generateAvatar('1');

      // Assert
      expect(avatar.mimeType).toBe('image/svg+xml');
      expect(avatar.content.toString('utf8')).toContain('<svg');
    });

    it('should generate consistent avatars for the same seed', () => {
      // Arrange
      const service = arrangeService();
      const avatar1 = service.generateAvatar('1');
      // Act
      const avatar2 = service.generateAvatar('1');

      // Assert
      expect(avatar1.content.equals(avatar2.content)).toBe(true);
    });

    it('should generate different avatars for different users', () => {
      // Arrange
      const service = arrangeService();
      const avatar1 = service.generateAvatar('1');
      // Act
      const avatar2 = service.generateAvatar('2');

      // Assert
      expect(avatar1.content.equals(avatar2.content)).toBe(false);
    });

    it('should generate avatars when seed is provided', () => {
      // Arrange
      const service = arrangeService();
      // Act
      const avatar = service.generateAvatar('seed-only');

      // Assert
      expect(avatar.content.toString('utf8')).toContain('<svg');
    });

    it('should generate valid SVG content', () => {
      // Arrange
      const service = arrangeService();
      const avatar = service.generateAvatar('1');
      // Act
      const svg = avatar.content.toString('utf8');

      // Assert
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });
  });
});
