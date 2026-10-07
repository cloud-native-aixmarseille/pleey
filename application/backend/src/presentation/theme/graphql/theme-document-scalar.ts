import { Inject } from '@nestjs/common';
import { type CustomScalar, Scalar } from '@nestjs/graphql';
import { type ValueNode, valueFromASTUntyped } from 'graphql';
import { ThemeDocumentValidator } from '../../../application/workspace/themes/services/theme-document-validator';
import type { ThemeDocument } from '../../../domain/theme/entities/theme-document';
@Scalar('ThemeDocument', () => ThemeDocumentScalar)
export class ThemeDocumentScalar implements CustomScalar<unknown, ThemeDocument> {
  description = 'A validated, versioned token-theme document.';
  constructor(@Inject(ThemeDocumentValidator) private readonly validator: ThemeDocumentValidator) {}
  parseValue(value: unknown): ThemeDocument {
    return this.validator.parse(value);
  }
  serialize(value: unknown): ThemeDocument {
    return this.validator.parse(value);
  }
  parseLiteral(ast: ValueNode): ThemeDocument {
    return this.validator.parse(valueFromASTUntyped(ast));
  }
}
