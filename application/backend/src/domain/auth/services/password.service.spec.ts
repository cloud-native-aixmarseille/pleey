import { beforeEach, describe, expect, it } from 'vitest';
import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(() => {
    service = new PasswordService();
  });

  describe('hash', () => {
    it('should hash a password', async () => {
      const password = 'mypassword123';
      const hash = await service.hash(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'mypassword123';
      const hash1 = await service.hash(password);
      const hash2 = await service.hash(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should hash empty string', async () => {
      const hash = await service.hash('');
      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe('compare', () => {
    it('should return true for matching password and hash', async () => {
      const password = 'mypassword123';
      const hash = await service.hash(password);
      const result = await service.compare(password, hash);

      expect(result).toBe(true);
    });

    it('should return false for non-matching password and hash', async () => {
      const password = 'mypassword123';
      const wrongPassword = 'wrongpassword';
      const hash = await service.hash(password);
      const result = await service.compare(wrongPassword, hash);

      expect(result).toBe(false);
    });

    it('should return false for empty password against hash', async () => {
      const password = 'mypassword123';
      const hash = await service.hash(password);
      const result = await service.compare('', hash);

      expect(result).toBe(false);
    });

    it('should handle special characters in password', async () => {
      const password = 'P@ssw0rd!#$%';
      const hash = await service.hash(password);
      const result = await service.compare(password, hash);

      expect(result).toBe(true);
    });
  });

  describe('isValidPassword', () => {
    it('should return true for password with 6 characters', () => {
      expect(service.isValidPassword('123456')).toBe(true);
    });

    it('should return true for password longer than 6 characters', () => {
      expect(service.isValidPassword('mypassword123')).toBe(true);
    });

    it('should return false for password shorter than 6 characters', () => {
      expect(service.isValidPassword('12345')).toBe(false);
    });

    it('should return false for empty password', () => {
      expect(service.isValidPassword('')).toBe(false);
    });

    it('should accept passwords with special characters', () => {
      expect(service.isValidPassword('P@ssw0rd!')).toBe(true);
    });
  });
});
