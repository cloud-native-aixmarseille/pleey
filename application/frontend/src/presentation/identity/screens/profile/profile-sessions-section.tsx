import { useId, useState } from 'react';
import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../shared/ui/actions/button';
import { Badge } from '../../../shared/ui/feedback/badge';
import { StatusBanner } from '../../../shared/ui/feedback/status-banner';
import { ActionRow, ContentStack, SplitWrapRow } from '../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../shared/ui/layout/panels';
import { Heading, SupportingText } from '../../../shared/ui/layout/typography';
import { ConfirmDialog } from '../../../shared/ui/overlay/confirm-dialog';
import { useAuth } from '../../contexts/auth-context';
import { ProfileSessionDetails } from './profile-session-details';
import { ProfileSignOutSection } from './profile-sign-out-section';
import { sessionClientLabels } from './session-client-labels';
import { useProfileSessions } from './use-profile-sessions';

export function ProfileSessionsSection({ active }: { readonly active: boolean }) {
  const { signOut } = useAuth();
  const { t } = usePresentationTranslation();
  const titleId = useId();
  const state = useProfileSessions(active);
  const [confirmation, setConfirmation] = useState<{ sessionId: string | null } | null>(null);
  const page = state.result?.otherSessions;
  const disabled = state.loading || state.mutating;

  async function confirmRevoke() {
    if (confirmation && (await state.revoke(confirmation.sessionId))) setConfirmation(null);
  }

  return (
    <ContentStack gap="xl">
      <ProfileSignOutSection onSignOut={signOut}>
        {state.result && (
          <InsetPanel>
            <ContentStack gap="md">
              <ActionRow>
                <Badge tone="success">{t('auth.profile.sessions.current')}</Badge>
              </ActionRow>
              <ProfileSessionDetails session={state.result.currentSession} />
            </ContentStack>
          </InsetPanel>
        )}
        {state.loading && <p role="status">{t('auth.profile.sessions.loading')}</p>}
        <StatusBanner tone="error">{state.failed ? t('auth.profile.sessions.loadError') : null}</StatusBanner>
      </ProfileSignOutSection>
      <section aria-labelledby={titleId} aria-busy={state.loading}>
        <ContentStack gap="lg">
          <SplitWrapRow>
            <Heading id={titleId} level={3}>
              {t('auth.profile.sessions.otherTitle')}
            </Heading>
            <Button disabled={disabled} intent="ghost" onClick={state.refresh} size="sm">
              {t('auth.profile.sessions.refresh')}
            </Button>
          </SplitWrapRow>
          <SupportingText>{t('auth.profile.sessions.description')}</SupportingText>
          <StatusBanner tone="success">{state.succeeded ? t('auth.profile.sessions.revoked') : null}</StatusBanner>
          {page?.totalCount === 0 && <SupportingText>{t('auth.profile.sessions.empty')}</SupportingText>}
          {page && page.totalCount > 0 && (
            <>
              <SplitWrapRow>
                <SupportingText>{t('auth.profile.sessions.count', { count: String(page.totalCount) })}</SupportingText>
                <Button
                  disabled={disabled}
                  intent="secondary"
                  onClick={() => setConfirmation({ sessionId: null })}
                  size="sm"
                >
                  {t('auth.profile.sessions.revokeOthers')}
                </Button>
              </SplitWrapRow>
              {page.items.map((session) => {
                const client = sessionClientLabels(session.userAgent);
                return (
                  <InsetPanel key={session.id}>
                    <ContentStack gap="md">
                      <ProfileSessionDetails session={session} />
                      <ActionRow justify="end">
                        <Button
                          aria-label={t('auth.profile.sessions.revokeLabel', {
                            browser: t(client.browser),
                            address: session.ipAddress ?? t('auth.profile.sessions.unavailable'),
                          })}
                          disabled={disabled}
                          intent="secondary"
                          onClick={() => setConfirmation({ sessionId: session.id })}
                          size="sm"
                        >
                          {t('auth.profile.sessions.revoke')}
                        </Button>
                      </ActionRow>
                    </ContentStack>
                  </InsetPanel>
                );
              })}
              {page.items.length === 0 && <SupportingText>{t('auth.profile.sessions.emptyPage')}</SupportingText>}
            </>
          )}
          {(state.page > 1 || (page && page.totalPages > 1)) && (
            <nav aria-label={t('auth.profile.sessions.paginationLabel')}>
              <SplitWrapRow>
                <SupportingText>{t('auth.profile.sessions.page', { page: String(state.page) })}</SupportingText>
                <ActionRow>
                  <Button
                    disabled={disabled || state.page === 1}
                    intent="ghost"
                    onClick={() => state.setPage(state.page - 1)}
                    size="sm"
                  >
                    {t('auth.profile.sessions.previous')}
                  </Button>
                  <Button
                    disabled={disabled || !page || page.page >= page.totalPages}
                    intent="secondary"
                    onClick={() => state.setPage(state.page + 1)}
                    size="sm"
                  >
                    {t('auth.profile.sessions.next')}
                  </Button>
                </ActionRow>
              </SplitWrapRow>
            </nav>
          )}
        </ContentStack>
      </section>
      <ConfirmDialog
        isOpen={active && confirmation !== null}
        title={t(
          confirmation?.sessionId === null ? 'auth.profile.sessions.revokeOthers' : 'auth.profile.sessions.revoke',
        )}
        message={t(
          confirmation?.sessionId === null ? 'auth.profile.sessions.confirmOthers' : 'auth.profile.sessions.confirmOne',
        )}
        confirmLabel={t(state.mutating ? 'auth.profile.sessions.revoking' : 'auth.profile.sessions.confirm')}
        confirmDisabled={state.mutating}
        cancelLabel={t('auth.profile.sessions.cancel')}
        onCancel={() => {
          if (!state.mutating) setConfirmation(null);
        }}
        onConfirm={() => void confirmRevoke()}
      >
        <StatusBanner tone="error">{state.mutationFailed ? t('auth.profile.sessions.revokeError') : null}</StatusBanner>
      </ConfirmDialog>
    </ContentStack>
  );
}
