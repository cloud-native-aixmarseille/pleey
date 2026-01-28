import { Injectable } from '@nestjs/common';
import type { GameActionId } from '../entities/game-stage';
import type { PlayerAction } from '../entities/player-action';

/**
 * Action Distribution Service
 * Computes action frequency for a set of actions
 */
@Injectable()
export class ActionDistributionService {
  calculateActionDistribution(actions: PlayerAction[]): Record<GameActionId, number> {
    const distribution: Record<GameActionId, number> = {};
    for (const action of actions) {
      distribution[action.actionId] = (distribution[action.actionId] || 0) + 1;
    }
    return distribution;
  }
}
