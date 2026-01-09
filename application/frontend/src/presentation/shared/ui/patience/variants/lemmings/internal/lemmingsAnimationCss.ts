import { LEMMINGS_EMOTE_ANIMATION_CSS } from "./styles/emoteAnimations";
import { LEMMINGS_FALL_ANIMATION_CSS } from "./styles/fallAnimations";
import { LEMMINGS_GREETINGS_ANIMATION_CSS } from "./styles/greetingsAnimations";
import { LEMMINGS_IDLE_ANIMATION_CSS } from "./styles/idleAnimations";
import { LEMMINGS_WALK_ANIMATION_CSS } from "./styles/walkAnimations";

export const LEMMINGS_ANIMATION_CSS = [
  LEMMINGS_WALK_ANIMATION_CSS,
  LEMMINGS_EMOTE_ANIMATION_CSS,
  LEMMINGS_GREETINGS_ANIMATION_CSS,
  LEMMINGS_IDLE_ANIMATION_CSS,
  LEMMINGS_FALL_ANIMATION_CSS,
].join("\n");
