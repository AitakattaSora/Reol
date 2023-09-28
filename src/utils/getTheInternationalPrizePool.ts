import axios from 'axios';
import { scheduleJob } from 'node-schedule';
import { MyClient } from '..';
import { VoiceBasedChannel } from 'discord.js';
import numeral from 'numeral';
import { ENV } from './ENV';

export async function getTheInternationalPrizePool() {
  const res = await axios.get(
    'https://www.dota2.com/webapi/IDOTA2League/GetLeagueData/v001?league_id=15728&delay_seconds=0'
  );

  const prizePool = res.data?.prize_pool?.total_prize_pool;
  if (!prizePool) {
    return null;
  }

  const prizePoolFormatted = numeral(prizePool).format('0.00a').toUpperCase();
  return prizePoolFormatted;
}

export async function schedulePrizePoolJob(
  client: MyClient,
  cron = '0 * * * *'
) {
  return scheduleJob(cron, async () => {
    try {
      const voiceChannelId = ENV.PRIZE_POOL_CHANNEL_ID;
      const voiceChannel = client.channels.cache.get(
        voiceChannelId
      ) as VoiceBasedChannel;

      if (!voiceChannel) {
        console.log('No channel');
        return;
      }

      const prizePool = await getTheInternationalPrizePool();
      if (!prizePool) {
        console.log('Failed to get prize pool');
        return null;
      }

      const newName = `PRIZE POOL: ${prizePool}`;
      console.log(
        `${new Date().toTimeString()}: Changing name to '${newName}'`
      );

      await voiceChannel.setName(newName);
    } catch (error) {
      throw error;
    }
  });
}
