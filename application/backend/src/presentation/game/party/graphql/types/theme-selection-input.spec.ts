import { SaveThemeInput } from '../../../../theme/graphql/theme-types';
import 'reflect-metadata';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { CreateOrganizationInput } from '../../../../organization/graphql/types/create-organization-input';
import { UpdateOrganizationInput } from '../../../../organization/graphql/types/update-organization-input';
import { CreateProjectInput } from '../../../../project/graphql/types/create-project-input';
import { UpdateProjectInput } from '../../../../project/graphql/types/update-project-input';
import { CreatePartyInput } from './create-party-input';

describe.each([
  { Input: CreateOrganizationInput, field: 'defaultThemeId' },
  { Input: UpdateOrganizationInput, field: 'defaultThemeId' },
  { Input: CreateProjectInput, field: 'defaultThemeId' },
  { Input: UpdateProjectInput, field: 'defaultThemeId' },
  { Input: CreatePartyInput, field: 'themeIdOverride' },
  { Input: SaveThemeInput, field: 'themeId' },
])('$Input.name $field selection', ({ Input, field }) => {
  it.each(['cyber-arcade', 'solar-grid', 'custom:01900000-0000-7000-8000-000000000001', null, undefined])(
    'accepts a theme identifier or inheritance: %s',
    async (themeId) => {
      // Arrange
      const input = Object.assign(new Input(), { name: 'Event', gameId: 'game', [field]: themeId });

      // Act
      const errors = await validate(input);

      // Assert
      expect(errors).toEqual([]);
    },
  );

  it.each(['unknown', '', 'url(https://example.com/theme.css)', 'red; color: blue', 42, {}])(
    'rejects unsupported theme input: %s',
    async (themeId) => {
      // Arrange
      const input = Object.assign(new Input(), { name: 'Event', gameId: 'game', [field]: themeId });

      // Act
      const errors = await validate(input);

      // Assert
      expect(errors).toEqual([
        expect.objectContaining({
          property: field,
          constraints: expect.objectContaining({ matches: expect.any(String) }),
        }),
      ]);
    },
  );
});
