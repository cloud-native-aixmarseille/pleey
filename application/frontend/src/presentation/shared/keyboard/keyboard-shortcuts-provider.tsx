import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useEffectEvent,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { PresentationContextErrorCode } from '../../../domains/shared/errors/presentation-context-error-code';
import { usePresentationTranslation } from '../i18n/use-presentation-translation';
import { Button } from '../ui/actions/button';
import { ContentStack, SplitWrapRow } from '../ui/layout/containers';
import { Heading, SupportingText } from '../ui/layout/typography';
import { FormDialog } from '../ui/overlay/form-dialog';

interface ShortcutCombo {
  readonly alt?: boolean;
  readonly ctrl?: boolean;
  readonly key: string;
  readonly meta?: boolean;
  readonly shift?: boolean;
}

interface KeyboardShortcutDefinition {
  readonly allowInEditable?: boolean;
  readonly allowRepeat?: boolean;
  readonly ariaKeyShortcuts?: string;
  readonly combo: ShortcutCombo;
  readonly descriptionKey: string;
  readonly descriptionVariables?: Record<string, string>;
  readonly disabled?: boolean;
  readonly execute: (event: KeyboardEvent) => void;
  readonly id: string;
  readonly preventDefault?: boolean;
  readonly priority?: number;
  readonly scope: string;
  readonly scopeLabelKey?: string;
  readonly stopPropagation?: boolean;
}

interface KeyboardShortcutRegistration extends KeyboardShortcutDefinition {
  readonly registrationId: string;
  readonly sequence: number;
}

interface ShortcutScopeDefinition {
  readonly active: boolean;
  readonly priority: number;
  readonly registrationId: string;
  readonly scope: string;
}

interface KeyboardShortcutsContextValue {
  readonly closeHelp: () => void;
  readonly isHelpOpen: boolean;
  readonly openHelp: () => void;
  registerScope: (scope: ShortcutScopeDefinition) => () => void;
  registerShortcut: (shortcut: KeyboardShortcutDefinition) => () => void;
}

interface KeyboardShortcutHelpEntry {
  readonly comboLabel: string;
  readonly description: string;
  readonly id: string;
}

interface KeyboardShortcutHelpGroup {
  readonly entries: readonly KeyboardShortcutHelpEntry[];
  readonly label: string;
  readonly scope: string;
}

const GLOBAL_SHORTCUT_SCOPE = 'global';
const GLOBAL_SCOPE_LABEL_KEY = 'shared.keyboard.globalGroup';
const HELP_DIALOG_SCOPE = 'keyboard-help-dialog';

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextValue | null>(null);

function normalizeShortcutKey(key: string): string {
  return key.trim().toLowerCase();
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  const tagName = target.tagName.toLowerCase();

  return tagName === 'input' || tagName === 'select' || tagName === 'textarea';
}

function matchesShortcutCombo(combo: ShortcutCombo, event: KeyboardEvent): boolean {
  if (normalizeShortcutKey(combo.key) !== normalizeShortcutKey(event.key)) {
    return false;
  }

  const shouldMatchShiftExactly =
    combo.shift !== undefined || /[a-z0-9]/i.test(combo.key) || combo.key.length > 1;

  return (
    Boolean(combo.alt) === event.altKey &&
    Boolean(combo.ctrl) === event.ctrlKey &&
    Boolean(combo.meta) === event.metaKey &&
    (!shouldMatchShiftExactly || Boolean(combo.shift) === event.shiftKey)
  );
}

function getScopePriority(
  scopeId: string,
  activeScopes: ReadonlyMap<string, ShortcutScopeDefinition>,
): number {
  if (scopeId === GLOBAL_SHORTCUT_SCOPE) {
    return Number.NEGATIVE_INFINITY;
  }

  let bestPriority = Number.NEGATIVE_INFINITY;

  for (const activeScope of activeScopes.values()) {
    if (activeScope.scope !== scopeId) {
      continue;
    }

    if (activeScope.priority > bestPriority) {
      bestPriority = activeScope.priority;
    }
  }

  return bestPriority;
}

function isScopeActive(
  scopeId: string,
  activeScopes: ReadonlyMap<string, ShortcutScopeDefinition>,
): boolean {
  for (const activeScope of activeScopes.values()) {
    if (activeScope.scope === scopeId) {
      return true;
    }
  }

  return false;
}

function compareShortcutRegistrations(
  left: KeyboardShortcutRegistration,
  right: KeyboardShortcutRegistration,
  activeScopes: ReadonlyMap<string, ShortcutScopeDefinition>,
): number {
  const scopePriorityDifference =
    getScopePriority(right.scope, activeScopes) - getScopePriority(left.scope, activeScopes);

  if (scopePriorityDifference !== 0) {
    return scopePriorityDifference;
  }

  const shortcutPriorityDifference = (right.priority ?? 0) - (left.priority ?? 0);

  if (shortcutPriorityDifference !== 0) {
    return shortcutPriorityDifference;
  }

  return right.sequence - left.sequence;
}

function formatShortcutCombo(combo: ShortcutCombo): string {
  const segments = [
    combo.meta ? 'Meta' : null,
    combo.ctrl ? 'Ctrl' : null,
    combo.alt ? 'Alt' : null,
    combo.shift ? 'Shift' : null,
    combo.key.length === 1 ? combo.key.toUpperCase() : combo.key,
  ].filter((segment): segment is string => segment !== null);

  return segments.join(' + ');
}

function KeyboardShortcutsHelpDialog({
  groups,
  isOpen,
  onClose,
}: {
  readonly groups: readonly KeyboardShortcutHelpGroup[];
  readonly isOpen: boolean;
  readonly onClose: () => void;
}) {
  const { t } = usePresentationTranslation();

  return (
    <FormDialog
      footer={
        <Button intent="ghost" onClick={onClose} type="button">
          {t('shared.keyboard.close')}
        </Button>
      }
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={(event) => {
        event.preventDefault();
      }}
      title={t('shared.keyboard.helpTitle')}
    >
      <ContentStack gap="md">
        <SupportingText>{t('shared.keyboard.helpDescription')}</SupportingText>
        {groups.length === 0 ? (
          <SupportingText>{t('shared.keyboard.empty')}</SupportingText>
        ) : (
          groups.map((group) => (
            <ContentStack gap="xs" key={group.scope}>
              <Heading level={3}>{group.label}</Heading>
              {group.entries.map((entry) => (
                <SplitWrapRow gap="sm" key={entry.id}>
                  <SupportingText>{entry.description}</SupportingText>
                  <SupportingText tone="soft">{entry.comboLabel}</SupportingText>
                </SplitWrapRow>
              ))}
            </ContentStack>
          ))
        )}
      </ContentStack>
    </FormDialog>
  );
}

export function KeyboardShortcutsProvider({ children }: PropsWithChildren) {
  const { t } = usePresentationTranslation();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const registrationsRef = useRef<Map<string, KeyboardShortcutRegistration>>(new Map());
  const activeScopesRef = useRef<Map<string, ShortcutScopeDefinition>>(new Map());
  const sequenceRef = useRef(0);

  const openHelp = useEffectEvent(() => {
    setIsHelpOpen(true);
  });

  const closeHelp = useEffectEvent(() => {
    setIsHelpOpen(false);
  });

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.defaultPrevented || event.isComposing) {
      return;
    }

    if (isHelpOpen) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeHelp();
      }

      return;
    }

    const registrations = [...registrationsRef.current.values()].filter((registration) => {
      if (registration.disabled) {
        return false;
      }

      if (
        registration.scope !== GLOBAL_SHORTCUT_SCOPE &&
        !isScopeActive(registration.scope, activeScopesRef.current)
      ) {
        return false;
      }

      if (!registration.allowRepeat && event.repeat) {
        return false;
      }

      if (!registration.allowInEditable && isEditableTarget(event.target)) {
        return false;
      }

      return matchesShortcutCombo(registration.combo, event);
    });

    if (registrations.length === 0) {
      return;
    }

    registrations.sort((left, right) =>
      compareShortcutRegistrations(left, right, activeScopesRef.current),
    );

    const [selectedRegistration] = registrations;

    if (!selectedRegistration) {
      return;
    }

    if (selectedRegistration.preventDefault ?? true) {
      event.preventDefault();
    }

    if (selectedRegistration.stopPropagation ?? false) {
      event.stopPropagation();
    }

    selectedRegistration.execute(event);
  });

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const registerShortcut = useEffectEvent((shortcut: KeyboardShortcutDefinition) => {
    const sequence = sequenceRef.current++;
    const registrationId = `${shortcut.scope}:${shortcut.id}:${sequence}`;

    registrationsRef.current.set(registrationId, {
      ...shortcut,
      registrationId,
      sequence,
    });

    return () => {
      registrationsRef.current.delete(registrationId);
    };
  });

  const registerScope = useEffectEvent((scope: ShortcutScopeDefinition) => {
    if (!scope.active) {
      return () => undefined;
    }

    activeScopesRef.current.set(scope.registrationId, scope);

    return () => {
      activeScopesRef.current.delete(scope.registrationId);
    };
  });

  useKeyboardShortcutRegistration(
    {
      combo: { key: '?' },
      descriptionKey: 'shared.keyboard.shortcutsHelp',
      execute: openHelp,
      id: 'open-shortcuts-help',
      scope: GLOBAL_SHORTCUT_SCOPE,
      scopeLabelKey: GLOBAL_SCOPE_LABEL_KEY,
    },
    registerShortcut,
  );

  useShortcutScopeRegistration(
    {
      active: isHelpOpen,
      priority: 1000,
      registrationId: HELP_DIALOG_SCOPE,
      scope: HELP_DIALOG_SCOPE,
    },
    registerScope,
  );

  const helpGroups = useMemo<readonly KeyboardShortcutHelpGroup[]>(() => {
    const visibleRegistrations = [...registrationsRef.current.values()]
      .filter((registration) => {
        if (registration.disabled) {
          return false;
        }

        return (
          registration.scope === GLOBAL_SHORTCUT_SCOPE ||
          isScopeActive(registration.scope, activeScopesRef.current)
        );
      })
      .sort((left, right) => compareShortcutRegistrations(left, right, activeScopesRef.current));

    const groups = new Map<string, KeyboardShortcutHelpGroup>();

    for (const registration of visibleRegistrations) {
      const existingGroup = groups.get(registration.scope);
      const entry = {
        comboLabel: formatShortcutCombo(registration.combo),
        description: t(registration.descriptionKey, registration.descriptionVariables),
        id: registration.registrationId,
      } satisfies KeyboardShortcutHelpEntry;

      if (existingGroup) {
        groups.set(registration.scope, {
          ...existingGroup,
          entries: [...existingGroup.entries, entry],
        });
        continue;
      }

      groups.set(registration.scope, {
        entries: [entry],
        label: registration.scopeLabelKey ? t(registration.scopeLabelKey) : registration.scope,
        scope: registration.scope,
      });
    }

    return [...groups.values()];
  }, [isHelpOpen, t]);

  const contextValue = useMemo<KeyboardShortcutsContextValue>(
    () => ({
      closeHelp,
      isHelpOpen,
      openHelp,
      registerScope,
      registerShortcut,
    }),
    [closeHelp, isHelpOpen, openHelp, registerScope, registerShortcut],
  );

  return (
    <KeyboardShortcutsContext.Provider value={contextValue}>
      {children}
      <KeyboardShortcutsHelpDialog groups={helpGroups} isOpen={isHelpOpen} onClose={closeHelp} />
    </KeyboardShortcutsContext.Provider>
  );
}

function useKeyboardShortcutsContext(): KeyboardShortcutsContextValue {
  const context = useContext(KeyboardShortcutsContext);

  if (!context) {
    throw new Error(PresentationContextErrorCode.PRESENTATION_UI_PROVIDER_REQUIRED);
  }

  return context;
}

function useKeyboardShortcutRegistration(
  shortcut: KeyboardShortcutDefinition,
  registerShortcut: KeyboardShortcutsContextValue['registerShortcut'],
) {
  useEffect(() => {
    return registerShortcut(shortcut);
  }, [registerShortcut, shortcut]);
}

function useShortcutScopeRegistration(
  scope: ShortcutScopeDefinition,
  registerScope: KeyboardShortcutsContextValue['registerScope'],
) {
  useEffect(() => {
    return registerScope(scope);
  }, [registerScope, scope]);
}

export function useKeyboardShortcut(shortcut: KeyboardShortcutDefinition) {
  const { registerShortcut } = useKeyboardShortcutsContext();
  const execute = useEffectEvent((event: KeyboardEvent) => {
    shortcut.execute(event);
  });

  useKeyboardShortcutRegistration(
    {
      ...shortcut,
      execute,
    },
    registerShortcut,
  );
}

export function useShortcutScope(
  scope: string,
  options: { readonly active?: boolean; readonly priority?: number } = {},
) {
  const { registerScope } = useKeyboardShortcutsContext();
  const scopeId = useId();
  const scopeRegistrationId = `${scope}:${scopeId}`;

  useShortcutScopeRegistration(
    {
      active: options.active ?? true,
      priority: options.priority ?? 0,
      registrationId: scopeRegistrationId,
      scope,
    },
    registerScope,
  );

  return scopeId;
}

export function useKeyboardShortcutsState() {
  const { closeHelp, isHelpOpen, openHelp } = useKeyboardShortcutsContext();

  return {
    closeHelp,
    isHelpOpen,
    openHelp,
  };
}
