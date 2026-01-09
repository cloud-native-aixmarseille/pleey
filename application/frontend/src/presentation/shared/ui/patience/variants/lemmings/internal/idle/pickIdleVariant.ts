import { pseudoRandom01 } from "../random";

export type IdleVariant = "emote" | "jetpack" | "banana" | "trumpet" | "portal";

export function pickIdleVariant(
  index: number,
  timestamp: number
): { variant: IdleVariant; emote: string | null } {
  const baseSeed = Math.floor(timestamp) + index * 271;
  const variants: Array<IdleVariant> = [
    "emote",
    "jetpack",
    "banana",
    "trumpet",
    "portal",
  ];

  const variantIndex = Math.floor(pseudoRandom01(baseSeed) * variants.length);
  const variant = variants[variantIndex] ?? "emote";

  if (variant !== "emote") {
    return { variant, emote: null };
  }

  const emotes = ["!", "?", "♥", "👋", "Zzz"] as const;
  const emoteIndex = Math.floor(
    pseudoRandom01(baseSeed + 1_337) * emotes.length
  );
  return { variant: "emote", emote: emotes[emoteIndex] ?? "!" };
}
