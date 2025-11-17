import { Buffer } from 'node:buffer';
import { describe, it, expect, beforeEach } from 'vitest';
import { AvatarGeneratorService } from './avatar-generator.service';

describe('AvatarGeneratorService', () => {
  let service: AvatarGeneratorService;

  beforeEach(() => {
    service = new AvatarGeneratorService();
  });

  describe('generateAvatar', () => {
    it('should generate an avatar as a data URL', () => {
      const avatar = service.generateAvatar('1', 100);

      expect(avatar).toContain('data:image/svg+xml;base64,');
      expect(avatar.length).toBeGreaterThan(100);
    });

    it('should generate consistent avatars for the same user and session', () => {
      const avatar1 = service.generateAvatar('1', 100);
      const avatar2 = service.generateAvatar('1', 100);

      expect(avatar1).toBe(avatar2);
    });

    it('should generate different avatars for different users', () => {
      const avatar1 = service.generateAvatar('1', 100);
      const avatar2 = service.generateAvatar('2', 100);

      expect(avatar1).not.toBe(avatar2);
    });

    it('should generate different avatars for the same user in different sessions', () => {
      const avatar1 = service.generateAvatar('1', 100);
      const avatar2 = service.generateAvatar('1', 200);

      expect(avatar1).not.toBe(avatar2);
    });

    it('should generate avatars when sessionId is omitted', () => {
      const avatar = service.generateAvatar('seed-only');

      expect(avatar).toContain('data:image/svg+xml;base64,');
      expect(avatar.length).toBeGreaterThan(100);
    });

    it('should generate valid base64 encoded SVG', () => {
      const avatar = service.generateAvatar('1', 100);
      const base64Part = avatar.replace('data:image/svg+xml;base64,', '');

      const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');

      expect(decoded).toContain('<svg');
      expect(decoded).toContain('</svg>');
    });
  });
});
