export type RoomPhase = 
  | 'LOBBY' 
  | 'BRIEFING' 
  | 'WRITING' 
  | 'DELIBERATION' 
  | 'VERDICT' 
  | 'PODIUM';

export interface Player {
  id: string;
  name: string;
  avatarIndex: number;
  score: number;
  isHost: boolean;
  isAI?: boolean;
  isReady: boolean;
  hasSubmitted: boolean;
  currentPlea?: string;
  attachment?: string;
  reactions?: Record<string, number>;
  lastScoreGain?: number;
}

export interface CaseData {
  caseNumber: string;
  title: string;
  plaintiff: string;
  description: string;
  requiredWords: string[];
  rivalPlea?: string;
}

export interface PlayerEvaluation {
  playerId: string;
  playerName: string;
  pleaText: string;
  attachment?: string;
  creativityScore: number;
  audacityScore: number;
  requiredWordsUsed: string[];
  penalty: number;
  totalRoundScore: number;
  stamp: 'ABSUELTO_POR_GENIO' | 'CULPABLE_REINCIDENTE' | 'INDULTO_POR_PENA' | 'DESACATO_TOTAL' | 'LOCURA_TRANSITORIA';
  stampTitle: string;
  roast: string;
}

export interface VerdictData {
  evaluations: PlayerEvaluation[];
  roundWinnerId: string;
  roundWinnerName: string;
  magistrateCommentary: string;
}

export interface FinalPodiumData {
  winnerId: string;
  winnerName: string;
  honorificTitle: string;
  finalRankings: {
    playerId: string;
    playerName: string;
    totalScore: number;
    stampsReceived: string[];
  }[];
}

export interface RoomState {
  code: string;
  phase: RoomPhase;
  players: Player[];
  currentRound: number;
  totalRounds: number;
  currentCase: CaseData | null;
  timerEndsAt: number | null;
  latestVerdict: VerdictData | null;
  finalPodium: FinalPodiumData | null;
}
