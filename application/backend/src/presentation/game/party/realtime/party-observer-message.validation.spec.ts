import { type ArgumentMetadata, BadRequestException, ValidationPipe } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import {
  PartyEntryMessageDto,
  PartyObservationMessageDto,
  SubmitPartyActionMessageDto,
} from './party-observer-message.dto';

const validationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});

describe('Party observer realtime payload validation', () => {
  it('accepts a whitelisted party entry payload', async () => {
    const result = await validationPipe.transform(
      {
        guestId: 'guest-7',
        pin: 'AB12CD',
        username: 'Neo',
      },
      toArgumentMetadata(PartyEntryMessageDto),
    );

    expect(result).toBeInstanceOf(PartyEntryMessageDto);
    expect(result).toMatchObject({
      guestId: 'guest-7',
      pin: 'AB12CD',
      username: 'Neo',
    });
  });

  it('rejects non-whitelisted party entry properties', async () => {
    await expect(
      validationPipe.transform(
        {
          pin: 'AB12CD',
          role: 'host',
        },
        toArgumentMetadata(PartyEntryMessageDto),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('accepts a host control payload with a valid party id', async () => {
    const result = await validationPipe.transform(
      {
        partyId: 44,
      },
      toArgumentMetadata(PartyObservationMessageDto),
    );

    expect(result).toBeInstanceOf(PartyObservationMessageDto);
    expect(result).toMatchObject({
      partyId: 44,
    });
  });

  it('rejects invalid submit action payload values', async () => {
    await expect(
      validationPipe.transform(
        {
          actionId: 0,
          partyId: 44,
        },
        toArgumentMetadata(SubmitPartyActionMessageDto),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

function toArgumentMetadata(metatype: ArgumentMetadata['metatype']): ArgumentMetadata {
  return {
    data: 'payload',
    metatype,
    type: 'body',
  };
}
