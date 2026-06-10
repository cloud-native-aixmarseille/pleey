export interface PrivatePartyPasswordGeneratorPort {
  generatePrivatePartyPassword(): string;
}

export const PrivatePartyPasswordGeneratorPortToken = Symbol('PrivatePartyPasswordGeneratorPort');
