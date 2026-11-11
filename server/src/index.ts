import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { RoomManager } from './game/RoomManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingInterval: 10000,
  pingTimeout: 5000,
});

const roomManager = new RoomManager(io);

// Health & Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    name: 'Tribunal del Absurdo Server',
    status: 'ONLINE',
    minimaxConfigured: !!config.minimax.apiKey,
    model: config.minimax.model,
    baseUrl: config.minimax.baseUrl,
    time: new Date().toISOString(),
  });
});

// Serve frontend in production
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), err => {
    if (err) next();
  });
});

// WebSocket Protocol
io.on('connection', (socket: Socket) => {
  console.log(`[Socket] Conexión establecida: ${socket.id}`);

  // High-latency clock synchronization
  socket.on('ping:sync', (clientTimestamp: number, callback: (res: { clientTimestamp: number; serverTimestamp: number }) => void) => {
    if (typeof callback === 'function') {
      callback({
        clientTimestamp,
        serverTimestamp: Date.now(),
      });
    }
  });

  // Create Room
  socket.on('room:create', ({ playerName, avatarIndex }, callback) => {
    try {
      const room = roomManager.createRoom();
      const safeName = (playerName || 'Acusado Anónimo').trim().slice(0, 18);
      const player = room.addPlayer(socket.id, safeName, avatarIndex ?? 0);
      
      socket.join(room.code);
      console.log(`[Socket] ${safeName} creó la sala ${room.code}`);

      if (typeof callback === 'function') {
        callback({
          success: true,
          code: room.code,
          playerId: player.id,
          roomState: room.getState(),
        });
      }
      room.broadcastState();
    } catch (err: any) {
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
    }
  });

  // Join Room
  socket.on('room:join', ({ code, playerName, avatarIndex }, callback) => {
    try {
      const cleanCode = (code || '').toUpperCase().trim();
      const room = roomManager.getRoom(cleanCode);

      if (!room) {
        if (typeof callback === 'function') {
          callback({ success: false, error: 'Expediente no encontrado en el archivo central. Verifique el código.' });
        }
        return;
      }

      if (room.phase !== 'LOBBY' && room.phase !== 'PODIUM') {
        // Allow reconnecting if name matches existing player
        const existing = room.players.find(p => p.name.toLowerCase() === (playerName || '').toLowerCase().trim());
        if (!existing) {
          if (typeof callback === 'function') {
            callback({ success: false, error: 'La audiencia ya está en curso. Espere a que termine la causa.' });
          }
          return;
        }
      }

      const safeName = (playerName || 'Acusado Anónimo').trim().slice(0, 18);
      const player = room.addPlayer(socket.id, safeName, avatarIndex ?? 0);
      socket.join(room.code);

      console.log(`[Socket] ${safeName} se unió a la sala ${room.code}`);

      if (typeof callback === 'function') {
        callback({
          success: true,
          code: room.code,
          playerId: player.id,
          roomState: room.getState(),
        });
      }
      room.broadcastState();
    } catch (err: any) {
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
    }
  });

  // Start Game (Host only)
  socket.on('game:start', ({ code }) => {
    const room = roomManager.getRoom(code);
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player || !player.isHost) return;

    room.startGame();
  });

  // Submit Plea
  socket.on('plea:submit', ({ code, text, attachment }) => {
    const room = roomManager.getRoom(code);
    if (!room) return;
    room.submitPlea(socket.id, text, attachment);
  });

  // Live Jury Reactions in Verdict
  socket.on('verdict:react', ({ code, targetPlayerId, reaction }) => {
    const room = roomManager.getRoom(code);
    if (!room) return;
    room.addReaction(targetPlayerId, reaction);
  });

  // Disconnect
  socket.on('disconnect', () => {
    roomManager.handleDisconnect(socket.id);
  });
});

httpServer.listen(config.port, () => {
  console.log('========================================================');
  console.log(`⚖️  TRIBUNAL DEL ABSURDO — MINISTERIO DE CAUSAS PERDIDAS`);
  console.log(`🏛️  Servidor escuchando en: http://localhost:${config.port}`);
  console.log(`🤖  MiniMax API: ${config.minimax.apiKey ? 'CONFIGURADA (' + config.minimax.model + ')' : 'MODO SIMULADOR ACTIVO (Sin API Key)'}`);
  console.log('========================================================');
});
