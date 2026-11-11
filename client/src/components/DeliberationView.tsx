import React, { useEffect, useState } from 'react';
import { Scale, Loader2 } from 'lucide-react';
import { sfx } from '../audio/sfx';

const DELIBERATION_PHRASES = [
  'Verificando sellos oficiales y raspaduras de tinta...',
  'MiniMax M3.1 contrastando testimonios con el sentido común...',
  'El Magistrado busca sus anteojos de carey bajo una pila de expedientes...',
  'Calculando agravantes por falta de pudor y cara dura...',
  'El fiscal adjunto bosteza ruidosamente mientras calienta el café...',
  'Entintando el sello de culpabilidad con pigmento carmín...'
];

export const DeliberationView: React.FC = () => {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    sfx.playPaperRustle();
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % DELIBERATION_PHRASES.length);
      sfx.playTypewriterKey();
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="relative bg-bureau-paper border-3 border-bureau-ink rounded p-8 sm:p-12 shadow-bureau-lg">
        {/* Paperclip */}
        <div className="paperclip"></div>

        <div className="w-16 h-16 mx-auto mb-4 border-2 border-bureau-ink rounded-full flex items-center justify-center bg-bureau-folder shadow-bureau-sm">
          <Scale size={32} className="text-bureau-ink animate-pulse" />
        </div>

        <span className="text-[11px] uppercase tracking-widest font-bold bg-bureau-ink text-bureau-paper px-2 py-0.5 inline-block mb-3">
          SALA DE ACUERDOS DEL TRIBUNAL
        </span>

        <h2 className="font-stamp text-2xl sm:text-3xl font-bold uppercase text-bureau-ink mb-3">
          El Tribunal delibera a puerta cerrada
        </h2>

        <p className="font-typewriter text-sm sm:text-base text-bureau-inkMuted mb-6 min-h-[3rem] flex items-center justify-center px-4">
          « {DELIBERATION_PHRASES[phraseIndex]} »
        </p>

        <div className="inline-flex items-center gap-2 border-2 border-bureau-ink bg-bureau-folder px-4 py-2 shadow-bureau-sm text-xs font-stamp font-bold text-bureau-ink">
          <Loader2 size={16} className="animate-spin text-bureau-stampRed" />
          PROCESANDO SENTENCIAS CON MINIMAX M3.1 FLASH...
        </div>
      </div>
    </div>
  );
};
