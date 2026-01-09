export const LEMMINGS_IDLE_ANIMATION_CSS = `
[data-lemming-mode=idle][data-lemming-idle-variant=emote] .lemming-emote {
  animation: lemming-emote-pop 280ms ease-out forwards;
  opacity: 1;
}

[data-lemming-mode=idle][data-lemming-idle-variant=emote] .lemming-mouth {
  transform-origin: 50% 50%;
  animation: lemming-mouth-talk 160ms ease-in-out infinite;
}

@keyframes lemming-jetpack-hover {
  0% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-6px) rotate(-3deg); }
  55% { transform: translateY(-6px) rotate(-3deg); }
  100% { transform: translateY(0) rotate(0deg); }
}

@keyframes lemming-jetpack-flame {
  0% { opacity: 0; transform: scaleY(0.6); }
  25% { opacity: 1; transform: scaleY(1.2); }
  55% { opacity: 1; transform: scaleY(1.1); }
  100% { opacity: 0; transform: scaleY(0.6); }
}

@keyframes lemming-jetpack-flame-alt {
  0% { opacity: 0.15; transform: scaleY(0.7) scaleX(0.9); }
  20% { opacity: 0.65; transform: scaleY(1.25) scaleX(1.1); }
  55% { opacity: 0.45; transform: scaleY(1.05) scaleX(1); }
  100% { opacity: 0.15; transform: scaleY(0.7) scaleX(0.9); }
}

[data-lemming-mode=idle][data-lemming-idle-variant=jetpack] .lemming-sprite {
  transform-origin: 50% 100%;
  animation: lemming-jetpack-hover 520ms ease-in-out infinite;
}

[data-lemming-mode=idle][data-lemming-idle-variant=jetpack] .lemming-jetpack {
  opacity: 1;
}

.lemming-jetpack {
  opacity: 0;
}

.lemming-jetpack-flame {
  opacity: 0;
  transform-origin: 50% 0%;
}

[data-lemming-mode=idle][data-lemming-idle-variant=jetpack] .lemming-jetpack-flame {
  opacity: 1;
  animation: lemming-jetpack-flame 180ms ease-in-out infinite;
}

[data-lemming-mode=idle][data-lemming-idle-variant=jetpack] .lemming-jetpack-flame--alt {
  opacity: 1;
  animation: lemming-jetpack-flame-alt 220ms ease-in-out infinite;
}

@keyframes lemming-slip {
  0% { transform: rotate(0deg) translateY(0); }
  40% { transform: rotate(12deg) translateY(-1px); }
  80% { transform: rotate(-10deg) translateY(0); }
  100% { transform: rotate(0deg) translateY(0); }
}

@keyframes lemming-banana-back-panic {
  0% { transform: rotate(90deg) translate3d(0,1px,0); }
  15% { transform: rotate(92deg) translate3d(1px,0,0); }
  30% { transform: rotate(88deg) translate3d(-1px,0,0); }
  45% { transform: rotate(93deg) translate3d(1px,0,0); }
  60% { transform: rotate(89deg) translate3d(-1px,0,0); }
  75% { transform: rotate(92deg) translate3d(1px,0,0); }
  100% { transform: rotate(90deg) translate3d(0,1px,0); }
}

.lemming-banana {
  opacity: 0;
  transform: translateY(1px) scale(0.9);
}

[data-lemming-mode=idle][data-lemming-idle-variant=banana] .lemming-sprite {
  transform-origin: 50% 85%;
  animation: lemming-banana-back-panic 1s ease-in-out infinite;
}

[data-lemming-mode=idle][data-lemming-idle-variant=banana] .lemming-banana {
  opacity: 1;
  transform: translateY(-1px) rotate(12deg);
}

@keyframes lemming-trumpet-toot {
  0% { transform: translate3d(0,0,0) rotate(0deg); }
  30% { transform: translate3d(1px,-1px,0) rotate(-6deg); }
  60% { transform: translate3d(0,0,0) rotate(0deg); }
  100% { transform: translate3d(0,0,0) rotate(0deg); }
}

.lemming-flag {
  opacity: 0;
  transform: translateY(1px) scale(0.9);
}

[data-lemming-mode=idle][data-lemming-idle-variant=trumpet] .lemming-tool {
  transform-origin: 0% 50%;
  animation: lemming-trumpet-toot 260ms ease-in-out infinite;
}

[data-lemming-mode=idle][data-lemming-idle-variant=trumpet] .lemming-flag {
  opacity: 1;
}

@keyframes lemming-portal-spin {
  0% { transform: rotate(0deg) scale(0.9); opacity: 0.3; }
  40% { transform: rotate(120deg) scale(1.05); opacity: 0.6; }
  100% { transform: rotate(360deg) scale(0.9); opacity: 0.3; }
}

@keyframes lemming-portal-sink {
  0% { transform: scale(1); opacity: 1; }
  55% { transform: scale(0.65); opacity: 0.8; }
  100% { transform: scale(0.05); opacity: 0; }
}

.lemming-portal {
  opacity: 0;
}

[data-lemming-mode=idle][data-lemming-idle-variant=portal] .lemming-portal {
  opacity: 1;
  transform-origin: 50% 50%;
  animation: lemming-portal-spin 360ms linear infinite;
}

[data-lemming-mode=idle][data-lemming-idle-variant=portal] .lemming-sprite {
  transform-origin: 50% 90%;
  animation: lemming-portal-sink 520ms ease-in-out infinite;
}
`;