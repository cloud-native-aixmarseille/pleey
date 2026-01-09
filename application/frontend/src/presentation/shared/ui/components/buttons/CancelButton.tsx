import { useTranslation } from "react-i18next";

import { SecondaryButton, type SecondaryButtonProps } from "./SecondaryButton";

export type CancelButtonProps = Omit<SecondaryButtonProps, "children">;

export function CancelButton(props: CancelButtonProps) {
  const { t } = useTranslation();

  return <SecondaryButton {...props}>{t("common.cancel")}</SecondaryButton>;
}

export default CancelButton;
