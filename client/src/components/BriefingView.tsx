import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle, FileText } from 'lucide-react';
import { CaseData } from '../types';
import { getEstimatedServerTime } from '../socket';
import { sfx } from '../audio/sfx';

interface BriefingProps {
  currentCase: CaseData | null;
  timerEndsAt: number | null;
  currentRound: number;
  totalRounds: number;
}

export const BriefingView: React.FC<BriefingProps> = ({
  currentCase,
  timerEndsAt,
  currentRound,
  totalRounds,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(10);

  useEffect(() => {
    sfx.playPaperRustle();
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

  if (!currentCase) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="bg-bureau-paper p-8 border-2 border-bureau-ink shadow-bureau-lg font-stamp text-lg">
          DESCLASIFICANDO EXPEDIENTE JUDICIAL EN EL ARCHIVO CENTRAL...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Official Case Docket Folder */}
      <div className="relative bg-bureau-paper border-3 border-bureau-ink rounded p-6 sm:p-10 shadow-bureau-lg animate-folder-open">
        {/* Paperclip */}
        <div className="paperclip"></div>

        {/* Top Bureaucracy Header */}
        <div className="flex flex-wrap items-center justify-between border-b-2 border-bureau-ink pb-4 mb-6 gap-3">
          <div>
            <div className="text-[11px] font-bold tracking-widest uppercase bg-bureau-stampRed text-bureau-paper px-2 py-0.5 inline-block">
              AUTO DE PROCESAMIENTO INMEDIATO
            </div>
            <div className="text-xs text-bureau-inkMuted mt-1">
              Causa Nº <strong className="text-bureau-ink">{currentCase.caseNumber}</strong> • Ronda {currentRound} de {totalRounds}
            </div>
          </div>

          {/* Latency-Tolerant Analogue Countdown */}
          <div className="flex items-center gap-2 border-2 border-bureau-ink bg-bureau-paperAged px-3 py-1.5 shadow-bureau-sm">
            <Clock size={18} className="text-bureau-stampRed animate-pulse" />
            <span className="text-[11px] font-bold uppercase text-bureau-inkMuted">Lectura:</span>
            <span className="font-stamp text-xl font-bold text-bureau-stampRed tracking-wider">
              {secondsLeft}s
            </span>
          </div>
        </div>

        {/* Case Title */}
        <div className="mb-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-bureau-inkMuted block">
            Carátula del Juicio:
          </span>
          <h2 className="font-stamp text-2xl sm:text-3xl font-bold text-bureau-ink uppercase mt-1 leading-snug">
            {currentCase.title}
          </h2>
        </div>

        {/* Accuser / Plaintiff */}
        <div className="mb-6 p-3 bg-bureau-paperAged border-l-4 border-bureau-ink text-xs">
          <strong className="uppercase font-bold text-bureau-inkMuted block text-[10px] mb-0.5">
            Parte Querellante:
          </strong>
          <span className="font-bold text-bureau-ink">{currentCase.plaintiff}</span>
        </div>

        {/* Facts & Description */}
        <div className="mb-8 p-4 bg-bureau-folder border-2 border-bureau-ink shadow-bureau-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-bureau-inkMuted block mb-2 flex items-center gap-1.5">
            <FileText size={14} />
            Relación Sumaria de los Hechos:
          </span>
          <p className="font-typewriter text-sm sm:text-base text-bureau-ink leading-relaxed">
            "{currentCase.description}"
          </p>
        </div>

        {/* Compulsory Evidence Words */}
        <div className="border-t-2 border-dashed border-bureau-ink pt-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-bureau-stampRed" />
            <h3 className="font-stamp text-sm sm:text-base uppercase font-bold text-bureau-stampRed">
              Cláusula Obligatoria: Pruebas Léxicas Indispensables
            </h3>
          </div>
          <p className="text-xs text-bureau-inkMuted mb-3">
            En la siguiente fase deberá redactar su alegato de defensa. Para no incurrir en desacato, <strong>debe incluir forzosamente</strong> estas 3 palabras en su texto:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {currentCase.requiredWords.map((word, i) => (
              <div
                key={i}
                className="stamp-badge stamp-red text-center py-2 px-3 text-sm tracking-widest font-bold shadow-bureau-sm"
              >
                PRUEBA #{i + 1}: "{word.toUpperCase()}"
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Notice */}
        <div className="mt-8 text-center text-xs text-bureau-inkMuted italic">
          Prepare mentalmente sus argumentos. El taquígrafo iniciará el registro al concluir los segundos de lectura...
        </div>
      </div>
    </div>
  );
};
