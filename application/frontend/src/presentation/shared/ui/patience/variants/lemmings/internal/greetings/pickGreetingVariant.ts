import { pseudoRandom01 } from "../random";

export type GreetingVariant = "wave" | "highfive" | "emote";

export function pickGreetingVariant(
  i: number,
  j: number,
  timestamp: number
): { variant: GreetingVariant; emote: string | null } {
  const baseSeed = Math.floor(timestamp) + i * 97 + j * 193;
  const r = pseudoRandom01(baseSeed);

  if (r < 0.45) {
    return { variant: "wave", emote: null };
  }

  if (r < 0.8) {
    return { variant: "highfive", emote: null };
  }

  const emotes = ["👋", "🙂", "!"] as const;
  const emoteIndex = Math.floor(
    pseudoRandom01(baseSeed + 1_337) * emotes.length
  );

  return { variant: "emote", emote: emotes[emoteIndex] ?? "🙂" };
}
