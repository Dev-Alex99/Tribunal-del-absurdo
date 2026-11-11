import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Award } from 'lucide-react';
import { FinalPodiumData, Player } from '../types';
import { sfx } from '../audio/sfx';

interface PodiumProps {
  podium: FinalPodiumData;
  players: Player[];
  isHost: boolean;
  onPlayAgain: () => void;
}

export const PodiumView: React.FC<PodiumProps> = ({
  podium,
  players,
  isHost,
  onPlayAgain,
}) => {
  useEffect(() => {
    sfx.playGavel();
    setTimeout(() => {
      sfx.playStamp();
      // Paper confetti burst in vintage tones
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8f1d1d', '#1e2b47', '#d8caa7', '#1c1a17', '#f9f6ee'],
      });
    }, 400);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Dossier Card */}
      <div className="relative bg-bureau-paper border-3 border-bureau-ink rounded p-6 sm:p-10 shadow-bureau-lg text-center">
        {/* Paperclip */}
        <div className="paperclip"></div>

        <div className="w-16 h-16 mx-auto mb-4 border-2 border-bureau-ink rounded-full flex items-center justify-center bg-bureau-folder shadow-bureau-sm">
          <Trophy size={32} className="text-bureau-stampRed" />
        </div>

        <span className="text-[11px] font-bold tracking-widest uppercase bg-bureau-stampRed text-bureau-paper px-3 py-1 inline-block mb-3">
          SENTENCIA FIRME E INAPELABLE
        </span>

        <h2 className="font-stamp text-2xl sm:text-4xl font-bold uppercase text-bureau-ink mb-1">
          Causa Concluida Definitivamente
        </h2>
        <p className="text-xs text-bureau-inkMuted mb-6">
          El Tribunal ha computado todas las actuaciones y otorga la máxima indulgencia.
        </p>

        {/* Winner Highlight */}
        <div className="my-6 p-6 bg-bureau-paperAged border-3 border-bureau-ink shadow-bureau relative">
          <div className="stamp-badge stamp-green text-sm sm:text-base mb-3 animate-stamp-slam">
            INDULTO ABSOLUTO Y RECONOCIMIENTO
          </div>

          <div className="text-2xl sm:text-4xl font-stamp font-bold text-bureau-stampRed uppercase tracking-wide">
            {podium.winnerName}
          </div>

          <div className="mt-2 text-xs sm:text-sm font-bold text-bureau-ink uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Award size={16} className="text-bureau-stampRed" />
            Título Honorífico: «{podium.honorificTitle}»
          </div>
        </div>

        {/* Full Ranking Table */}
        <div className="my-8 text-left">
          <h3 className="font-stamp text-sm uppercase font-bold text-bureau-ink mb-3">
            Cuadro General de Puntuaciones:
          </h3>

          <div className="border-2 border-bureau-ink bg-bureau-folder shadow-bureau-sm overflow-hidden">
            <table className="w-full text-xs font-typewriter">
              <thead>
                <tr className="border-b-2 border-bureau-ink bg-bureau-paper text-bureau-ink font-bold uppercase text-[10px]">
                  <th className="py-2 px-3 text-center w-12">Pos.</th>
                  <th className="py-2 px-3 text-left">Sospechoso</th>
                  <th className="py-2 px-3 text-right">Puntaje Acumulado</th>
                </tr>
              </thead>
              <tbody>
                {podium.finalRankings.map((rank, i) => {
                  const p = players.find(pl => pl.id === rank.playerId);
                  return (
                    <tr
                      key={rank.playerId}
                      className={`border-b border-bureau-ink/30 ${
                        i === 0 ? 'bg-bureau-paper font-bold' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center font-stamp text-sm">
                        #{i + 1}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span>{rank.playerName}</span>
                          {p?.isAI && (
                            <span className="text-[9px] uppercase px-1 border border-bureau-ink bg-bureau-paperAged">
                              IA
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-stamp text-sm text-bureau-stampRed">
                        {rank.totalScore} pts
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Button */}
        {isHost ? (
          <button
            onClick={() => {
              sfx.playGavel();
              onPlayAgain();
            }}
            className="btn-bureau btn-bureau-red px-8 py-3 font-stamp text-sm font-bold uppercase tracking-wider inline-flex items-center gap-2"
          >
            <RotateCcw size={16} />
            Instruir Nueva Causa Judicial
          </button>
        ) : (
          <div className="text-xs text-bureau-inkMuted italic">
            Esperando que el anfitrión abra un nuevo expediente...
          </div>
        )}
      </div>
    </div>
  );
};
