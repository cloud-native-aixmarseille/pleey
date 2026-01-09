import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Modal } from "./Modal";
import { CancelButton } from "./buttons/CancelButton";
import { DangerButton } from "./buttons/DangerButton";
import { PrimaryButton } from "./buttons/PrimaryButton";

export type ConfirmModalVariant = "danger" | "primary";

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  body?: ReactNode;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
  confirmLabel: string;
  isProcessing?: boolean;
  variant?: ConfirmModalVariant;
}

const DEFAULT_BODY_CLASSES = "text-2xl";

export function ConfirmModal({
  isOpen,
  title,
  description,
  body,
  onCancel,
  onConfirm,
  confirmLabel,
  isProcessing = false,
  variant = "danger",
}: ConfirmModalProps) {
  const { t } = useTranslation();
  const ConfirmButton = variant === "primary" ? PrimaryButton : DangerButton;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      description={description}
      titleClassName="text-4xl sm:text-5xl"
      descriptionClassName="text-2xl"
      contentClassName="text-2xl"
      footer={
        <>
          <CancelButton
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
          />
          <ConfirmButton
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? t("common.loading") : confirmLabel}
          </ConfirmButton>
        </>
      }
    >
      {body ? <p className={DEFAULT_BODY_CLASSES}>{body}</p> : null}
    </Modal>
  );
}
