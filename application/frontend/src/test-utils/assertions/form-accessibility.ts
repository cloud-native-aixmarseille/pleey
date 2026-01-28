import { screen } from '@testing-library/react';
import { expect } from 'vitest';

interface AccessibleFieldExpectation {
  readonly label: string;
  readonly description?: string;
  readonly error?: string;
}

export function expectAccessibleField({
  description,
  error,
  label,
}: AccessibleFieldExpectation): HTMLElement {
  const field = screen.getByLabelText(label);
  const describedByIds: string[] = [];

  if (description) {
    const descriptionElement = screen.getByText(description);
    const descriptionId = descriptionElement.getAttribute('id');
    expect(descriptionId).toBeTruthy();
    describedByIds.push(descriptionId ?? '');
  }

  if (error) {
    const errorElement = screen.getByRole('alert', { name: '' });
    expect(errorElement).toHaveTextContent(error);
    const errorId = errorElement.getAttribute('id');
    expect(errorId).toBeTruthy();
    describedByIds.push(errorId ?? '');
    expect(field).toHaveAttribute('aria-invalid', 'true');
  }

  if (describedByIds.length > 0) {
    const ariaDescribedBy = field.getAttribute('aria-describedby');

    expect(ariaDescribedBy).toBeTruthy();
    expect(ariaDescribedBy?.split(/\s+/).filter(Boolean).sort()).toEqual(
      [...describedByIds].sort(),
    );
  }

  return field;
}
