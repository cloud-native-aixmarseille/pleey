export interface GuestUsernameGeneratorPort {
  generateGuestUsername(): string;
}

export const GuestUsernameGeneratorPortToken = Symbol('GuestUsernameGeneratorPort');
