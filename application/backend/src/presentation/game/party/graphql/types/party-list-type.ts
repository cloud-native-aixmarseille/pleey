import { ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../../../shared/graphql/types/paginated';
import { PartyType } from './party-type';

const PaginatedPartyListType = Paginated(PartyType);

@ObjectType()
export class PartyListType extends PaginatedPartyListType {}
