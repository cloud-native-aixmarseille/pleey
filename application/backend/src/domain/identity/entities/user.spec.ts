import { Buffer } from 'node:buffer';
import { describe, expect, it } from 'vitest';
import { backendTestIdentifiers } from '../../../test-utils/branded-identifiers';
import { createUserFixture } from '../../../test-utils/fixtures/unit/user.fixture';
import { Media } from '../../media/entities/media';

describe('User', () => {
  describe('constructor', () => {
    it('should create a user instance with all properties', () => {
      const now = new Date();
      const user = createUserFixture({
        id: backendTestIdentifiers.user(1),
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        avatar: null,
        createdAt: now,
      });

      expect(user.id).toBe(backendTestIdentifiers.user(1));
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      expect(user.password).toBe('hashedpassword');
      expect(user.createdAt).toBe(now);
    });
  });

  describe('toSafeObject', () => {
    it('should return user object without password', () => {
      const now = new Date();
      const avatarBuffer = Buffer.from('https://cdn/avatar.png', 'utf8');
      const user = createUserFixture({
        id: backendTestIdentifiers.user(1),
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        avatar: new Media(null, 'image/svg+xml', avatarBuffer),
        createdAt: now,
      });

      const safeUser = user.toSafeObject();

      expect(safeUser).toHaveProperty('id', backendTestIdentifiers.user(1));
      expect(safeUser).toHaveProperty('username', 'testuser');
      expect(safeUser).toHaveProperty('email', 'test@example.com');
      expect(safeUser).toHaveProperty('avatar');
      expect(safeUser.avatar?.content).toBe(avatarBuffer);
      expect(safeUser).toHaveProperty('createdAt', now);
      expect(safeUser).not.toHaveProperty('password');
    });

    it('should not expose password in safe object', () => {
      const user = createUserFixture({
        id: backendTestIdentifiers.user(1),
        username: 'testuser',
        email: 'test@example.com',
        password: 'secretpassword',
        avatar: null,
        createdAt: new Date(),
      });

      const safeUser = user.toSafeObject();
      const keys = Object.keys(safeUser);

      expect(keys).not.toContain('password');
    });
  });

  describe('toProfileSnapshot', () => {
    it('maps avatar media to a profile snapshot version token', () => {
      const avatar = new Media(
        42,
        'image/svg+xml',
        Buffer.from('<svg />', 'utf8'),
        new Date('2025-01-01T00:00:00.000Z'),
        new Date('2025-01-02T00:00:00.000Z'),
      );
      const user = createUserFixture({ avatar });

      const result = user.toProfileSnapshot();

      expect(result.avatarVersion).toBe(avatar.versionToken());
    });

    it('maps missing avatar to null avatar version', () => {
      const user = createUserFixture({ avatar: null });

      const result = user.toProfileSnapshot();

      expect(result.avatarVersion).toBeNull();
    });
  });
});
