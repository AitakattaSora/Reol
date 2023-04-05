import { EmbedBuilder } from 'discord.js';
import { Command } from '../interfaces/Command';
import { getLyrics } from '../utils/lyrics/getLyrics';
import { DEFAULT_COLOR } from '../utils/helpers';

export default {
  name: 'lyrics',
  aliases: ['l'],
  description: 'Get lyrics from query or current song.',
  async execute(client, message, args) {
    try {
      const guildId = message.guildId;
      if (!guildId) throw new GuildNotFoundError();

      const query = args?.join(' ');
      if (query) {
        const { lyrics, thumbnail, title, url } = await getLyrics(query);

        const lyricsEmbed = new EmbedBuilder()
          .setTitle(title)
          .setURL(url)
          .setDescription(lyrics)
          .setThumbnail(thumbnail)
          .setColor(DEFAULT_COLOR);

        return message.channel.send({ embeds: [lyricsEmbed] });
      }

      const queue = client.queues.get(guildId);
      if (!queue || !queue.tracks.length) {
        return message.channel.send('There is no queue.');
      }

      const track = queue.tracks[0];
      const { lyrics, thumbnail, title, url } = await getLyrics(
        track.metadata ? `${track.title} ${track.metadata}` : track.title
      );

      const lyricsEmbed = new EmbedBuilder()
        .setTitle(title)
        .setURL(url)
        .setDescription(lyrics)
        .setThumbnail(thumbnail)
        .setColor(DEFAULT_COLOR);

      return message.channel.send({ embeds: [lyricsEmbed] });
    } catch (error: any) {
      console.log(error);

      message.reply(
        error?.message || 'There was an error executing the command.'
      );
    }
  },
} as Command;
