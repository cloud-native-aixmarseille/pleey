import { ConfirmDialog } from '../../../../../shared/ui/overlay/confirm-dialog';

interface OrganizationMemberRemovalDialogProps {
  readonly cancelLabel: string;
  readonly confirmDisabled: boolean;
  readonly confirmLabel: string;
  readonly isOpen: boolean;
  readonly message: string;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
  readonly title: string;
}

export function OrganizationMemberRemovalDialog({
  cancelLabel,
  confirmDisabled,
  confirmLabel,
  isOpen,
  message,
  onCancel,
  onConfirm,
  title,
}: OrganizationMemberRemovalDialogProps) {
  return (
    <ConfirmDialog
      cancelLabel={cancelLabel}
      confirmDisabled={confirmDisabled}
      confirmLabel={confirmLabel}
      isOpen={isOpen}
      message={message}
      onCancel={onCancel}
      onConfirm={onConfirm}
      title={title}
    />
  );
}
