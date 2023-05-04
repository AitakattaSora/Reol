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

    const tracks = await AppDataSource.manager.find(SongRequest, {
      order: {
        requestCount: 'DESC',
      },
      take: count,
    });

    if (!tracks.length) {
      return message.reply('No songs requested yet');
    }

    const description = tracks
      .map(
        (song, idx) =>
          `${idx + 1}. [${song.title}](${song.url}) - ${
            song.requestCount
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
