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
  async execute(_, message, args) {
    if (!ENV.USE_DB) {
      return message.reply('Song requests recording is not enabled');
    }

    const count = Number(args?.[0]) || 10;

    const songRequestRepository = AppDataSource.getRepository(SongRequest);
    const requests: Array<SongRequest & { count: number }> =
      await songRequestRepository
        .createQueryBuilder('song_request')
        .select(['id', 'title', 'url', 'COUNT(url) AS count'])
        .groupBy('url')
        .orderBy('COUNT(url)', 'DESC')
        .take(count)
        .getRawMany();

    if (!requests.length) {
      return message.reply('No songs requested yet');
    }

    const description = requests
      .map(
        (request, idx) =>
          `${idx + 1}. [${request.title}](${request.url}) - ${
            request.count
          } plays`
      )
      .join('\n');

    const embedDescription = truncateLongDescription(description);
    const topSongsEmbed = new EmbedBuilder()
      .setTitle('Top requested songs')
      .setDescription(embedDescription)
      .setColor(DEFAULT_COLOR);

    return message.channel.send({
      embeds: [topSongsEmbed],
    });
  },
} as Command;
