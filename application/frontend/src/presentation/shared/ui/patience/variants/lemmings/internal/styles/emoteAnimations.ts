export const LEMMINGS_EMOTE_ANIMATION_CSS = `
.lemming-emote {
  opacity: 0;
  transform: translateY(2px) scale(0.85);
}

@keyframes lemming-emote-pop {
  0% { opacity: 0; transform: translateY(2px) scale(0.85); }
  30% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes lemming-mouth-talk {
  0% { transform: scaleY(1) translateY(0); }
  50% { transform: scaleY(2.2) translateY(-0.5px); }
  100% { transform: scaleY(1) translateY(0); }
}
`;