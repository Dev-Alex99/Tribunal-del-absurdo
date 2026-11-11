import { Server } from 'socket.io';
import { config } from '../config.js';
import { 
  CaseData, 
  Player, 
  PlayerEvaluation,
  RoomPhase, 
  RoomState, 
  VerdictData, 
  FinalPodiumData 
} from '../types.js';
import { generateCase, generateRivalPlea, evaluatePleas } from '../ai/minimax.js';

const HONORIFIC_TITLES = [
  'Gran Mariscal del Descaro Inmune',
  'Archiduque de la Excusa Inverosímil',
  'Canciller Emérito de la Burocracia Ficticia',
  'Patriarca Supremo del Desacato Civil'
];

export class GameRoom {
  public code: string;
  public phase: RoomPhase = 'LOBBY';
  public players: Player[] = [];
  public currentRound = 0;
  public totalRounds: number;
  public currentCase: CaseData | null = null;
  public timerEndsAt: number | null = null;
  public latestVerdict: VerdictData | null = null;
  public finalPodium: FinalPodiumData | null = null;

  private io: Server;
  private timerHandle: NodeJS.Timeout | null = null;

  constructor(code: string, io: Server) {
    this.code = code;
    this.io = io;
    this.totalRounds = config.game.totalRounds;
  }

  public addPlayer(id: string, name: string, avatarIndex: number): Player {
    // If already exists (e.g. reconnect)
    const existing = this.players.find(p => p.id === id || p.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      existing.id = id;
      existing.name = name;
      existing.avatarIndex = avatarIndex;
      return existing;
    }

    const isHost = this.players.length === 0;
    const player: Player = {
      id,
      name,
      avatarIndex,
      score: 0,
      isHost,
      isReady: false,
      hasSubmitted: false,
    };

    if (this.players.length < config.game.maxPlayers) {
      this.players.push(player);
    }
    return player;
  }

  public removePlayer(id: string): void {
    const idx = this.players.findIndex(p => p.id === id);
    if (idx !== -1) {
      const wasHost = this.players[idx].isHost;
      this.players.splice(idx, 1);
      if (wasHost && this.players.length > 0) {
        // Assign new host to first non-AI player
        const nextHuman = this.players.find(p => !p.isAI);
        if (nextHuman) nextHuman.isHost = true;
      }
    }
    // If room is empty or only AI remains
    if (this.players.filter(p => !p.isAI).length === 0) {
      this.clearTimer();
    }
  }

  public async startGame(): Promise<void> {
    if (this.phase !== 'LOBBY' && this.phase !== 'PODIUM') return;

    // Reset scores & rounds
    this.currentRound = 0;
    this.latestVerdict = null;
    this.finalPodium = null;
    this.players.forEach(p => {
      p.score = 0;
      p.hasSubmitted = false;
      p.currentPlea = '';
    });

    // Handle 1-Player Solo Mode: inject AI rival suspect
    const humanPlayers = this.players.filter(p => !p.isAI);
    if (humanPlayers.length === 1) {
      // Remove any existing AI
      this.players = this.players.filter(p => !p.isAI);
      // Add official AI rival
      this.players.push({
        id: 'ai-rival-k',
        name: 'Dr. Barnabás K. (Abogado de Oficio IA)',
        avatarIndex: 5,
        score: 0,
        isHost: false,
        isAI: true,
        isReady: true,
        hasSubmitted: false,
      });
    } else {
      // Remove AI if multiple humans are present
      this.players = this.players.filter(p => !p.isAI);
    }

    await this.startNextRound();
  }

  public async startNextRound(): Promise<void> {
    this.currentRound += 1;
    this.phase = 'BRIEFING';
    this.latestVerdict = null;
    this.players.forEach(p => {
      p.hasSubmitted = false;
      p.currentPlea = '';
      p.attachment = undefined;
      p.reactions = {};
    });

    // Broadcast loading
    this.broadcastState();

    // Generate case with MiniMax M3.1
    this.currentCase = await generateCase(this.currentRound);

    // If there is an AI player, pre-generate its plea and choose an absurd attachment
    const aiPlayer = this.players.find(p => p.isAI);
    if (aiPlayer && this.currentCase) {
      const AI_ATTACHMENTS = [
        'Soborno de Mesa de Entradas (Media medialuna y café tibio)',
        'Certificado de Amnesia Burocrática',
        'Firma Falsificada del Viceministro de Archivo Muerto',
        'Pliego de Letra Ilegible con Tinta Borrosa'
      ];
      aiPlayer.attachment = AI_ATTACHMENTS[Math.floor(Math.random() * AI_ATTACHMENTS.length)];

      generateRivalPlea(this.currentCase).then(plea => {
        aiPlayer.currentPlea = plea;
        aiPlayer.hasSubmitted = true;
      });
    }

    // Set briefing timer
    this.setPhaseTimer(config.game.briefingDurationSec, () => {
      this.startWritingPhase();
    });

    this.broadcastState();
  }

  private startWritingPhase(): void {
    this.phase = 'WRITING';
    this.setPhaseTimer(config.game.writingDurationSec, () => {
      this.submitAndDeliberate();
    });
    this.broadcastState();
  }

  public submitPlea(playerId: string, pleaText: string, attachment?: string): void {
    const player = this.players.find(p => p.id === playerId);
    if (!player || this.phase !== 'WRITING') return;

    player.currentPlea = pleaText.trim() || 'El acusado prefirió guardar silencio y mirar fijamente una mosca en la pared.';
    player.attachment = attachment;
    player.hasSubmitted = true;

    this.broadcastState();

    // If all human players have submitted, proceed early
    const allHumansDone = this.players
      .filter(p => !p.isAI)
      .every(p => p.hasSubmitted);

    if (allHumansDone) {
      this.clearTimer();
      this.submitAndDeliberate();
    }
  }

  public addReaction(targetPlayerId: string, reaction: string): void {
    const target = this.players.find(p => p.id === targetPlayerId);
    if (!target) return;
    if (!target.reactions) target.reactions = {};
    target.reactions[reaction] = (target.reactions[reaction] || 0) + 1;
    this.broadcastState();
  }

  private async submitAndDeliberate(): Promise<void> {
    this.clearTimer();
    this.phase = 'DELIBERATION';
    this.timerEndsAt = null;

    // Fill default plea for anyone who didn't submit
    this.players.forEach(p => {
      if (!p.currentPlea) {
        p.currentPlea = p.isAI 
          ? 'El autómata se descalibró y expulsó humo por el sombrero.' 
          : 'El acusado se quedó paralizado por el terror burocrático.';
        p.hasSubmitted = true;
      }
    });

    this.broadcastState();

    if (!this.currentCase) {
      this.currentCase = await generateCase(this.currentRound);
    }

    // Call MiniMax M3.1 evaluation
    const pleasForEvaluation = this.players.map(p => ({
      playerId: p.id,
      playerName: p.name,
      text: p.currentPlea || 'Sin alegato.',
      attachment: p.attachment
    }));

    const verdict = await evaluatePleas(this.currentCase, pleasForEvaluation);
    this.latestVerdict = verdict;

    // Apply scores to players
    verdict.evaluations.forEach((ev: PlayerEvaluation) => {
      const p = this.players.find(pl => pl.id === ev.playerId);
      if (p) {
        p.score += ev.totalRoundScore;
        p.lastScoreGain = ev.totalRoundScore;
      }
    });

    this.phase = 'VERDICT';
    this.setPhaseTimer(config.game.verdictDurationSec, () => {
      if (this.currentRound >= this.totalRounds) {
        this.finishGame();
      } else {
        this.startNextRound();
      }
    });

    this.broadcastState();
  }

  private finishGame(): void {
    this.clearTimer();
    this.phase = 'PODIUM';
    this.timerEndsAt = null;

    // Sort players by total score descending
    const sorted = [...this.players].sort((a, b) => b.score - a.score);
    const winner = sorted[0];

    this.finalPodium = {
      winnerId: winner?.id || '',
      winnerName: winner?.name || 'El Innombrable',
      honorificTitle: HONORIFIC_TITLES[Math.floor(Math.random() * HONORIFIC_TITLES.length)],
      finalRankings: sorted.map(p => ({
        playerId: p.id,
        playerName: p.name,
        totalScore: p.score,
        stampsReceived: []
      }))
    };

    this.broadcastState();
  }

  private setPhaseTimer(seconds: number, onComplete: () => void): void {
    this.clearTimer();
    this.timerEndsAt = Date.now() + seconds * 1000;
    this.timerHandle = setTimeout(() => {
      this.timerHandle = null;
      onComplete();
    }, seconds * 1000);
  }

  private clearTimer(): void {
    if (this.timerHandle) {
      clearTimeout(this.timerHandle);
      this.timerHandle = null;
    }
  }

  public getState(): RoomState {
    return {
      code: this.code,
      phase: this.phase,
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        avatarIndex: p.avatarIndex,
        score: p.score,
        isHost: p.isHost,
        isAI: p.isAI,
        isReady: p.isReady,
        hasSubmitted: p.hasSubmitted,
        attachment: p.attachment,
        reactions: p.reactions,
        currentPlea: this.phase === 'VERDICT' || this.phase === 'PODIUM' ? p.currentPlea : undefined,
        lastScoreGain: p.lastScoreGain
      })),
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      currentCase: this.currentCase,
      timerEndsAt: this.timerEndsAt,
      latestVerdict: this.latestVerdict,
      finalPodium: this.finalPodium,
    };
  }

  public broadcastState(): void {
    this.io.to(this.code).emit('room:state', this.getState());
  }
}
