export interface PasswordRecoveryConfig {
  frontendUrl: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpRequireTls: boolean;
  smtpUser?: string;
  smtpPassword?: string;
  from: string;
  resetTokenLifetimeMinutes: number;
}

export const PASSWORD_RECOVERY_CONFIG = Symbol('PASSWORD_RECOVERY_CONFIG');
