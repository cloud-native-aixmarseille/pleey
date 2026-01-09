import { useTranslation } from "react-i18next";

import { PrimaryButton, type PrimaryButtonProps } from "./PrimaryButton";

export type SaveButtonProps = Omit<PrimaryButtonProps, "children"> & {
  isLoading?: boolean;
};

export function SaveButton({ isLoading = false, ...props }: SaveButtonProps) {
  const { t } = useTranslation();

  return (
    <PrimaryButton {...props}>
      {isLoading ? t("common.loading") : t("common.save")}
    </PrimaryButton>
  );
}

export default SaveButton;
