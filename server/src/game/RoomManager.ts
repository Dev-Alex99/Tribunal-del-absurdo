import { Server } from 'socket.io';
import { GameRoom } from './GameRoom.js';

export class RoomManager {
  private rooms: Map<string, GameRoom> = new Map();
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  public createRoom(): GameRoom {
    let code = this.generateCode();
    while (this.rooms.has(code)) {
      code = this.generateCode();
    }
    const room = new GameRoom(code, this.io);
    this.rooms.set(code, room);
    console.log(`[RoomManager] New Bureaucratic Chamber open: ${code}`);
    return room;
  }

  public getRoom(code: string): GameRoom | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  public removeRoom(code: string): void {
    this.rooms.delete(code.toUpperCase());
    console.log(`[RoomManager] Chamber ${code} closed and filed to archives.`);
  }

  public handleDisconnect(socketId: string): void {
    for (const [code, room] of this.rooms.entries()) {
      const player = room.players.find(p => p.id === socketId);
      if (player) {
        console.log(`[RoomManager] Player ${player.name} (${socketId}) left room ${code}`);
        room.removePlayer(socketId);
        
        // If room has no human players left, remove room after 5 minutes
        const humanCount = room.players.filter(p => !p.isAI).length;
        if (humanCount === 0) {
          setTimeout(() => {
            const currentHumanCount = room.players.filter(p => !p.isAI).length;
            if (currentHumanCount === 0) {
              this.removeRoom(code);
            }
          }, 5 * 60 * 1000);
        } else {
          room.broadcastState();
        }
        break;
      }
    }
  }

  private generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No confusing 0/O, 1/I
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
