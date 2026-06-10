import { describe, it, expect } from 'vitest';
import { UniqueUsernameGuestUsernameGeneratorAdapter } from './unique-username-guest-username-generator.adapter';

describe('UniqueUsernameGuestUsernameGeneratorAdapter', () => {
  it('generates a guest username with expected format', () => {
    // Arrange
    const adapter = new UniqueUsernameGuestUsernameGeneratorAdapter();

    // Act
    const username = adapter.generateGuestUsername();

    // Assert
    // Expected format: Word(s) with possible space, hyphen, digits
    // Examples: "Brave Cat 1234", "Self Fulfilling 1234", "Bright-Otter 1234"
    expect(username.length).toBeGreaterThan(0);
    expect(/^[A-Z]/.test(username)).toBe(true); // Starts with capital letter
  });

  it('generates different usernames on consecutive calls', () => {
    // Arrange
    const adapter = new UniqueUsernameGuestUsernameGeneratorAdapter();

    // Act
    const username1 = adapter.generateGuestUsername();
    const username2 = adapter.generateGuestUsername();
    const username3 = adapter.generateGuestUsername();

    // Assert
    // While extremely unlikely to get exact duplicates by chance, the random component
    // (4-digit suffix) should produce different usernames
    expect(username1).not.toBe(username2);
    expect(username2).not.toBe(username3);
  });

  it('generates usernames that return string type', () => {
    // Arrange
    const adapter = new UniqueUsernameGuestUsernameGeneratorAdapter();

    // Act
    const username = adapter.generateGuestUsername();

    // Assert
    expect(typeof username).toBe('string');
    expect(username.length).toBeGreaterThan(0);
  });
});
