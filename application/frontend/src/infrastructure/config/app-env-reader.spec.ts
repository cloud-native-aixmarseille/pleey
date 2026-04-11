import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppEnvReader } from './app-env-reader';

describe('AppEnvReader', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('read()', () => {
    it('returns the browser origin when VITE_API_URL is not set', () => {
      // Arrange
      vi.stubEnv('VITE_API_URL', '');
      const reader = new AppEnvReader();

      // Act
      const env = reader.read();

      // Assert
      expect(env.apiUrl).toBe(window.location.origin);
    });

    it('uses VITE_API_URL when set to a valid URL', () => {
      // Arrange
      vi.stubEnv('VITE_API_URL', 'https://api.example.com');
      const reader = new AppEnvReader();

      // Act
      const env = reader.read();

      // Assert
      expect(env.apiUrl).toBe('https://api.example.com');
    });

    it('strips trailing slash from the API URL', () => {
      // Arrange
      vi.stubEnv('VITE_API_URL', 'https://api.example.com/');
      const reader = new AppEnvReader();

      // Act
      const env = reader.read();

      // Assert
      expect(env.apiUrl).toBe('https://api.example.com');
    });

    it('trims whitespace from the API URL', () => {
      // Arrange
      vi.stubEnv('VITE_API_URL', '  https://api.example.com  ');
      const reader = new AppEnvReader();

      // Act
      const env = reader.read();

      // Assert
      expect(env.apiUrl).toBe('https://api.example.com');
    });

    it('derives graphqlPath by appending /graphql to the api URL', () => {
      // Arrange
      vi.stubEnv('VITE_API_URL', 'https://api.example.com');
      const reader = new AppEnvReader();

      // Act
      const { graphqlPath } = reader.read();

      // Assert
      expect(graphqlPath).toBe('https://api.example.com/graphql');
    });

    it('derives socketPath equal to the api URL', () => {
      // Arrange
      vi.stubEnv('VITE_API_URL', 'https://api.example.com');
      const reader = new AppEnvReader();

      // Act
      const { socketPath } = reader.read();

      // Assert
      expect(socketPath).toBe('https://api.example.com');
    });
  });
});
