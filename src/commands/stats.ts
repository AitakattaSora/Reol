import { AppDataSource } from '../db';
import { SongRequest } from '../db/entities/SongRequest';
import { Command } from '../interfaces/Command';
import { ENV } from '../utils/ENV';

export default {
  name: 'stats',
  description: 'Bot requests stats',
  async execute(client, message) {
    if (!ENV.USE_DB) {
      return message.reply('Song requests recording is not enabled');
    }

    const repository = AppDataSource.getRepository(SongRequest);
    const averageRequestsPerGuild = await repository
      .createQueryBuilder('song_request')
      .select('song_request.guildId', 'guildId')
      .addSelect('COUNT(*) / 30.0', 'average_requests_per_day')
      .where('song_request.requestedAt >= :date', {
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      })
      .groupBy('song_request.guildId')
      .getRawMany();

    const avg = await Promise.all(
      averageRequestsPerGuild.map(async (guild) => {
        const cached = client.guilds.cache.get(guild.guildId);
        if (cached) {
          return `${cached.name}: ${guild.average_requests_per_day}`;
        }

        const guildName = await client.guilds
          .fetch(guild.guildId)
          .then((guild) => guild.name);
        return `${guildName}: ${guild.average_requests_per_day}`;
      })
    );

    if (!avg.length) {
      return message.reply('No stats available');
    }

    message.reply(`Average requests per day:\n${avg.join('\n')}`);
  },
} as Command;
