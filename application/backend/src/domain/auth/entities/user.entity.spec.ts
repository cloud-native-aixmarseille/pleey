import { Buffer } from 'node:buffer';
import { describe, expect, it } from 'vitest';
import { createUserFixture } from '../../../test-utils/fixtures/unit';

describe('User Entity', () => {
  describe('constructor', () => {
    it('should create a user instance with all properties', () => {
      const now = new Date();
      const user = createUserFixture({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        isAdmin: false,
        avatarUri: null,
        createdAt: now,
      });

      expect(user.id).toBe(1);
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      expect(user.password).toBe('hashedpassword');
      expect(user.isAdmin).toBe(false);
      expect(user.createdAt).toBe(now);
    });
  });

  describe('hasAdminPrivileges', () => {
    it('should return true for admin users', () => {
      const user = createUserFixture({
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        password: 'hashedpassword',
        isAdmin: true,
        avatarUri: null,
        createdAt: new Date(),
      });

      expect(user.hasAdminPrivileges()).toBe(true);
    });

    it('should return false for non-admin users', () => {
      const user = createUserFixture({
        id: 1,
        username: 'user',
        email: 'user@example.com',
        password: 'hashedpassword',
        isAdmin: false,
        avatarUri: null,
        createdAt: new Date(),
      });

      expect(user.hasAdminPrivileges()).toBe(false);
    });
  });

  describe('toSafeObject', () => {
    it('should return user object without password', () => {
      const now = new Date();
      const avatarBuffer = Buffer.from('https://cdn/avatar.png', 'utf8');
      const user = createUserFixture({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        isAdmin: false,
        avatarUri: avatarBuffer,
        createdAt: now,
      });

      const safeUser = user.toSafeObject();

      expect(safeUser).toHaveProperty('id', 1);
      expect(safeUser).toHaveProperty('username', 'testuser');
      expect(safeUser).toHaveProperty('email', 'test@example.com');
      expect(safeUser).toHaveProperty('isAdmin', false);
      expect(safeUser).toHaveProperty('avatarUri', avatarBuffer);
      expect(safeUser).toHaveProperty('createdAt', now);
      expect(safeUser).not.toHaveProperty('password');
    });

    it('should not expose password in safe object', () => {
      const user = createUserFixture({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'secretpassword',
        isAdmin: false,
        avatarUri: null,
        createdAt: new Date(),
      });

      const safeUser = user.toSafeObject();
      const keys = Object.keys(safeUser);

      expect(keys).not.toContain('password');
    });
  });
});
