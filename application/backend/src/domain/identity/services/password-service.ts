import { Injectable } from '@nestjs/common';
import { isPasswordInputWithinUtf8ByteLimit, PASSWORD_INPUT_MIN_LENGTH } from '@pleey/domain/identity';
import * as bcrypt from 'bcryptjs';

/**
 * Password Service
 * Handles password hashing and verification
 */
@Injectable()
export class PasswordService {
  private readonly saltRounds = 10;

  /**
   * Hashes a plain text password
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Compares a plain text password with a hash
   */
  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Validates password strength
   */
  isValidPassword(password: string): boolean {
    return (
      password.length >= PASSWORD_INPUT_MIN_LENGTH &&
      isPasswordInputWithinUtf8ByteLimit(password) &&
      !bcrypt.truncates(password)
    );
  }
}
