export const LEMMINGS_FALL_ANIMATION_CSS = `
.lemming-parachute {
  opacity: 0;
}

@keyframes lemming-parachute-sway {
  0% { transform: translateX(0) rotate(0deg); }
  50% { transform: translateX(1px) rotate(2deg); }
  100% { transform: translateX(0) rotate(0deg); }
}

[data-lemming-mode=fall] .lemming-parachute {
  opacity: 1;
  transform-origin: 50% 0%;
  animation: lemming-parachute-sway 420ms ease-in-out infinite;
}
`;