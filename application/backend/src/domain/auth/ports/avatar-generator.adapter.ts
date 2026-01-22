import type { Buffer } from 'node:buffer';

export const AvatarGeneratorAdapterProvider = Symbol('AvatarGeneratorAdapter');

export interface AvatarGeneratorAdapter {
  generateAvatar(seed: string): Buffer;
}
