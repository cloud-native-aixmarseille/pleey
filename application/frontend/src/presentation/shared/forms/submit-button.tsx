import type { SubmitButtonProps } from '../../../application/shared/contracts/form.port';
import { Button } from '../ui/actions/button';
import { useFormContext } from './form-context';

export function SubmitButton({
  disabled = false,
  intent,
  label,
  size,
  submittingLabel,
  width,
}: SubmitButtonProps) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button
          disabled={disabled || isSubmitting}
          intent={intent}
          size={size}
          type="submit"
          width={width}
        >
          {isSubmitting && submittingLabel ? submittingLabel : label}
        </Button>
      )}
    </form.Subscribe>
  );
}
