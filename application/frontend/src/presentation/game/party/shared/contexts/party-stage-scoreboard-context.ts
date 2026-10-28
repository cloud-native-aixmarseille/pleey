import { createContext } from 'react';
import type { PartyStageScoreboardSnapshot } from './party-stage-scoreboard.model';

export const PartyStageScoreboardContext = createContext<PartyStageScoreboardSnapshot | null>(null);
