import { describe, expect, it, vi } from 'vitest';
import { CryptoPrivatePartyPasswordGeneratorAdapter } from './crypto-private-party-password-generator.adapter';

describe('CryptoPrivatePartyPasswordGeneratorAdapter', () => {
  it('generates a 12-character password with valid alphabet characters', () => {
    // Arrange
    const adapter = new CryptoPrivatePartyPasswordGeneratorAdapter();

    // Act
    const password = adapter.generatePrivatePartyPassword();

    // Assert
    expect(password).toHaveLength(12);
    expect(/^[ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%*]+$/.test(password)).toBe(
      true,
    );
  });

  it('generates different passwords on consecutive calls', () => {
    // Arrange
    const adapter = new CryptoPrivatePartyPasswordGeneratorAdapter();

    // Act
    const password1 = adapter.generatePrivatePartyPassword();
    const password2 = adapter.generatePrivatePartyPassword();
    const password3 = adapter.generatePrivatePartyPassword();

    // Assert
    expect(password1).not.toBe(password2);
    expect(password2).not.toBe(password3);
    expect(password1).not.toBe(password3);
  });

  it('generates a non-empty string', () => {
    // Arrange
    const adapter = new CryptoPrivatePartyPasswordGeneratorAdapter();

    // Act
    const password = adapter.generatePrivatePartyPassword();

    // Assert
    expect(password.length).toBeGreaterThan(0);
  });
});
