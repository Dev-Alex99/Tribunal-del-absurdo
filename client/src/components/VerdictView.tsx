import React, { useEffect, useState } from 'react';
import { Award, Clock } from 'lucide-react';
import { VerdictData, CaseData, Player } from '../types';
import { getEstimatedServerTime } from '../socket';
import { sfx } from '../audio/sfx';

interface VerdictProps {
  verdict: VerdictData;
  currentCase: CaseData | null;
  timerEndsAt: number | null;
  currentRound: number;
  totalRounds: number;
  players: Player[];
  onReact?: (targetPlayerId: string, reaction: string) => void;
}

const REACTION_OPTIONS = [
  '🚨 ¡A LA HOGUERA!',
  '🎭 ¡POESÍA!',
  '🥐 ¡SOBORNO!',
  '🤡 ¡DESCARO!'
];

export const VerdictView: React.FC<VerdictProps> = ({
  verdict,
  currentCase,
  timerEndsAt,
  currentRound,
  totalRounds,
  players,
  onReact,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(35);
  const [isShaking, setIsShaking] = useState(true);

  useEffect(() => {
    sfx.playGavel();
    const shakeTimeout = setTimeout(() => {
      setIsShaking(false);
    }, 450);

    const stampTimeout = setTimeout(() => {
      sfx.playStamp();
    }, 400);

    return () => {
      clearTimeout(shakeTimeout);
      clearTimeout(stampTimeout);
    };
  }, []);

  useEffect(() => {
    if (!timerEndsAt) return;
    const interval = setInterval(() => {
      const now = getEstimatedServerTime();
      const remaining = Math.max(0, Math.ceil((timerEndsAt - now) / 1000));
      setSecondsLeft(remaining);
    }, 200);

    return () => clearInterval(interval);
  }, [timerEndsAt]);

  const getStampClass = (stamp: string) => {
    switch (stamp) {
      case 'ABSUELTO_POR_GENIO':
        return 'stamp-green';
      case 'INDULTO_POR_PENA':
      case 'LOCURA_TRANSITORIA':
        return 'stamp-blue';
      case 'CULPABLE_REINCIDENTE':
      case 'DESACATO_TOTAL':
      default:
        return 'stamp-red';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Container with Impact Shake & 3D Folder Reveal */}
      <div className={`relative bg-bureau-folder border-3 border-bureau-ink rounded p-4 sm:p-8 shadow-bureau-lg animate-folder-open ${
        isShaking ? 'shake-screen' : ''
      }`}>
        {/* Paperclip */}
        <div className="paperclip"></div>

        {/* Visual Gavel Strike Badge */}
        <div className="absolute -top-5 right-8 hidden sm:flex items-center gap-2 bg-bureau-paper border-2 border-bureau-ink px-3 py-1 shadow-bureau-sm">
          <span className="text-xl animate-gavel-strike">🔨</span>
          <span className="font-stamp text-[10px] uppercase font-bold text-bureau-stampRed">
            MARTILLAZO JUDICIAL
          </span>
        </div>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between border-b-2 border-bureau-ink pb-4 mb-6 gap-3">
          <div>
            <div className="text-[11px] font-bold tracking-widest uppercase bg-bureau-stampRed text-bureau-paper px-2 py-0.5 inline-block">
              RESOLUCIÓN DEFINITIVA DE AUDIENCIA
            </div>
            <h2 className="font-stamp text-2xl sm:text-3xl font-bold uppercase text-bureau-ink mt-1">
              Sentencia • Ronda {currentRound} de {totalRounds}
            </h2>
          </div>

          {/* Timer to next phase */}
          <div className="flex items-center gap-2 border-2 border-bureau-ink bg-bureau-paper px-3 py-1.5 shadow-bureau-sm">
            <Clock size={16} className="text-bureau-ink" />
            <span className="text-[10px] uppercase font-bold text-bureau-inkMuted">Próxima Causa:</span>
            <span className="font-stamp text-lg font-bold text-bureau-stampRed tracking-wider">
              {secondsLeft}s
            </span>
          </div>
        </div>

        {/* Magistrate Commentary */}
        <div className="mb-6 p-4 bg-bureau-paper border-2 border-bureau-ink shadow-bureau-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-bureau-inkMuted block mb-1">
            Dictamen del Magistrado Supremo (MiniMax M3.1):
          </span>
          <p className="font-typewriter text-sm sm:text-base italic text-bureau-ink">
            « {verdict.magistrateCommentary} »
          </p>

          <div className="mt-3 pt-2 border-t border-bureau-ink/20 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-bureau-stampRed" />
              <span className="text-xs font-bold uppercase text-bureau-ink">
                Vencedor de la Ronda: <strong className="font-stamp text-bureau-stampRed">{verdict.roundWinnerName}</strong>
              </span>
            </div>
            {currentCase && (
              <span className="text-[11px] text-bureau-inkMuted">
                Causa archivada: {currentCase.caseNumber}
              </span>
            )}
          </div>
        </div>

        {/* Suspect Evaluations Grid */}
        <div className="space-y-4">
          <h3 className="font-stamp text-sm uppercase font-bold text-bureau-ink">
            Evaluación Individual de Alegatos:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {verdict.evaluations.map((ev, index) => {
              const playerInfo = players.find(p => p.id === ev.playerId);
              const isWinner = ev.playerId === verdict.roundWinnerId;
              const rotAngle = ((index % 2 === 0 ? -4 : 4) + (index * 2)) % 8;

              return (
                <div
                  key={ev.playerId}
                  className={`relative p-5 border-2 border-bureau-ink shadow-bureau-sm flex flex-col justify-between ${
                    isWinner ? 'bg-bureau-paper ring-2 ring-bureau-stampRed' : 'bg-bureau-paperAged'
                  }`}
                >
                  {/* Suspect Tag */}
                  <div>
                    <div className="flex items-center justify-between border-b border-bureau-ink pb-2 mb-3">
                      <div>
                        <span className="font-bold text-sm text-bureau-ink">{ev.playerName}</span>
                        {playerInfo?.isAI && (
                          <span className="ml-2 text-[9px] uppercase px-1 border border-bureau-ink bg-bureau-folder font-bold">
                            Autómata IA
                          </span>
                        )}
                      </div>
                      <span className="font-stamp text-xl font-bold text-bureau-stampRed">
                        +{ev.totalRoundScore} pts
                      </span>
                    </div>

                    {/* Attachment Badge if used */}
                    {ev.attachment && (
                      <div className="mb-2 text-[10px] font-stamp text-bureau-stampRed bg-bureau-paper px-2 py-0.5 border border-bureau-ink/50 inline-block font-bold">
                        📎 ANEXO: {ev.attachment}
                      </div>
                    )}

                    {/* Suspect's Plea */}
                    <div className="mb-4 bg-bureau-paper p-3 border border-bureau-ink/40 text-xs italic text-bureau-ink leading-relaxed">
                      "{ev.pleaText}"
                    </div>

                    {/* Rubber Stamp */}
                    <div className="mb-4 text-center">
                      <div
                        className={`stamp-badge ${getStampClass(ev.stamp)} text-xs sm:text-sm animate-stamp-slam`}
                        style={{ '--rot': `${rotAngle}deg` } as React.CSSProperties}
                      >
                        {ev.stampTitle}
                      </div>
                    </div>

                    {/* Roast */}
                    <div className="p-2.5 bg-bureau-folder border border-bureau-ink text-xs mb-3">
                      <span className="block text-[9px] font-bold uppercase text-bureau-inkMuted mb-0.5">
                        Observación del Tribunal:
                      </span>
                      <p className="text-bureau-ink font-typewriter">
                        {ev.roast}
                      </p>
                    </div>
                  </div>

                  {/* Score Breakdown Footer */}
                  <div>
                    <div className="pt-2 border-t border-bureau-ink/20 grid grid-cols-3 text-[10px] text-center font-bold text-bureau-inkMuted">
                      <div>
                        <span>Creatividad:</span>
                        <div className="text-bureau-ink font-stamp text-xs">+{ev.creativityScore}</div>
                      </div>
                      <div>
                        <span>Cara Dura:</span>
                        <div className="text-bureau-ink font-stamp text-xs">+{ev.audacityScore}</div>
                      </div>
                      <div>
                        <span>Penalización:</span>
                        <div className={`font-stamp text-xs ${ev.penalty > 0 ? 'text-bureau-stampRed' : 'text-green-800'}`}>
                          {ev.penalty > 0 ? `-${ev.penalty}` : '0'}
                        </div>
                      </div>
                    </div>

                    {/* Live Jury Reactions */}
                    <div className="mt-3 pt-2 border-t border-dashed border-bureau-ink/30">
                      <span className="block text-[9px] uppercase font-bold text-bureau-inkMuted mb-1">
                        Reacción del Jurado / Sospechosos:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {REACTION_OPTIONS.map((opt) => {
                          const count = playerInfo?.reactions?.[opt] || 0;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                sfx.playStamp();
                                onReact?.(ev.playerId, opt);
                              }}
                              className={`text-[10px] font-stamp px-2 py-0.5 border border-bureau-ink transition-all ${
                                count > 0 ? 'bg-bureau-tape text-bureau-ink font-bold shadow-bureau-sm' : 'bg-bureau-paper hover:bg-bureau-folder'
                              }`}
                            >
                              {opt} {count > 0 && <span className="ml-1 text-bureau-stampRed font-bold">({count})</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
