import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { GameType } from '../../../../../domain/game/types/shared/entities/game-type';
import { GameTypeParser } from './game-type-parser';

describe('GameTypeParser', () => {
  const parser = new GameTypeParser();

  it('normalizes supported game types', () => {
    expect(parser.parse(' QUIZ ')).toBe(GameType.Quiz);
    expect(parser.parse('prediction')).toBe(GameType.Prediction);
  });

  it('returns null for unsupported game types when requested', () => {
    expect(parser.parseOrNull('unknown')).toBeNull();
  });
});
