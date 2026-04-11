import { useState } from 'react';
import { Button } from '../../../../../../shared/ui/actions/button';
import { ConfirmDialog } from '../../../../../../shared/ui/overlay/confirm-dialog';

interface ProtectedLeavePartyActionProps {
  readonly cancelLabel: string;
  readonly confirmLabel: string;
  readonly dialogMessage: string;
  readonly dialogTitle: string;
  readonly leaveLabel: string;
  readonly onLeaveParty: () => void;
}

export function ProtectedLeavePartyAction({
  cancelLabel,
  confirmLabel,
  dialogMessage,
  dialogTitle,
  leaveLabel,
  onLeaveParty,
}: ProtectedLeavePartyActionProps) {
  const [isLeaveConfirmationOpen, setIsLeaveConfirmationOpen] = useState(false);

  const handleRequestLeave = () => {
    setIsLeaveConfirmationOpen(true);
  };

  const handleCancelLeave = () => {
    setIsLeaveConfirmationOpen(false);
  };

  const handleConfirmLeave = () => {
    setIsLeaveConfirmationOpen(false);
    onLeaveParty();
  };

  return (
    <>
      <Button intent="ghost" onClick={handleRequestLeave} size="sm">
        {leaveLabel}
      </Button>

      <ConfirmDialog
        cancelLabel={cancelLabel}
        confirmLabel={confirmLabel}
        isOpen={isLeaveConfirmationOpen}
        message={dialogMessage}
        onCancel={handleCancelLeave}
        onConfirm={handleConfirmLeave}
        title={dialogTitle}
      />
    </>
  );
}
