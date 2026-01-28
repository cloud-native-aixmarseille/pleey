import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithFormProvider } from '../../../../test-utils/render-with-form-provider';
import { usePresentationForm } from '../../../shared/forms/use-presentation-form';
import { ProfileDetailsForm } from './profile-details-form';

vi.mock('../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

function ProfileDetailsFormHarness({
  errorMessage = null,
  successMessage = null,
}: {
  errorMessage?: string | null;
  successMessage?: string | null;
}) {
  const form = usePresentationForm({
    defaultValues: { username: '', email: '' },
    onSubmit: async () => undefined,
  });

  return (
    <ProfileDetailsForm errorMessage={errorMessage} form={form} successMessage={successMessage} />
  );
}

describe('ProfileDetailsForm', () => {
  it('renders the profile fields and status banners', () => {
    renderWithFormProvider(
      <ProfileDetailsFormHarness
        errorMessage="Unable to save profile"
        successMessage="Profile updated"
      />,
    );

    expect(screen.getByText('auth.profile.detailsSection.legend')).toBeInTheDocument();
    expect(screen.getByLabelText('auth.form.usernameLabel *')).toBeInTheDocument();
    expect(screen.getByLabelText('auth.form.emailLabel *')).toBeInTheDocument();
    expect(screen.getByText('Unable to save profile')).toBeInTheDocument();
    expect(screen.getByText('Profile updated')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'auth.profile.submitCta' })).toBeInTheDocument();
  });

  it('shows validation errors when required fields blur empty', () => {
    renderWithFormProvider(<ProfileDetailsFormHarness />);

    fireEvent.blur(screen.getByLabelText('auth.form.usernameLabel *'));
    fireEvent.blur(screen.getByLabelText('auth.form.emailLabel *'));

    expect(screen.getByText('auth.form.validation.usernameRequired')).toBeInTheDocument();
    expect(screen.getByText('auth.form.validation.emailRequired')).toBeInTheDocument();
  });
});
