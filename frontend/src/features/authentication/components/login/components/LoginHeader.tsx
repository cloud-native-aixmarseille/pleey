import { BackToButton } from "../../../../../shared/components";

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
    <div className="text-center mb-6">
      <div className="mb-4 flex justify-center">
        <BackToButton
          label={backLabel}
          onClick={onBack}
          variant="ghost"
          tone="light"
        />
      </div>
      <h2 className="text-4xl sm:text-5xl font-black text-white mb-2">
        {title}
      </h2>
      <p className="text-light-400">{subtitle}</p>
    </div>
  );
}
