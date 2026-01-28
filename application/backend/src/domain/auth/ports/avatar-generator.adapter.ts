import type { Media } from '../../media/entities/media';

export const AvatarGeneratorAdapterProvider = Symbol('AvatarGeneratorAdapter');

export interface AvatarGeneratorAdapter {
  generateAvatar(seed: string): Media;
}
