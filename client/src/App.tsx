import React, { useEffect, useState } from 'react';
import { socket } from './socket';
import { RoomState } from './types';
import { BureauHeader } from './components/BureauHeader';
import { LobbyView } from './components/LobbyView';
import { BriefingView } from './components/BriefingView';
import { WritingView } from './components/WritingView';
import { DeliberationView } from './components/DeliberationView';
import { VerdictView } from './components/VerdictView';
import { PodiumView } from './components/PodiumView';
import { TutorialModal } from './components/TutorialModal';
import { sfx } from './audio/sfx';

export const App: React.FC = () => {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [playerId, setPlayerId] = useState<string>(() => sessionStorage.getItem('tribunal_player_id') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState(() => {
    return localStorage.getItem('tribunal_tutorial_seen') !== 'true';
  });

  // Start music & audio on first user touch / click
  useEffect(() => {
    const handleFirstUserInteraction = () => {
      sfx.initCtx();
      if (sfx.isMusicEnabled && !sfx.isMuted) {
        sfx.startMusic();
      }
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
    };

    window.addEventListener('click', handleFirstUserInteraction);
    window.addEventListener('keydown', handleFirstUserInteraction);
    return () => {
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
    };
  }, []);

  useEffect(() => {
    socket.on('room:state', (updated: RoomState) => {
      setRoomState(updated);
    });

    socket.on('connect', () => {
      setErrorMessage(null);
    });

    socket.on('disconnect', () => {
      // Keep optimistic state, UI stays visible
    });

    return () => {
      socket.off('room:state');
    };
  }, []);

  const handleCreateRoom = (name: string, avatarIndex: number) => {
    setIsLoading(true);
    setErrorMessage(null);

    socket.emit('room:create', { playerName: name, avatarIndex }, (res: any) => {
      setIsLoading(false);
      if (res?.success) {
        setPlayerId(res.playerId);
        sessionStorage.setItem('tribunal_player_id', res.playerId);
        setRoomState(res.roomState);
      } else {
        setErrorMessage(res?.error || 'No se pudo abrir la sala en el archivo judicial.');
      }
    });
  };

  const handleJoinRoom = (code: string, name: string, avatarIndex: number) => {
    setIsLoading(true);
    setErrorMessage(null);

    socket.emit('room:join', { code, playerName: name, avatarIndex }, (res: any) => {
      setIsLoading(false);
      if (res?.success) {
        setPlayerId(res.playerId);
        sessionStorage.setItem('tribunal_player_id', res.playerId);
        setRoomState(res.roomState);
      } else {
        setErrorMessage(res?.error || 'Expediente no hallado o sala cerrada.');
      }
    });
  };

  const handleStartGame = () => {
    if (!roomState?.code) return;
    socket.emit('game:start', { code: roomState.code });
  };

  const handleSubmitPlea = (text: string, attachment?: string) => {
    if (!roomState?.code) return;
    socket.emit('plea:submit', { code: roomState.code, text, attachment });
  };

  const handleReact = (targetPlayerId: string, reaction: string) => {
    if (!roomState?.code) return;
    socket.emit('verdict:react', { code: roomState.code, targetPlayerId, reaction });
  };

  const handleLeaveRoom = () => {
    sessionStorage.removeItem('tribunal_player_id');
    setRoomState(null);
    setPlayerId('');
    window.location.search = '';
  };

  const currentUser = roomState?.players.find((p) => p.id === playerId);
  const isHost = currentUser?.isHost ?? false;

  return (
    <div className="min-h-screen flex flex-col justify-between relative">
      {/* Antique Desk Vignette Overlay for tactile immersion */}
      <div className="pointer-events-none fixed inset-0 desk-vignette z-30" />

      {/* Official Government Header */}
      <BureauHeader
        roomState={roomState}
        onLeaveRoom={roomState ? handleLeaveRoom : undefined}
        onOpenTutorial={() => setIsTutorialOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center py-4 z-10">
        {(!roomState || roomState.phase === 'LOBBY') && (
          <LobbyView
            roomState={roomState}
            playerId={playerId}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onStartGame={handleStartGame}
            onOpenTutorial={() => setIsTutorialOpen(true)}
            isLoading={isLoading}
            errorMessage={errorMessage}
          />
        )}

        {roomState && roomState.phase === 'BRIEFING' && (
          <BriefingView
            currentCase={roomState.currentCase}
            timerEndsAt={roomState.timerEndsAt}
            currentRound={roomState.currentRound}
            totalRounds={roomState.totalRounds}
          />
        )}

        {roomState && roomState.phase === 'WRITING' && roomState.currentCase && (
          <WritingView
            currentCase={roomState.currentCase}
            timerEndsAt={roomState.timerEndsAt}
            onSubmitPlea={handleSubmitPlea}
            currentUser={currentUser}
            allPlayers={roomState.players}
          />
        )}

        {roomState && roomState.phase === 'DELIBERATION' && <DeliberationView />}

        {roomState && roomState.phase === 'VERDICT' && roomState.latestVerdict && (
          <VerdictView
            verdict={roomState.latestVerdict}
            currentCase={roomState.currentCase}
            timerEndsAt={roomState.timerEndsAt}
            currentRound={roomState.currentRound}
            totalRounds={roomState.totalRounds}
            players={roomState.players}
            onReact={handleReact}
          />
        )}

        {roomState && roomState.phase === 'PODIUM' && roomState.finalPodium && (
          <PodiumView
            podium={roomState.finalPodium}
            players={roomState.players}
            isHost={isHost}
            onPlayAgain={handleStartGame}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-bureau-ink bg-bureau-paperAged py-2 px-4 text-center text-[10px] text-bureau-inkMuted uppercase z-10">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>Tribunal del Absurdo v1.2 • Formulario Oficial Inapelable</span>
          <span>Atmósfera Sonora: Procedural Noir & Tape Flutter</span>
          <span>Inferencia: MiniMax M3.1 Flash</span>
        </div>
      </footer>

      {/* Kafkaesque Induction Wizard (Tutorial Modal) */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </div>
  );
};
