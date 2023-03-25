import { config } from 'dotenv';

config();

if (!process.env.TOKEN) {
  throw new Error('TOKEN is not defined');
}

export const ENV = {
  TOKEN: process.env.TOKEN as string,
  PREFIX: process.env.PREFIX || '!',
  TEXT_CHANNEL_ID: process.env.TEXT_CHANNEL_ID,
  VOICE_CHANNEL_ID: process.env.VOICE_CHANNEL_ID as string,
  STAY_TIME_IN_SECONDS: Number(process.env.STAY_TIME_IN_SECONDS) || 60,
};
