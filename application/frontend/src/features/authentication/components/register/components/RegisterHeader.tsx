import { BackToButton } from "../../../../../shared/components";

const HEADER_CONTAINER_CLASSES = "mb-6 text-center";
const HEADER_BACK_WRAPPER_CLASSES = "mb-4 flex justify-center";
const HEADER_TITLE_CLASSES = "mb-2 text-4xl font-black text-white sm:text-5xl";
const HEADER_SUBTITLE_CLASSES = "text-light-400";

interface RegisterHeaderProps {
  title: string;
  subtitle: string;
  backLabel: string;
  onBack: () => void;
}

export function RegisterHeader({
  title,
  subtitle,
  backLabel,
  onBack,
}: RegisterHeaderProps) {
  return (
    <div className={HEADER_CONTAINER_CLASSES}>
      <div className={HEADER_BACK_WRAPPER_CLASSES}>
        <BackToButton
          label={backLabel}
          onClick={onBack}
          variant="ghost"
          tone="light"
        />
      </div>
      <h2 className={HEADER_TITLE_CLASSES}>{title}</h2>
      <p className={HEADER_SUBTITLE_CLASSES}>{subtitle}</p>
    </div>
  );
}
