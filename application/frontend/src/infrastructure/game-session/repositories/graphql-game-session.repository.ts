import { inject, injectable } from 'inversify';
import type { DashboardActiveSessionItem } from '../../../domains/game-session/entities/active-game-session';
import { GameSessionParticipantRole } from '../../../domains/game-session/entities/active-game-session';
import { GameSessionStatus } from '../../../domains/game-session/entities/game-session-status';
import type { GameSessionRepository } from '../../../domains/game-session/ports/game-session-repository';
import { GraphqlClient } from '../../graphql/client/graphql-client';
import {
  ActiveGameSessionByPinDocument,
  type ActiveGameSessionByPinQuery,
  type ActiveGameSessionByPinQueryVariables,
  ActiveGameSessionsDocument,
  type ActiveGameSessionsQuery,
  CreateDashboardGameSessionDocument,
  type CreateDashboardGameSessionMutation,
  type CreateDashboardGameSessionMutationVariables,
  CurrentPlayerGameSessionDocument,
  type CurrentPlayerGameSessionQuery,
  type GameSessionType,
  GameSessionStatus as GraphqlGameSessionStatus,
  LeaveCurrentPlayerGameSessionDocument,
  type LeaveCurrentPlayerGameSessionMutation,
  ResumeDashboardGameSessionDocument,
  type ResumeDashboardGameSessionMutation,
  type ResumeDashboardGameSessionMutationVariables,
  StopDashboardGameSessionDocument,
  type StopDashboardGameSessionMutation,
  type StopDashboardGameSessionMutationVariables,
} from '../../graphql/generated/graphql';

@injectable()
export class GraphqlGameSessionRepository implements GameSessionRepository {
  constructor(
    @inject(GraphqlClient)
    private readonly graphqlClient: GraphqlClient,
  ) {}

  async createGameSession(gameId: number): Promise<DashboardActiveSessionItem> {
    try {
      const result = await this.graphqlClient.request<
        CreateDashboardGameSessionMutation,
        CreateDashboardGameSessionMutationVariables
      >(CreateDashboardGameSessionDocument, { input: { gameId } });

      return this.toSession(result.createGameSession);
    } catch (error) {
      throw new Error(this.graphqlClient.extractMessage(error, 'dashboard.sessions.createFailed'));
    }
  }

  async getActiveSessions(): Promise<DashboardActiveSessionItem[]> {
    try {
      const result = await this.graphqlClient.request<ActiveGameSessionsQuery>(
        ActiveGameSessionsDocument,
      );

      return (result.activeSessions.sessions ?? []).map((session) => this.toSession(session));
    } catch (error) {
      throw new Error(this.graphqlClient.extractMessage(error, 'dashboard.errors.loadFailed'));
    }
  }

  async getActiveSessionByPin(pin: string): Promise<DashboardActiveSessionItem | null> {
    try {
      const result = await this.graphqlClient.request<
        ActiveGameSessionByPinQuery,
        ActiveGameSessionByPinQueryVariables
      >(ActiveGameSessionByPinDocument, { pin });

      return result.activeSessionByPin ? this.toSession(result.activeSessionByPin) : null;
    } catch (error) {
      throw new Error(this.graphqlClient.extractMessage(error, 'dashboard.errors.loadFailed'));
    }
  }

  async getCurrentPlayerSession(): Promise<DashboardActiveSessionItem | null> {
    try {
      const result = await this.graphqlClient.request<CurrentPlayerGameSessionQuery>(
        CurrentPlayerGameSessionDocument,
      );

      return result.currentPlayerSession ? this.toSession(result.currentPlayerSession) : null;
    } catch (error) {
      throw new Error(this.graphqlClient.extractMessage(error, 'dashboard.errors.loadFailed'));
    }
  }

  async leaveCurrentPlayerSession(): Promise<boolean> {
    try {
      const result = await this.graphqlClient.request<LeaveCurrentPlayerGameSessionMutation>(
        LeaveCurrentPlayerGameSessionDocument,
      );

      return result.leaveCurrentPlayerSession;
    } catch (error) {
      throw new Error(this.graphqlClient.extractMessage(error, 'dashboard.sessions.actionFailed'));
    }
  }

  async resumeGameSession(sessionId: number): Promise<DashboardActiveSessionItem> {
    try {
      const result = await this.graphqlClient.request<
        ResumeDashboardGameSessionMutation,
        ResumeDashboardGameSessionMutationVariables
      >(ResumeDashboardGameSessionDocument, { sessionId });

      return this.toSession(result.resumeGameSession);
    } catch (error) {
      throw new Error(this.graphqlClient.extractMessage(error, 'dashboard.sessions.actionFailed'));
    }
  }

  async stopGameSession(sessionId: number): Promise<DashboardActiveSessionItem> {
    try {
      const result = await this.graphqlClient.request<
        StopDashboardGameSessionMutation,
        StopDashboardGameSessionMutationVariables
      >(StopDashboardGameSessionDocument, { sessionId });

      return this.toSession(result.stopGameSession);
    } catch (error) {
      throw new Error(this.graphqlClient.extractMessage(error, 'dashboard.sessions.actionFailed'));
    }
  }

  private toSession(session: GameSessionType): DashboardActiveSessionItem {
    return {
      sessionId: session.sessionId,
      gameId: session.gameId,
      pin: session.pin,
      status: this.toGameSessionStatus(session.status),
      currentStageId: session.currentStageId ?? null,
      participantRole:
        session.participantRole === 'PLAYER'
          ? GameSessionParticipantRole.PLAYER
          : GameSessionParticipantRole.HOST,
      createdAt: session.createdAt,
    };
  }

  private toGameSessionStatus(status: GraphqlGameSessionStatus): GameSessionStatus {
    switch (status) {
      case GraphqlGameSessionStatus.Waiting:
        return GameSessionStatus.WAITING;
      case GraphqlGameSessionStatus.Active:
        return GameSessionStatus.ACTIVE;
      case GraphqlGameSessionStatus.Paused:
        return GameSessionStatus.PAUSED;
      case GraphqlGameSessionStatus.Ended:
        return GameSessionStatus.ENDED;
      default:
        throw new Error(`Unsupported game session status: ${status}`);
    }
  }
}
