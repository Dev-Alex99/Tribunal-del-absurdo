import dotenv from 'dotenv';
import path from 'path';

// Search in root folder and server folder with override
dotenv.config({ path: path.resolve(process.cwd(), '../.env'), override: true });
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });
dotenv.config();

const rawKey = (process.env.MINIMAX_API_KEY || '').trim();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  minimax: {
    apiKey: rawKey,
    baseUrl: process.env.MINIMAX_BASE_URL || 'https://api.minimax.io/v1',
    model: process.env.MINIMAX_MODEL || 'MiniMax-M3.1-Flash',
  },
  game: {
    briefingDurationSec: parseInt(process.env.BRIEFING_TIME_SECONDS || '18', 10),
    writingDurationSec: parseInt(process.env.WRITING_TIME_SECONDS || '75', 10),
    verdictDurationSec: parseInt(process.env.VERDICT_TIME_SECONDS || '35', 10),
    totalRounds: parseInt(process.env.TOTAL_ROUNDS || '3', 10),
    maxPlayers: 4,
  }
};
