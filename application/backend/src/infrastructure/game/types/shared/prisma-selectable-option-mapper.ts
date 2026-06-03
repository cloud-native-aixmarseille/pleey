import type { IdentifierParserPort } from '../../../../application/shared/services/identifier-parser/contracts';
import {
  SelectableOption,
  type SelectableOptionId,
} from '../../../../domain/game/types/shared/entities/selectable-option';

export interface PrismaSelectableOptionRecord<TId = string> {
  readonly id: TId;
  readonly text: string | null;
  readonly position: number;
  readonly isCorrect: boolean;
}

export class PrismaSelectableOptionMapper {
  toRecord<TId extends SelectableOptionId>(
    record: PrismaSelectableOptionRecord,
    identifierParser: IdentifierParserPort<TId>,
  ): PrismaSelectableOptionRecord<TId> {
    return {
      id: identifierParser.parse(record.id),
      text: record.text,
      position: record.position,
      isCorrect: record.isCorrect,
    };
  }

  toDomain<TId extends SelectableOptionId>(
    record: PrismaSelectableOptionRecord<TId>,
  ): SelectableOption<TId> {
    return new SelectableOption(record.id, record.text, record.position, record.isCorrect);
  }
}
