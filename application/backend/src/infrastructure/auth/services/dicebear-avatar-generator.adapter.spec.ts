import { Buffer } from 'node:buffer';
import { beforeEach, describe, expect, it } from 'vitest';
import { DicebearAvatarGeneratorAdapter } from './dicebear-avatar-generator.adapter';

describe('DicebearAvatarGeneratorAdapter', () => {
  let service: DicebearAvatarGeneratorAdapter;

  beforeEach(() => {
    service = new DicebearAvatarGeneratorAdapter();
  });

  describe('generateAvatar', () => {
    it('should generate an avatar as a buffer', () => {
      const avatar = service.generateAvatar('1');

      expect(Buffer.isBuffer(avatar)).toBe(true);
      expect(avatar.toString('utf8')).toContain('data:image/svg+xml;');
    });

    it('should generate consistent avatars for the same seed', () => {
      const avatar1 = service.generateAvatar('1');
      const avatar2 = service.generateAvatar('1');

      expect(avatar1.equals(avatar2)).toBe(true);
    });

    it('should generate different avatars for different users', () => {
      const avatar1 = service.generateAvatar('1');
      const avatar2 = service.generateAvatar('2');

      expect(avatar1.equals(avatar2)).toBe(false);
    });

    it('should generate avatars when seed is provided', () => {
      const avatar = service.generateAvatar('seed-only');

      expect(Buffer.isBuffer(avatar)).toBe(true);
      expect(avatar.toString('utf8')).toContain('data:image/svg+xml;');
    });

    it('should generate valid SVG content', () => {
      const avatar = service.generateAvatar('1');
      const dataUri = avatar.toString('utf-8');
      const prefix = 'data:image/svg+xml;utf8,';
      expect(dataUri.startsWith(prefix)).toBe(true);
      const payload = dataUri.slice(prefix.length);
      const decoded = decodeURIComponent(payload);

      expect(decoded).toContain('<svg');
      expect(decoded).toContain('</svg>');
    });
  });
});
