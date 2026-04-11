import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { LanguageToggle } from './language-toggle';

const mocks = vi.hoisted(() => ({
  changeLanguage: vi.fn(),
  currentLanguage: 'en',
}));

vi.mock('../../i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  const factory = new PresentationTranslationMockFactory();
  const base = factory.createModule();

  return {
    ...(await importOriginal<object>()),
    usePresentationTranslation: () => ({
      ...base.usePresentationTranslation(),
      currentLanguage: mocks.currentLanguage,
      changeLanguage: mocks.changeLanguage,
    }),
  };
});

describe('LanguageToggle', () => {
  it('renders the current language code in uppercase', () => {
    renderWithUiProvider(<LanguageToggle />);
    expect(screen.getByRole('button', { name: 'shared.shell.languageToggle' })).toHaveTextContent(
      'EN',
    );
  });

  it('calls changeLanguage with next language on click', async () => {
    renderWithUiProvider(<LanguageToggle />);
    await userEvent.click(screen.getByRole('button', { name: 'shared.shell.languageToggle' }));
    expect(mocks.changeLanguage).toHaveBeenCalledWith('fr');
  });
});
