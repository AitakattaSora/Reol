import { Command } from '../interfaces/Command';
import { AppDataSource } from '../db';
import { SongRequest } from '../db/entities/SongRequest';
import { EmbedBuilder } from 'discord.js';
import { DEFAULT_COLOR } from '../utils/helpers';
import { truncateLongDescription } from '../utils/truncateDescription';
import { ENV } from '../utils/ENV';

export default {
  name: 'top',
  description: 'List the top requested songs',
  async execute(client, message, args) {
    if (!ENV.USE_DB) {
      return message.reply('Song requests recording is not enabled');
    }

    const count = Number(args?.[0]) || 10;
    const guildId = message.guildId;

    const songRequestRepository = AppDataSource.getRepository(SongRequest);
    const requests: Array<SongRequest & { count: number }> =
      await songRequestRepository
        .createQueryBuilder('song_request')
        .select(['id', 'title', 'url', 'COUNT(url) AS count'])
        .where('guildId = :guildId', { guildId })
        .groupBy('url')
        .orderBy('COUNT(url)', 'DESC')
        .take(count)
        .getRawMany();

    if (!requests.length) {
      return message.reply('No songs requested yet');
    }

    const mostRequestedDescription = requests
      .map(
        (request, idx) =>
          `${idx + 1}. [${request.title}](${request.url}) - ${
            request.count
          } plays`
      )
      .join('\n');

    const topSongsEmbed = new EmbedBuilder()
      .setTitle('Top requested songs')
      .setDescription(truncateLongDescription(mostRequestedDescription))
      .setColor(DEFAULT_COLOR);

    const topRequesters: Array<{ count: number; requestedBy: string }> =
      await songRequestRepository
        .createQueryBuilder('sr')
        .select('sr.requestedBy', 'requestedBy')
        .addSelect('COUNT(sr.requestedBy)', 'count')
        .where('sr.guildId = :guildId', { guildId })
        .groupBy('sr.requestedBy')
        .orderBy('COUNT(sr.requestedBy)', 'DESC')
        .getRawMany();

    const requesters = await Promise.all(
      topRequesters
        .filter((r) => r.requestedBy !== 'bot')
        .map(async (requester) => {
          const user = await client.users.fetch(requester.requestedBy);
          return {
            count: requester.count,
            user,
          };
        })
    );

    const requestersDescription = requesters
      .map((r, idx) => `${idx + 1}. ${r.user.displayName} - ${r.count} times`)
      .join('\n');

    const topRequestersEmbed = new EmbedBuilder()
      .setTitle('Top requesters')
      .setDescription(truncateLongDescription(requestersDescription))
      .setColor(DEFAULT_COLOR);

    message.channel.send({
      embeds: [topSongsEmbed, topRequestersEmbed],
    });
  },
} as Command;
