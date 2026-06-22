import type { ComponentProps } from 'react';
import { Button } from '../../../../shared/ui/actions/button';
import { AppIcon } from '../../../../shared/ui/icons/app-icon';
import { Tooltip } from '../../../../shared/ui/overlay/tooltip';

type PlayableManagementActionIconName = ComponentProps<typeof AppIcon>['name'];

interface PlayableManagementIconActionButtonProps {
  readonly disabled?: boolean;
  readonly iconName: PlayableManagementActionIconName;
  readonly label: string;
  readonly onClick: () => void;
  readonly stopPropagation?: boolean;
  readonly tooltipLabel?: string;
}

export function PlayableManagementIconActionButton({
  disabled = false,
  iconName,
  label,
  onClick,
  stopPropagation = false,
  tooltipLabel,
}: PlayableManagementIconActionButtonProps) {
  const button = (
    <span>
      <Button
        disabled={disabled}
        intent="ghost"
        leftSection={<AppIcon name={iconName} size={14} />}
        onClick={(event) => {
          if (stopPropagation) {
            event.stopPropagation();
          }

          onClick();
        }}
        size="sm"
      >
        {label}
      </Button>
    </span>
  );

  if (!tooltipLabel) {
    return button;
  }

  return <Tooltip label={tooltipLabel}>{button}</Tooltip>;
}
