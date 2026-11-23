import { Injectable } from '@nestjs/common';
import type { SelectableOptionInput as DomainSelectableOptionInput, SelectableOptionId } from '@pleey/contracts/game';
import type { IdentifierParserPort } from '../../../../../application/shared/services/identifier-parser/contracts';
import { SelectableOptionInput } from './selectable-option-types';

@Injectable()
export class SelectableOptionInputMapper {
  toDomainInputs<TId extends SelectableOptionId>(
    inputs: readonly SelectableOptionInput[],
    identifierParser: IdentifierParserPort<TId>,
  ): readonly DomainSelectableOptionInput<TId>[] {
    return inputs.map((input) => ({
      id: input.id === undefined ? undefined : identifierParser.parse(input.id),
      text: input.text,
      position: input.position,
      isCorrect: input.isCorrect,
    }));
  }
}
