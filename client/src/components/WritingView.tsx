import React, { useState, useEffect, useRef } from 'react';
import { Send, Clock, CheckCircle2, AlertCircle, Paperclip } from 'lucide-react';
import { CaseData, Player } from '../types';
import { getEstimatedServerTime } from '../socket';
import { sfx } from '../audio/sfx';

interface WritingProps {
  currentCase: CaseData;
  timerEndsAt: number | null;
  onSubmitPlea: (text: string, attachment?: string) => void;
  currentUser: Player | undefined;
  allPlayers: Player[];
}

const BUREAUCRATIC_ATTACHMENTS = [
  { id: 'soborno', label: 'Soborno de Mesa de Entradas', desc: 'Adjunta media medialuna y un café tibio para el Magistrado', icon: '🥐' },
  { id: 'amnesia', label: 'Certificado de Amnesia Burocrática', desc: 'Atenúa la multa si olvida palabras obligatorias', icon: '📜' },
  { id: 'firma_falsa', label: 'Firma Falsificada del Viceministro', desc: 'Arriesga condena doble o absolución por sorpresa', icon: '🕵️' },
  { id: 'letra_ilegible', label: 'Pliego de Letra Ilegible', desc: 'Alegato con caligrafía de médico indescifrable', icon: '📄' },
];

export const WritingView: React.FC<WritingProps> = ({
  currentCase,
  timerEndsAt,
  onSubmitPlea,
  currentUser,
  allPlayers,
}) => {
  const draftKey = `tribunal_draft_${currentCase.caseNumber}`;
  const [pleaText, setPleaText] = useState(() => localStorage.getItem(draftKey) || '');
  const [selectedAttachmentId, setSelectedAttachmentId] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(75);
  const prevSecRef = useRef<number>(secondsLeft);
  const isSubmitted = currentUser?.hasSubmitted ?? false;

  // Latency-tolerant server timer countdown & clock ticks
  useEffect(() => {
    if (!timerEndsAt) return;
    const interval = setInterval(() => {
      const now = getEstimatedServerTime();
      const remaining = Math.max(0, Math.ceil((timerEndsAt - now) / 1000));
      setSecondsLeft(remaining);

      // Play tick on second change
      if (remaining !== prevSecRef.current && remaining > 0) {
        prevSecRef.current = remaining;
        sfx.playClockTick(remaining <= 15);
      }

      // Warning bell when 12 seconds left
      if (remaining === 12) {
        sfx.playCarriageBell();
      }
    }, 200);

    return () => clearInterval(interval);
  }, [timerEndsAt]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isSubmitted) return;
    const text = e.target.value;
    setPleaText(text);
    localStorage.setItem(draftKey, text);
    sfx.playTypewriterKey();
  };

  const handleSelectAttachment = (id: string) => {
    if (isSubmitted) return;
    sfx.playStamp();
    setSelectedAttachmentId(prev => prev === id ? null : id);
  };

  const handleSubmit = () => {
    if (isSubmitted || isDispatching) return;
    setIsDispatching(true);
    sfx.playStamp();
    sfx.playPneumaticWhoosh();
    setTimeout(() => {
      sfx.playCarriageBell();
      localStorage.removeItem(draftKey);
      const attachment = BUREAUCRATIC_ATTACHMENTS.find(a => a.id === selectedAttachmentId);
      onSubmitPlea(pleaText.trim(), attachment?.label);
      setIsDispatching(false);
    }, 450);
  };

  // Check which mandatory words are used
  const lowerText = pleaText.toLowerCase();
  const wordStatus = currentCase.requiredWords.map((word) => ({
    word,
    isUsed: lowerText.includes(word.toLowerCase()),
  }));

  const submittedCount = allPlayers.filter(p => p.hasSubmitted).length;
  const currentAttachment = BUREAUCRATIC_ATTACHMENTS.find(a => a.id === selectedAttachmentId);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Typewriter Desk Envelope */}
      <div className="relative bg-bureau-folder border-3 border-bureau-ink rounded p-4 sm:p-8 shadow-bureau-lg animate-folder-open">
        {/* Paperclip */}
        <div className="paperclip"></div>

        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between border-b-2 border-bureau-ink pb-3 mb-4 gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-bureau-inkMuted block">
              Mesa de Redacción Judicial • Causa {currentCase.caseNumber}
            </span>
            <h2 className="font-stamp text-lg sm:text-xl font-bold uppercase text-bureau-ink truncate max-w-md">
              {currentCase.title}
            </h2>
          </div>

          {/* Timer Display */}
          <div className="flex items-center gap-2 border-2 border-bureau-ink bg-bureau-paper px-3 py-1 shadow-bureau-sm">
            <Clock size={16} className={secondsLeft <= 15 ? 'text-bureau-stampRed animate-bounce' : 'text-bureau-ink'} />
            <span className="text-[10px] uppercase font-bold text-bureau-inkMuted">Plazo:</span>
            <span className={`font-stamp text-xl font-bold tracking-wider ${secondsLeft <= 15 ? 'text-bureau-stampRed' : 'text-bureau-ink'}`}>
              {secondsLeft}s
            </span>
          </div>
        </div>

        {/* Live Word Requirements Checklist */}
        <div className="bg-bureau-paper p-3 border-2 border-bureau-ink mb-4 shadow-bureau-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-bureau-inkMuted">
              Palabras que debe contener su alegato (bajo apercibimiento de multa):
            </span>
            <span className="text-[10px] text-bureau-inkMuted font-bold">
              {wordStatus.filter(w => w.isUsed).length} / 3 Cumplidas
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {wordStatus.map(({ word, isUsed }, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 font-stamp tracking-wider font-bold border transition-colors ${
                  isUsed
                    ? 'border-green-800 bg-green-100 text-green-900'
                    : 'border-bureau-stampRed bg-red-50 text-bureau-stampRed'
                }`}
              >
                {isUsed ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                {word.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        {/* Bureaucratic Attachments / Bribery Badges Selector */}
        {!isSubmitted && (
          <div className="mb-4 bg-bureau-paperAged p-3 border-2 border-bureau-ink shadow-bureau-sm">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-bureau-inkMuted mb-2 flex items-center gap-1.5">
              <Paperclip size={14} />
              Adjuntar Anexo Burocrático de Emergencia (Opcional - Elija 1):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BUREAUCRATIC_ATTACHMENTS.map(att => {
                const isSelected = selectedAttachmentId === att.id;
                return (
                  <button
                    key={att.id}
                    type="button"
                    onClick={() => handleSelectAttachment(att.id)}
                    className={`p-2 border-2 text-left transition-all flex items-start gap-2 ${
                      isSelected
                        ? 'border-bureau-stampRed bg-bureau-paper shadow-bureau-sm ring-1 ring-bureau-stampRed'
                        : 'border-bureau-ink bg-bureau-folder hover:bg-bureau-paper'
                    }`}
                  >
                    <span className="text-xl shrink-0">{att.icon}</span>
                    <div className="min-w-0">
                      <div className="font-stamp text-xs uppercase font-bold text-bureau-ink leading-tight">
                        {att.label}
                      </div>
                      <div className="text-[10px] text-bureau-inkMuted leading-tight mt-0.5">
                        {att.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* The Typewriter Paper Sheet */}
        <div className={`relative border-2 border-bureau-ink shadow-bureau-sm bg-bureau-paper mb-4 transition-transform ${
          isDispatching ? 'animate-pneumatic-dispatch' : ''
        }`}>
          <div className="bg-bureau-paperAged border-b border-bureau-ink px-3 py-1 flex items-center justify-between text-[11px] text-bureau-inkMuted font-bold uppercase">
            <span>Alegato de Descargo en Papel Sellado</span>
            <div className="flex items-center gap-2">
              {currentAttachment && (
                <span className="text-[10px] px-1.5 py-0.5 border border-bureau-stampRed bg-red-50 text-bureau-stampRed font-stamp font-bold">
                  {currentAttachment.icon} ANEXO ADJUNTO
                </span>
              )}
              <span>{pleaText.length} caracteres</span>
            </div>
          </div>

          <textarea
            value={pleaText}
            onChange={handleChange}
            disabled={isSubmitted}
            rows={7}
            placeholder={
              isSubmitted
                ? 'Su alegato ya fue sellado y remitido a los estrados del tribunal...'
                : 'Señor Magistrado: Yo no me encontraba allí, y si estaba allí, fue porque...'
            }
            className={`w-full p-4 font-typewriter text-base sm:text-lg text-bureau-ink legal-ruled-paper focus:outline-none resize-none placeholder:text-bureau-inkFaded leading-7 ${
              isSubmitted ? 'opacity-80 bg-gray-100 cursor-not-allowed' : ''
            }`}
          />

          {/* Stamped Receipt Overlay if Submitted */}
          {isSubmitted && (
            <div className="absolute inset-0 bg-bureau-paper/85 flex flex-col items-center justify-center p-4">
              <div className="stamp-badge stamp-green text-base sm:text-xl py-3 px-6 shadow-bureau animate-stamp-slam">
                ALEGATO RADICADO EN MESA DE ENTRADAS
              </div>
              {currentUser?.attachment && (
                <div className="mt-2 text-xs font-stamp font-bold text-bureau-stampRed bg-bureau-paperAged border border-bureau-ink px-2 py-1 shadow-bureau-sm">
                  CON ANEXO: {currentUser.attachment}
                </div>
              )}
              <p className="font-typewriter text-xs text-bureau-ink mt-3 font-bold bg-bureau-folder px-3 py-1 border border-bureau-ink">
                Expediente bajo custodia judicial. Esperando al resto de los acusados ({submittedCount}/{allPlayers.length})...
              </p>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-bureau-inkMuted">
            <span>Alegatos presentados: <strong>{submittedCount} de {allPlayers.length}</strong></span>
          </div>

          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={!pleaText.trim()}
              className="btn-bureau btn-bureau-red px-6 py-2.5 text-sm font-stamp uppercase font-bold flex items-center gap-2"
            >
              <Send size={15} />
              Firmar y Remitir al Juez
            </button>
          ) : (
            <div className="stamp-badge stamp-blue text-xs py-1 px-3">
              EN ESPERA DEL CIERRE DE PLAZO
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
