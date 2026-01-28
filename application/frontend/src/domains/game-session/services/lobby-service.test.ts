import { describe, expect, it } from 'vitest';
import { LobbyService } from './lobby-service';

describe('LobbyService', () => {
  const service = new LobbyService();

  it('builds visible pin characters with placeholder slots', () => {
    expect(service.buildPinCharacters('AB12')).toEqual([
      { value: 'A', isPlaceholder: false },
      { value: 'B', isPlaceholder: false },
      { value: '1', isPlaceholder: false },
      { value: '2', isPlaceholder: false },
      { value: '•', isPlaceholder: true },
      { value: '•', isPlaceholder: true },
    ]);
  });

  it('extracts the highlighted player from the roster using guest identity', () => {
    const result = service.selectHighlightedPlayers(
      [
        { guestId: 'guest-1', username: 'Trinity', avatarUri: 'avatar-1' },
        { id: 42, username: 'Neo', avatarUri: 'avatar-2' },
      ],
      null,
      'guest-1',
      'Trinity',
    );

    expect(result.currentPlayer).toEqual({
      guestId: 'guest-1',
      username: 'Trinity',
      avatarUri: 'avatar-1',
    });
    expect(result.otherPlayers).toEqual([{ id: 42, username: 'Neo', avatarUri: 'avatar-2' }]);
  });
});
