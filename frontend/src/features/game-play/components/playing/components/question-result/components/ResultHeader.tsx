import { createStyles } from "../../../../../../../shared/ui/styles";

const styles = createStyles("ResultHeader", {
  slot1: "text-center mb-6",
  slot2: "text-7xl sm:text-8xl mb-6 animate-bounce-slow",
  slot3: "text-4xl sm:text-5xl font-black text-center font-display uppercase",
});

interface ResultHeaderProps {
  isCorrect: boolean;
  title: string;
}

export function ResultHeader({ isCorrect, title }: ResultHeaderProps) {
  return (
    <div {...styles.slot1}>
      <div {...styles.slot2}>
        {isCorrect ? "🎉" : "😢"}
      </div>
      <h3 {...styles.slot3}>
        {title}
      </h3>
    </div>
  );
}
