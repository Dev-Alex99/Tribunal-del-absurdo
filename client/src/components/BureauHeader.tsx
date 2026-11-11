import React, { useState } from 'react';
import { Volume2, VolumeX, Radio, Copy, Check, Scale, HelpCircle } from 'lucide-react';
import { sfx } from '../audio/sfx';
import { RoomState } from '../types';

interface HeaderProps {
  roomState: RoomState | null;
  onLeaveRoom?: () => void;
  onOpenTutorial?: () => void;
}

export const BureauHeader: React.FC<HeaderProps> = ({ roomState, onLeaveRoom, onOpenTutorial }) => {
  const [muted, setMuted] = useState(sfx.isMuted);
  const [musicEnabled, setMusicEnabled] = useState(sfx.isMusicEnabled);
  const [copied, setCopied] = useState(false);

  const toggleAudio = () => {
    const isNowMuted = sfx.toggleMute();
    setMuted(isNowMuted);
    if (!isNowMuted) {
      sfx.playCarriageBell();
    }
  };

  const toggleMusic = () => {
    sfx.initCtx();
    const isEnabled = sfx.toggleMusic();
    setMusicEnabled(isEnabled);
  };

  const copyRoomLink = () => {
    if (!roomState?.code) return;
    const url = `${window.location.origin}?room=${roomState.code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    sfx.playStamp();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="border-b-2 border-bureau-ink bg-bureau-paperAged py-2 px-3 sm:px-6 shadow-sm">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Title & Official Ministry Seal */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-bureau-ink rounded-full flex items-center justify-center bg-bureau-folder font-stamp text-bureau-stampRed font-bold shadow-bureau-sm">
            <Scale size={20} className="text-bureau-ink" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-stamp text-base sm:text-lg tracking-wider text-bureau-ink uppercase font-bold leading-none">
                Tribunal del Absurdo
              </h1>
              <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 border border-bureau-ink bg-bureau-folder font-bold">
                Formulario 77-B
              </span>
            </div>
            <p className="text-[11px] text-bureau-inkMuted tracking-tight">
              Ministerio de Causas Inexplicables • Sala Burocrática
            </p>
          </div>
        </div>

        {/* Room Info & Controls */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          {roomState?.code && (
            <div className="flex items-center gap-1.5 border-2 border-bureau-ink bg-bureau-paper px-2 py-1 shadow-bureau-sm">
              <span className="text-[10px] text-bureau-inkMuted uppercase font-bold">Expediente:</span>
              <span className="font-stamp text-base font-bold text-bureau-stampRed tracking-widest">
                {roomState.code}
              </span>
              <button
                onClick={copyRoomLink}
                title="Copiar enlace de la sala"
                className="p-1 hover:bg-bureau-folder transition-colors ml-1"
              >
                {copied ? <Check size={14} className="text-green-700" /> : <Copy size={14} />}
              </button>
            </div>
          )}

          {/* Tutorial / Help Button */}
          {onOpenTutorial && (
            <button
              onClick={onOpenTutorial}
              className="p-1.5 border-2 border-bureau-ink bg-bureau-paper hover:bg-bureau-folder transition-colors shadow-bureau-sm flex items-center gap-1 text-xs font-stamp"
              title="Manual de Inducción del Acusado (Tutorial)"
            >
              <HelpCircle size={15} className="text-bureau-stampRed" />
              <span className="hidden sm:inline text-[10px] uppercase font-bold">Instrucciones</span>
            </button>
          )}

          {/* Ambient Music Toggle */}
          <button
            onClick={toggleMusic}
            className={`p-1.5 border-2 border-bureau-ink transition-colors shadow-bureau-sm flex items-center gap-1 text-xs font-stamp ${
              musicEnabled && !muted ? 'bg-bureau-tape text-bureau-ink font-bold' : 'bg-bureau-paper text-bureau-inkFaded'
            }`}
            title={musicEnabled ? 'Desactivar música de suspenso noir' : 'Activar música de suspenso noir'}
          >
            <Radio size={15} className={musicEnabled && !muted ? 'animate-pulse text-bureau-stampRed' : ''} />
            <span className="hidden sm:inline text-[10px] uppercase">
              {musicEnabled && !muted ? 'Música: ON' : 'Música: OFF'}
            </span>
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={toggleAudio}
            className="p-1.5 border-2 border-bureau-ink bg-bureau-paper hover:bg-bureau-folder transition-colors shadow-bureau-sm text-bureau-ink"
            title={muted ? 'Activar sonido de máquina de escribir' : 'Silenciar efectos'}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Leave Room Button */}
          {roomState && onLeaveRoom && (
            <button
              onClick={onLeaveRoom}
              className="text-xs font-stamp px-2 py-1 border border-bureau-ink text-bureau-stampRed hover:bg-bureau-folder transition-colors"
            >
              Cerrar Causa
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
