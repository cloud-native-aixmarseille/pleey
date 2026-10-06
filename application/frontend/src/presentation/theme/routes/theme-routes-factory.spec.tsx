import 'reflect-metadata';
import { screen } from '@testing-library/react';
import i18next from 'i18next';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { ThemeManagementFacade } from '../../../application/workspace/themes/facades/theme-management.facade';
import { ThemeFixtureFactory } from '../../../test-utils/fixtures/theme-fixture-factory';
import { renderWithDataRouter as renderWithProviders } from '../../../test-utils/render-with-data-router';
import { ThemeRoutesTestApp } from '../../../test-utils/theme-routes-test-app';
import { sharedEn } from '../../shared/i18n/en';
import { themeEn } from '../i18n/en';

i18next.addResourceBundle('en', 'translation', sharedEn, true, true);
i18next.addResourceBundle('en', 'translation', themeEn, true, true);

vi.mock('../../identity/contexts/auth-context', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useAuth: () => ({ hasRestoredSession: true, user: null }),
}));

const fixtures = new ThemeFixtureFactory();

describe('ThemeRoutesFactory', () => {
  it('redirects anonymous visits to theme management to sign-in', async () => {
    // Arrange
    const theme = fixtures.createManagedTheme();
    const access = vi.spyOn(ThemeManagementFacade.prototype, 'permissions');
    onTestFinished(() => access.mockRestore());
    renderWithProviders(<ThemeRoutesTestApp />, {
      initialPath: `/workspace/organizations/${theme.organizationId}/themes/new`,
    });
    // Act
    const heading = await screen.findByRole('heading', { name: 'Sign in' });
    // Assert
    expect(heading).toBeInTheDocument();
    expect(access).not.toHaveBeenCalled();
  });
});
