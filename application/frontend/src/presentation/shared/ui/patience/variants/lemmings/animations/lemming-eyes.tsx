interface SleepingEyePath {
  readonly d: string;
}

interface OpenEyeShape {
  readonly pupilCx: string;
  readonly pupilHighlightCx: string;
  readonly scleraCx: string;
}

const sleepingEyePaths = [
  { d: 'M4.5 6 Q6.5 7.6 8.5 6' },
  { d: 'M9.5 6 Q11.5 7.6 13.5 6' },
] as const satisfies readonly SleepingEyePath[];

const openEyes = [
  { pupilCx: '7', pupilHighlightCx: '6.2', scleraCx: '6.5' },
  { pupilCx: '12', pupilHighlightCx: '11.2', scleraCx: '11.5' },
] as const satisfies readonly OpenEyeShape[];

function SleepingEye({ d }: SleepingEyePath) {
  return (
    <path
      d={d}
      fill="none"
      stroke="var(--ui-color-text-emphasis)"
      strokeLinecap="round"
      strokeWidth="0.8"
    />
  );
}

function OpenEye({ pupilCx, pupilHighlightCx, scleraCx }: OpenEyeShape) {
  return (
    <>
      <ellipse cx={scleraCx} cy="6" fill="#fff" rx="2.2" ry="2.5" />
      <circle cx={pupilCx} cy="6.2" fill="var(--ui-color-text-emphasis)" r="1.2" />
      <circle cx={pupilHighlightCx} cy="5.2" fill="#fff" r="0.5" />
    </>
  );
}

export function LemmingEyes({ sleeping }: { sleeping: boolean }) {
  if (sleeping) {
    return (
      <>
        {sleepingEyePaths.map((path) => (
          <SleepingEye d={path.d} key={path.d} />
        ))}
      </>
    );
  }

  return (
    <>
      {openEyes.map((eye) => (
        <OpenEye
          key={`${eye.scleraCx}-${eye.pupilCx}`}
          pupilCx={eye.pupilCx}
          pupilHighlightCx={eye.pupilHighlightCx}
          scleraCx={eye.scleraCx}
        />
      ))}
    </>
  );
}
