import { BackToButton } from "../../../../../shared/components";
import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("LoginHeader", {
  slot1: "text-center mb-6",
  slot2: "mb-4 flex justify-center",
  slot3: "text-4xl sm:text-5xl font-black text-white mb-2",
  slot4: "text-light-400",
});


interface LoginHeaderProps {
  title: string;
  subtitle: string;
  backLabel: string;
  onBack: () => void;
}

export function LoginHeader({
  title,
  subtitle,
  backLabel,
  onBack,
}: LoginHeaderProps) {
  return (
    <div {...styles.slot1}>
      <div {...styles.slot2}>
        <BackToButton
          label={backLabel}
          onClick={onBack}
          variant="ghost"
          tone="light"
        />
      </div>
      <h2 {...styles.slot3}>
        {title}
      </h2>
      <p {...styles.slot4}>{subtitle}</p>
    </div>
  );
}
