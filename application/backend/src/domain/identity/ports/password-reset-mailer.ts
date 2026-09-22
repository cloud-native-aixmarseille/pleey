export const PasswordResetMailerProvider = Symbol('PasswordResetMailer');

export interface PasswordResetMailer {
  send(email: string, token: string, locale: string): Promise<void>;
}
