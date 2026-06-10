import { inject, injectable } from 'inversify';
import { PartyIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-identifier';
import { PartyPinIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-pin-identifier';
import { GameIdentifier } from '../../../../application/game/shared/services/identifiers/game-identifier';
import type {
  CreatePartyCommand,
  PartyManagementPort,
} from '../../../../domains/game/party/host/ports/party-management.port';
import type { Party } from '../../../../domains/game/party/shared/entities/party';
import { PartyRole } from '../../../../domains/game/party/shared/entities/party-role';
import { PartyStatus } from '../../../../domains/game/party/shared/entities/party-status';
import { PartyManagementErrorCode } from '../../../../domains/game/party/shared/errors/party-management-error-code';
import { GraphqlClient } from '../../../graphql/client/graphql-client';
import {
  CreatePartyDocument,
  type CreatePartyMutation,
  type CreatePartyMutationVariables,
  PartyRole as GraphqlPartyRole,
  PartyStatus as GraphqlPartyStatus,
  ListPartiesDocument,
  type ListPartiesQuery as ListPartiesGraphqlQuery,
  type ListPartiesQueryVariables,
} from '../../../graphql/generated/graphql';

const DEFAULT_LIST_PAGE = 1;
const DEFAULT_LIST_PAGE_SIZE = 100;

@injectable()
export class GraphqlPartyManagementAdapter implements PartyManagementPort {
  constructor(
    @inject(GraphqlClient)
    private readonly graphqlClient: GraphqlClient,
    @inject(PartyIdentifier)
    private readonly partyIdentifier: PartyIdentifier,
    @inject(GameIdentifier)
    private readonly gameIdentifier: GameIdentifier,
    @inject(PartyPinIdentifier)
    private readonly partyPinIdentifier: PartyPinIdentifier,
  ) {}

  async createParty(command: CreatePartyCommand): Promise<Party> {
    try {
      const result = await this.graphqlClient.request<
        CreatePartyMutation,
        CreatePartyMutationVariables
      >(CreatePartyDocument, {
        input: {
          gameId: command.gameId,
          privatePartyPassword: command.privatePartyPassword,
        },
      });

      return this.toDomainParty(result.createParty);
    } catch (error) {
      throw new Error(
        this.graphqlClient.extractMessage(error, PartyManagementErrorCode.CREATE_FAILED),
      );
    }
  }

  async listParties(): Promise<readonly Party[]> {
    try {
      const result = await this.graphqlClient.request<
        ListPartiesGraphqlQuery,
        ListPartiesQueryVariables
      >(ListPartiesDocument, {
        input: {
          page: DEFAULT_LIST_PAGE,
          pageSize: DEFAULT_LIST_PAGE_SIZE,
        },
      });

      return result.listParties.items.map((party) => this.toDomainParty(party));
    } catch (error) {
      throw new Error(
        this.graphqlClient.extractMessage(error, PartyManagementErrorCode.LIST_FAILED),
      );
    }
  }

  private toDomainParty(party: {
    readonly partyId: string;
    readonly gameId: string;
    readonly pin: string;
    readonly status: GraphqlPartyStatus;
    readonly role: GraphqlPartyRole;
    readonly createdAt: string;
  }): Party {
    return {
      partyId: this.partyIdentifier.parse(party.partyId),
      gameId: this.gameIdentifier.parse(party.gameId),
      pin: this.partyPinIdentifier.parse(party.pin),
      status: this.toDomainPartyStatus(party.status),
      role: this.toDomainPartyRole(party.role),
      createdAt: party.createdAt,
    };
  }

  private toDomainPartyStatus(status: GraphqlPartyStatus): PartyStatus {
    switch (status) {
      case GraphqlPartyStatus.Active:
        return PartyStatus.ACTIVE;
      case GraphqlPartyStatus.Paused:
        return PartyStatus.PAUSED;
      case GraphqlPartyStatus.Ended:
        return PartyStatus.ENDED;
      case GraphqlPartyStatus.Waiting:
      default:
        return PartyStatus.WAITING;
    }
  }

  private toDomainPartyRole(role: GraphqlPartyRole): PartyRole {
    switch (role) {
      case GraphqlPartyRole.Player:
        return PartyRole.PLAYER;
      case GraphqlPartyRole.Host:
      default:
        return PartyRole.HOST;
    }
  }
}
