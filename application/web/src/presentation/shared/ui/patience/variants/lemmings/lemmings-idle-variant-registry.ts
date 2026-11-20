import { bananaIdleConfig } from './animations/lemming-banana';
import { emoteIdleConfig } from './animations/lemming-emote-config';
import { jetpackIdleConfig } from './animations/lemming-jetpack';
import { portalIdleConfig } from './animations/lemming-portal';
import { trumpetIdleConfig } from './animations/lemming-trumpet';

export type IdleVariant = 'emote' | 'jetpack' | 'banana' | 'trumpet' | 'portal';

export interface IdleVariantConfig {
  readonly durationMs: number;
  readonly emotes: ReadonlyArray<string> | null;
  readonly jitterMs: number;
  readonly variant: IdleVariant;
}

export const IDLE_VARIANT_REGISTRY: ReadonlyArray<IdleVariantConfig> = [
  emoteIdleConfig,
  jetpackIdleConfig,
  bananaIdleConfig,
  trumpetIdleConfig,
  portalIdleConfig,
];
