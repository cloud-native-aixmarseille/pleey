import { beforeEach, describe, expect, it } from 'vitest';
import { DicebearAvatarGeneratorAdapter } from './dicebear-avatar-generator-adapter';

describe('DicebearAvatarGeneratorAdapter', () => {
  let service: DicebearAvatarGeneratorAdapter;

  beforeEach(() => {
    service = new DicebearAvatarGeneratorAdapter();
  });

  describe('generateAvatar', () => {
    it('should generate avatar media', () => {
      const avatar = service.generateAvatar('1');

      expect(avatar.mimeType).toBe('image/svg+xml');
      expect(avatar.content.toString('utf8')).toContain('<svg');
    });

    it('should generate consistent avatars for the same seed', () => {
      const avatar1 = service.generateAvatar('1');
      const avatar2 = service.generateAvatar('1');

      expect(avatar1.content.equals(avatar2.content)).toBe(true);
    });

    it('should generate different avatars for different users', () => {
      const avatar1 = service.generateAvatar('1');
      const avatar2 = service.generateAvatar('2');

      expect(avatar1.content.equals(avatar2.content)).toBe(false);
    });

    it('should generate avatars when seed is provided', () => {
      const avatar = service.generateAvatar('seed-only');

      expect(avatar.content.toString('utf8')).toContain('<svg');
    });

    it('should generate valid SVG content', () => {
      const avatar = service.generateAvatar('1');
      const svg = avatar.content.toString('utf8');

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });
  });
});
