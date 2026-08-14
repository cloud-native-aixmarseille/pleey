import { describe, expect, it, vi } from 'vitest';
import { readAppEnv } from './app-env-reader';

describe('readAppEnv()', () => {
  function arrangeApiUrl(value: string) {
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_API_URL', value);
  }

  it('returns the browser origin when VITE_API_URL is not set', () => {
    // Arrange + Act
    arrangeApiUrl('');

    // Assert
    try {
      const env = readAppEnv();

      expect(env.apiUrl).toBe(window.location.origin);
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('uses VITE_API_URL when set to a valid URL', () => {
    // Arrange + Act
    arrangeApiUrl('https://api.example.com');

    // Assert
    try {
      const env = readAppEnv();

      expect(env.apiUrl).toBe('https://api.example.com');
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('strips trailing slash from the API URL', () => {
    // Arrange + Act
    arrangeApiUrl('https://api.example.com/');

    // Assert
    try {
      const env = readAppEnv();

      expect(env.apiUrl).toBe('https://api.example.com');
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('trims whitespace from the API URL', () => {
    // Arrange + Act
    arrangeApiUrl('  https://api.example.com  ');

    // Assert
    try {
      const env = readAppEnv();

      expect(env.apiUrl).toBe('https://api.example.com');
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('derives graphqlPath by appending /graphql to the api URL', () => {
    // Arrange + Act
    arrangeApiUrl('https://api.example.com');

    // Assert
    try {
      const { graphqlPath } = readAppEnv();

      expect(graphqlPath).toBe('https://api.example.com/graphql');
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('derives socketPath equal to the api URL', () => {
    // Arrange + Act
    arrangeApiUrl('https://api.example.com');

    // Assert
    try {
      const { socketPath } = readAppEnv();

      expect(socketPath).toBe('https://api.example.com');
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
