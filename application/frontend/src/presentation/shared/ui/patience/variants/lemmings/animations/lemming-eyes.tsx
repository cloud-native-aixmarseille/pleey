export function LemmingEyes({ sleeping }: { sleeping: boolean }) {
  if (sleeping) {
    return (
      <>
        <path
          d="M4.5 6 Q6.5 7.6 8.5 6"
          fill="none"
          stroke="var(--ui-color-text-emphasis)"
          strokeLinecap="round"
          strokeWidth="0.8"
        />
        <path
          d="M9.5 6 Q11.5 7.6 13.5 6"
          fill="none"
          stroke="var(--ui-color-text-emphasis)"
          strokeLinecap="round"
          strokeWidth="0.8"
        />
      </>
    );
  }

  return (
    <>
      <ellipse cx="6.5" cy="6" fill="#fff" rx="2.2" ry="2.5" />
      <circle cx="7" cy="6.2" fill="var(--ui-color-text-emphasis)" r="1.2" />
      <circle cx="6.2" cy="5.2" fill="#fff" r="0.5" />

      <ellipse cx="11.5" cy="6" fill="#fff" rx="2.2" ry="2.5" />
      <circle cx="12" cy="6.2" fill="var(--ui-color-text-emphasis)" r="1.2" />
      <circle cx="11.2" cy="5.2" fill="#fff" r="0.5" />
    </>
  );
}
