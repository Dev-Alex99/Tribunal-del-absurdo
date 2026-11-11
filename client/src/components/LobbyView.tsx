import React, { useState } from 'react';
import { Users, UserPlus, Play, Copy, Check, Sparkles, AlertCircle } from 'lucide-react';
import { RoomState } from '../types';
import { sfx } from '../audio/sfx';

interface LobbyProps {
  roomState: RoomState | null;
  playerId: string;
  onCreateRoom: (name: string, avatarIndex: number) => void;
  onJoinRoom: (code: string, name: string, avatarIndex: number) => void;
  onStartGame: () => void;
  onOpenTutorial?: () => void;
  isLoading: boolean;
  errorMessage: string | null;
}

const AVATARS = [
  { id: 0, title: 'El Acusado Sombrío', icon: '🕵️' },
  { id: 1, title: 'El Secretario Cansado', icon: '📋' },
  { id: 2, title: 'La Escribana Cómplice', icon: '🖋️' },
  { id: 3, title: 'El Inspector Neurótico', icon: '🔍' },
  { id: 4, title: 'El Falsificador de Timbres', icon: '📮' },
  { id: 5, title: 'El Archivero de Oficio', icon: '📦' },
];

export const LobbyView: React.FC<LobbyProps> = ({
  roomState,
  playerId,
  onCreateRoom,
  onJoinRoom,
  onStartGame,
  onOpenTutorial,
  isLoading,
  errorMessage,
}) => {
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('tribunal_name') || '');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [inputCode, setInputCode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('room') || '').toUpperCase();
  });
  const [copied, setCopied] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value);
    localStorage.setItem('tribunal_name', e.target.value);
    sfx.playTypewriterKey();
  };

  const handleCreate = () => {
    if (!playerName.trim()) return;
    sfx.playStamp();
    onCreateRoom(playerName.trim(), selectedAvatar);
  };

  const handleJoin = () => {
    if (!playerName.trim() || !inputCode.trim()) return;
    sfx.playStamp();
    onJoinRoom(inputCode.trim(), playerName.trim(), selectedAvatar);
  };

  const copyShareLink = () => {
    if (!roomState) return;
    const url = `${window.location.origin}?room=${roomState.code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    sfx.playStamp();
    setTimeout(() => setCopied(false), 2000);
  };

  const isHost = roomState?.players.find(p => p.id === playerId)?.isHost;
  const humanCount = roomState?.players.filter(p => !p.isAI).length || 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Folder Container */}
      <div className="relative bg-bureau-folder border-3 border-bureau-ink rounded-lg p-4 sm:p-8 shadow-bureau-lg animate-folder-open">
        {/* Paperclip Accent */}
        <div className="paperclip"></div>

        {/* Folder Header */}
        <div className="flex flex-wrap items-center justify-between border-b-2 border-bureau-ink pb-4 mb-6 gap-2">
          <div>
            <span className="text-[11px] uppercase tracking-widest bg-bureau-ink text-bureau-paper px-2 py-0.5 font-bold">
              EXPEDIENTE PRELIMINAR DE COMPARECENCIA
            </span>
            <h2 className="font-stamp text-2xl sm:text-3xl uppercase font-bold text-bureau-ink mt-1">
              {roomState ? `Sala de Audiencias: ${roomState.code}` : 'Apertura de Causa Judicial'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {onOpenTutorial && (
              <button
                type="button"
                onClick={onOpenTutorial}
                className="btn-bureau text-[10px] px-2.5 py-1 font-stamp uppercase font-bold flex items-center gap-1 text-bureau-stampRed"
                title="Abrir Manual del Procesado"
              >
                📖 Guía / Tutorial
              </button>
            )}
            <div className="stamp-badge stamp-red text-xs">
              {roomState ? 'ESTADO: ESPERANDO SOSPECHOSOS' : 'ACCESO PÚBLICO'}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-3 bg-red-100 border-2 border-bureau-stampRed text-bureau-stampRed text-xs font-bold flex items-center gap-2 shadow-bureau-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* View 1: Not in Room Yet */}
        {!roomState ? (
          <div className="space-y-6">
            {/* Step 1: Suspect Name & Dossier */}
            <div className="bg-bureau-paper p-5 border-2 border-bureau-ink shadow-bureau-sm">
              <label className="block text-xs font-bold uppercase tracking-wider text-bureau-inkMuted mb-2">
                Identidad del Acusado / Sospechoso:
              </label>
              <input
                type="text"
                value={playerName}
                onChange={handleNameChange}
                maxLength={20}
                placeholder="Escriba su nombre o alias..."
                className="w-full bg-transparent border-b-2 border-bureau-ink font-typewriter text-lg text-bureau-ink px-1 py-1 focus:outline-none focus:border-bureau-stampRed placeholder:text-bureau-inkFaded"
              />

              {/* Avatar Selector */}
              <div className="mt-4">
                <span className="block text-[11px] font-bold uppercase text-bureau-inkMuted mb-2">
                  Retrato Policial de Registro:
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(av.id);
                        sfx.playTypewriterKey();
                      }}
                      className={`p-2 border-2 text-center transition-all ${
                        selectedAvatar === av.id
                          ? 'border-bureau-stampRed bg-bureau-paperAged shadow-bureau-sm -translate-y-0.5'
                          : 'border-bureau-ink bg-bureau-folder hover:bg-bureau-paper'
                      }`}
                    >
                      <div className="text-2xl">{av.icon}</div>
                      <div className="text-[9px] font-bold mt-1 text-bureau-ink leading-tight">
                        {av.title}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: Actions (Create or Join) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A: Create New Room */}
              <div className="bg-bureau-paperAged p-5 border-2 border-bureau-ink shadow-bureau-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-stamp text-lg uppercase font-bold text-bureau-ink mb-1 flex items-center gap-2">
                    <Sparkles size={18} className="text-bureau-stampRed" />
                    Abrir Nueva Causa
                  </h3>
                  <p className="text-xs text-bureau-inkMuted mb-4">
                    Inicia un nuevo juicio. Podrás invitar hasta 3 amigos mediante enlace directo o jugar en solitario contra la IA.
                  </p>
                </div>
                <button
                  onClick={handleCreate}
                  disabled={!playerName.trim() || isLoading}
                  className="btn-bureau btn-bureau-red w-full py-3 px-4 text-sm font-bold uppercase flex items-center justify-center gap-2"
                >
                  <UserPlus size={16} />
                  {isLoading ? 'Abriendo Expediente...' : 'Crear Sala Oficial'}
                </button>
              </div>

              {/* Option B: Join by Code */}
              <div className="bg-bureau-paperAged p-5 border-2 border-bureau-ink shadow-bureau-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-stamp text-lg uppercase font-bold text-bureau-ink mb-1 flex items-center gap-2">
                    <Users size={18} className="text-bureau-ink" />
                    Personarse en Causa
                  </h3>
                  <p className="text-xs text-bureau-inkMuted mb-2">
                    Ingrese el código de 4 caracteres provisto por el tribunal o su anfitrión:
                  </p>
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => {
                      setInputCode(e.target.value.toUpperCase());
                      sfx.playTypewriterKey();
                    }}
                    maxLength={4}
                    placeholder="EJ: KAFK"
                    className="w-full bg-bureau-paper border-2 border-bureau-ink font-stamp text-center tracking-widest text-xl py-1 text-bureau-stampRed uppercase focus:outline-none mb-4"
                  />
                </div>
                <button
                  onClick={handleJoin}
                  disabled={!playerName.trim() || !inputCode.trim() || isLoading}
                  className="btn-bureau w-full py-3 px-4 text-sm font-bold uppercase flex items-center justify-center gap-2"
                >
                  <Play size={16} />
                  {isLoading ? 'Verificando...' : 'Entrar a la Audiencia'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* View 2: In Room Waiting for Players */
          <div className="space-y-6">
            {/* Share Link Banner */}
            <div className="bg-bureau-paper p-4 border-2 border-bureau-ink shadow-bureau-sm flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase text-bureau-inkMuted">
                  Enlace para convocar cómplices (1 a 4 jugadores):
                </span>
                <div className="font-stamp text-sm sm:text-base text-bureau-stampRed tracking-wider font-bold">
                  {window.location.origin}?room={roomState.code}
                </div>
              </div>
              <button
                onClick={copyShareLink}
                className="btn-bureau px-4 py-2 text-xs flex items-center gap-1.5 font-bold uppercase"
              >
                {copied ? <Check size={14} className="text-green-800" /> : <Copy size={14} />}
                {copied ? '¡Copiado al Portapapeles!' : 'Copiar Convocatoria'}
              </button>
            </div>

            {/* Solo Mode Notification if 1 player */}
            {humanCount === 1 && (
              <div className="p-3 bg-amber-50 border-2 border-bureau-ink text-bureau-ink text-xs shadow-bureau-sm flex items-start gap-3">
                <span className="text-xl">⚖️</span>
                <div>
                  <strong className="font-stamp uppercase text-bureau-stampRed block text-sm">
                    Modo Individual Habilitado
                  </strong>
                  <span>
                    Estás solo en la sala. Si inicias ahora, el tribunal convocará al <strong>Dr. Barnabás K. (Abogado Autómata)</strong> como tu contrincante oficial. ¡Competirán 1v1 juzgados por MiniMax M3.1!
                  </span>
                </div>
              </div>
            )}

            {/* Suspect Roster */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-stamp text-sm uppercase font-bold text-bureau-ink">
                  Sospechosos Presentes en el Banquillo ({roomState.players.length} / 4):
                </h3>
                <span className="text-xs text-bureau-inkMuted">
                  {4 - roomState.players.length} plaza(s) libres
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roomState.players.map((p) => {
                  const avatar = AVATARS[p.avatarIndex] || AVATARS[0];
                  const isCurrent = p.id === playerId;
                  return (
                    <div
                      key={p.id}
                      className={`p-3 border-2 border-bureau-ink flex items-center gap-3 shadow-bureau-sm ${
                        isCurrent ? 'bg-bureau-paper' : 'bg-bureau-paperAged'
                      }`}
                    >
                      <div className="text-3xl p-1 bg-bureau-folder border border-bureau-ink">
                        {avatar.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm truncate">{p.name}</span>
                          {p.isHost && (
                            <span className="text-[9px] uppercase px-1 border border-bureau-ink bg-bureau-tape font-bold">
                              Fiscal/Host
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[9px] uppercase px-1 bg-bureau-stampRed text-bureau-paper font-bold">
                              Tú
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-bureau-inkMuted truncate">
                          {avatar.title}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Host Launch Panel */}
            <div className="pt-4 border-t-2 border-bureau-ink flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-bureau-inkMuted text-center sm:text-left">
                {isHost ? (
                  humanCount === 1 ? (
                    <span>Puedes iniciar ahora mismo o esperar a que se unan amigos.</span>
                  ) : (
                    <span>Todos los sospechosos están listos en la sala.</span>
                  )
                ) : (
                  <span>Esperando que el anfitrión ordene iniciar el juicio...</span>
                )}
              </div>

              {isHost ? (
                <button
                  onClick={() => {
                    sfx.playGavel();
                    onStartGame();
                  }}
                  className="btn-bureau btn-bureau-red w-full sm:w-auto px-6 py-3 font-stamp text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Play size={16} />
                  Dar Comienzo a la Audiencia
                </button>
              ) : (
                <div className="stamp-badge stamp-blue text-xs">
                  AUDIENCIA PENDIENTE
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
