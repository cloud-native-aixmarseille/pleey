import { Injectable } from '@nestjs/common';
import { PlayableImportItemKind } from './import-parser.types';

// Input aliases cover every supported template locale, independently of the request language.
const TRUE_LABELS = new Set(['true', 'vrai']);
const FALSE_LABELS = new Set(['false', 'faux']);

@Injectable()
export class TrueFalseImportValueParser {
  parseLabel(value: string): boolean | null {
    const normalized = value.trim().toLowerCase();

    if (TRUE_LABELS.has(normalized)) {
      return true;
    }

    if (FALSE_LABELS.has(normalized)) {
      return false;
    }

    return null;
  }

  inferKind(optionTexts: readonly string[]): PlayableImportItemKind {
    const values = optionTexts.map((text) => this.parseLabel(text));

    return values.length === 2 && values.includes(true) && values.includes(false)
      ? PlayableImportItemKind.TRUE_FALSE
      : PlayableImportItemKind.MULTIPLE;
  }
}
