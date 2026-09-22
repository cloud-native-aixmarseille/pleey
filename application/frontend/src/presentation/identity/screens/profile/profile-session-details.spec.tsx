import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UserSessionFixtureFactory } from '../../../../test-utils/fixtures/user-session-fixture-factory';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { ProfileSessionDetails } from './profile-session-details';

vi.mock('../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );
  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('ProfileSessionDetails', () => {
  it('shows browser, system, sign-in address and semantic audit timestamps', () => {
    // Arrange
    const session = new UserSessionFixtureFactory().create();

    // Act
    renderWithUiProvider(<ProfileSessionDetails session={session} />);

    // Assert
    expect(screen.getByText(/browser=auth.profile.sessions.browser.chrome/)).toHaveTextContent(
      'system=auth.profile.sessions.system.linux',
    );
    expect(screen.getByText(session.ipAddress as string)).toBeInTheDocument();
    expect(screen.getAllByRole('time').map((time) => time.getAttribute('datetime'))).toEqual([
      session.createdAt,
      session.lastActiveAt,
      session.expiresAt,
    ]);
  });

  it('labels unavailable legacy metadata without inventing a device or sign-in date', () => {
    // Arrange
    const session = new UserSessionFixtureFactory().create({
      createdAt: null,
      lastActiveAt: null,
      userAgent: null,
      ipAddress: null,
    });

    // Act
    renderWithUiProvider(<ProfileSessionDetails session={session} />);

    // Assert
    expect(screen.getAllByText('auth.profile.sessions.unavailable')).toHaveLength(3);
    expect(screen.getByText(/browser=auth.profile.sessions.browser.unknown/)).toBeInTheDocument();
    expect(screen.getByRole('time')).toHaveAttribute('datetime', session.expiresAt);
  });
});
