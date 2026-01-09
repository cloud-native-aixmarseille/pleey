export const LEMMINGS_WALK_ANIMATION_CSS = `
@keyframes lemming-footstep {
  0% { transform: translateY(0); }
  50% { transform: translateY(-1px); }
  100% { transform: translateY(0); }
}

[data-lemming-mode=walk] .lemming-foot--left {
  animation: lemming-footstep 220ms linear infinite;
}

[data-lemming-mode=walk] .lemming-foot--right {
  animation: lemming-footstep 220ms linear infinite;
  animation-delay: 110ms;
}
`;