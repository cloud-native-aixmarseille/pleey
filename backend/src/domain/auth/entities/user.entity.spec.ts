import { describe, it, expect } from 'vitest';
import { User } from './user.entity';

describe('User Entity', () => {
  describe('constructor', () => {
    it('should create a user instance with all properties', () => {
      const now = new Date();
      const user = new User(
        1,
        'testuser',
        'test@example.com',
        'hashedpassword',
        false,
        now,
      );

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
      const user = new User(
        1,
        'admin',
        'admin@example.com',
        'hashedpassword',
        true,
        new Date(),
      );

      expect(user.hasAdminPrivileges()).toBe(true);
    });

    it('should return false for non-admin users', () => {
      const user = new User(
        1,
        'user',
        'user@example.com',
        'hashedpassword',
        false,
        new Date(),
      );

      expect(user.hasAdminPrivileges()).toBe(false);
    });
  });

  describe('toSafeObject', () => {
    it('should return user object without password', () => {
      const now = new Date();
      const user = new User(
        1,
        'testuser',
        'test@example.com',
        'hashedpassword',
        false,
        now,
      );

      const safeUser = user.toSafeObject();

      expect(safeUser).toHaveProperty('id', 1);
      expect(safeUser).toHaveProperty('username', 'testuser');
      expect(safeUser).toHaveProperty('email', 'test@example.com');
      expect(safeUser).toHaveProperty('isAdmin', false);
      expect(safeUser).toHaveProperty('createdAt', now);
      expect(safeUser).not.toHaveProperty('password');
    });

    it('should not expose password in safe object', () => {
      const user = new User(
        1,
        'testuser',
        'test@example.com',
        'secretpassword',
        false,
        new Date(),
      );

      const safeUser = user.toSafeObject();
      const keys = Object.keys(safeUser);

      expect(keys).not.toContain('password');
    });
  });
});
