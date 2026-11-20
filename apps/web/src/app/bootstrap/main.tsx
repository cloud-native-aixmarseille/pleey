import '@mantine/core/styles.css';
import 'reflect-metadata';
import '../../index.css';
import { initializeI18n, LanguagePreferenceResolver } from '../../i18n/config/init';
import { TranslationResourceComposer } from '../../i18n/translation-resource-composer';
import { AppRenderer } from './app-renderer';

initializeI18n({
  languagePreferenceResolver: new LanguagePreferenceResolver(),
  translationResourceComposer: new TranslationResourceComposer(),
});

new AppRenderer().render();
