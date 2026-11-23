import "reflect-metadata";
import { describe, expect, it } from "vitest";
import { QuizImportQuestionMapper } from "../application/backend/src/application/game/types/quiz/services/quiz-import-question-mapper";
import { CsvPlayableContentImportFormatParser } from "../application/backend/src/application/game/types/shared/services/playable-content-import/csv-playable-content-import-format-parser";
import { JsonPlayableContentImportFormatParser } from "../application/backend/src/application/game/types/shared/services/playable-content-import/json-playable-content-import-format-parser";
import { MarkdownPlayableContentImportFormatParser } from "../application/backend/src/application/game/types/shared/services/playable-content-import/markdown-playable-content-import-format-parser";
import { PlaintextPlayableContentImportFormatParser } from "../application/backend/src/application/game/types/shared/services/playable-content-import/plaintext-playable-content-import-format-parser";
import { PlayableContentImportParser } from "../application/backend/src/application/game/types/shared/services/playable-content-import/playable-content-import-parser";
import { PlayableContentImportParserContainer } from "../application/backend/src/application/game/types/shared/services/playable-content-import/playable-content-import-parser-container";
import { TrueFalseImportValueParser } from "../application/backend/src/application/game/types/shared/services/playable-content-import/true-false-import-value-parser";
import { SelectableOptionPolicy } from "../application/backend/src/domain/game/types/shared/services/selectable-option-policy";
import { QuizQuestionImportExampleFactory } from "../application/frontend/src/application/game/types/quiz/services/quiz-question-import-example-factory";
import { DEFAULT_PLAYABLE_CONTENT_IMPORT_EXAMPLE_FORMATS } from "../application/frontend/src/application/game/types/shared/ports/playable-content-import-example-provider.port";
import { TranslationResourceComposer } from "../application/frontend/src/i18n/translation-resource-composer";

describe.each(Object.entries(new TranslationResourceComposer().compose()))(
  "Quiz templates for %s",
  (language, resource) => {
    it.each(DEFAULT_PLAYABLE_CONTENT_IMPORT_EXAMPLE_FORMATS)("imports the generated %s template", async (format) => {
      // Arrange
      const factory = new QuizQuestionImportExampleFactory({
        currentLanguage: language,
        changeLanguage: () => {},
        t: (key) => {
          const value = key.split(".").reduce<unknown>((record, part) => {
            return (record as Record<string, unknown>)[part];
          }, resource.translation);
          if (typeof value !== "string") {
            throw new Error(`Missing translation for ${language}: ${key}`);
          }
          return value;
        },
      });
      const file = factory.create(format);
      const trueFalseValues = new TrueFalseImportValueParser();
      const mapper = new QuizImportQuestionMapper(
        new PlayableContentImportParser(
          new PlayableContentImportParserContainer(
            new CsvPlayableContentImportFormatParser(trueFalseValues),
            new JsonPlayableContentImportFormatParser(),
            new MarkdownPlayableContentImportFormatParser(),
            new PlaintextPlayableContentImportFormatParser(),
          ),
          trueFalseValues,
        ),
        new SelectableOptionPolicy(),
      );

      // Act
      const questions = await mapper.map({
        fileName: file.fileName,
        async readAll() {
          return file.content;
        },
        async *readLines() {
          yield* file.content.split(/\r?\n/u);
        },
      });

      // Assert
      expect(questions).toMatchObject([
        { type: "multiple", answers: [{ isCorrect: true }, { isCorrect: false }, { isCorrect: false }] },
        {
          type: "truefalse",
          answers: [
            { text: "True", position: 0, isCorrect: true },
            { text: "False", position: 1, isCorrect: false },
          ],
        },
      ]);
    });
  },
);
