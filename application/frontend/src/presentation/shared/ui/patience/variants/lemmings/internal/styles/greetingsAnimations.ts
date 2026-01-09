export const LEMMINGS_GREETINGS_ANIMATION_CSS = `
@keyframes lemming-greet-wave-right {
  0% { transform: translate3d(0, 0, 0) rotate(0deg); }
  30% { transform: translate3d(0, -3px, 0) rotate(-25deg); }
  60% { transform: translate3d(1px, -2px, 0) rotate(18deg); }
  100% { transform: translate3d(0, 0, 0) rotate(0deg); }
}

@keyframes lemming-greet-wave-left {
  0% { transform: translate3d(0, 0, 0) rotate(0deg); }
  35% { transform: translate3d(0, -2px, 0) rotate(18deg); }
  70% { transform: translate3d(-1px, -1px, 0) rotate(-12deg); }
  100% { transform: translate3d(0, 0, 0) rotate(0deg); }
}

@keyframes lemming-greet-bob {
  0% { transform: translateY(0); }
  50% { transform: translateY(-1px); }
  100% { transform: translateY(0); }
}

[data-lemming-mode=greet][data-lemming-greet-variant=wave] .lemming-hand--right {
  transform-origin: 20% 80%;
  animation: lemming-greet-wave-right 260ms ease-in-out infinite;
}

[data-lemming-mode=greet][data-lemming-greet-variant=wave] .lemming-hand--left {
  transform-origin: 80% 80%;
  animation: lemming-greet-wave-left 320ms ease-in-out infinite;
}

[data-lemming-mode=greet][data-lemming-greet-variant=wave] .lemming-head {
  animation: lemming-greet-bob 260ms ease-in-out infinite;
}

[data-lemming-mode=greet][data-lemming-greet-variant=wave] .lemming-body {
  animation: lemming-greet-bob 260ms ease-in-out infinite;
  animation-delay: 60ms;
}

@keyframes lemming-highfive-hand-left {
  0% { transform: translate3d(0,0,0) rotate(0deg) scale(1); }
  45% { transform: translate3d(4px,-2px,0) rotate(0deg) scale(1.2); }
  55% { transform: translate3d(4px,-2px,0) rotate(0deg) scale(1.25); }
  100% { transform: translate3d(0,0,0) rotate(0deg) scale(1); }
}

@keyframes lemming-highfive-hand-right {
  0% { transform: translate3d(0,0,0) rotate(0deg) scale(1); }
  45% { transform: translate3d(-4px,-2px,0) rotate(0deg) scale(1.2); }
  55% { transform: translate3d(-4px,-2px,0) rotate(0deg) scale(1.25); }
  100% { transform: translate3d(0,0,0) rotate(0deg) scale(1); }
}

@keyframes lemming-highfive-bounce {
  0% { transform: translateY(0); }
  45% { transform: translateY(-2px); }
  55% { transform: translateY(-2px); }
  100% { transform: translateY(0); }
}

[data-lemming-mode=greet][data-lemming-greet-variant=highfive] .lemming-hand--left {
  animation: lemming-highfive-hand-left 360ms ease-in-out infinite;
}

[data-lemming-mode=greet][data-lemming-greet-variant=highfive] .lemming-hand--right {
  animation: lemming-highfive-hand-right 360ms ease-in-out infinite;
}

[data-lemming-mode=greet][data-lemming-greet-variant=highfive] .lemming-head {
  animation: lemming-highfive-bounce 360ms ease-in-out infinite;
}

[data-lemming-mode=greet][data-lemming-greet-variant=highfive] .lemming-body {
  animation: lemming-highfive-bounce 360ms ease-in-out infinite;
  animation-delay: 40ms;
}

[data-lemming-mode=greet][data-lemming-greet-variant=emote] .lemming-emote {
  animation: lemming-emote-pop 280ms ease-out forwards;
  opacity: 1;
}

[data-lemming-mode=greet][data-lemming-greet-variant=emote] .lemming-mouth {
  transform-origin: 50% 50%;
  animation: lemming-mouth-talk 160ms ease-in-out infinite;
}
`;