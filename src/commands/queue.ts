import { EmbedBuilder } from 'discord.js';
import { Command } from '../interfaces/Command';
import { ENV } from '../utils/ENV';
import { DEFAULT_COLOR } from '../utils/helpers';

export default {
  name: 'queue',
  aliases: ['q'],
  description: 'Show the queue',
  async execute(client, message, args) {
    try {
      const guildId = message.guildId;
      if (!guildId) throw new GuildNotFoundError();

      const queue = client.queues.get(guildId);
      if (!queue || !queue.tracks.length) {
        return message.channel.send('There is no queue.');
      }

      const tracks = queue.tracks;

      const PAGE_SIZE = 10;
      const pages = Math.ceil(tracks.length / PAGE_SIZE);
      const page = args?.[0] ? parseInt(args[0]) : 1;

      if (page > pages) {
        return message.reply(`Page ${page} does not exist.`);
      }

      const queueEmbed = new EmbedBuilder();
      queueEmbed
        .setTitle(`${tracks.length} tracks`)
        .setThumbnail(message.guild?.iconURL() || null)
        .setColor(DEFAULT_COLOR);

      tracks
        .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
        .forEach((track, idx) => {
          queueEmbed.addFields({
            name: `${idx + PAGE_SIZE * (page - 1) + 1}. ${track.title}`,
            value: `Duration: ${track.durationRaw}`,
          });
        });

      if (pages > 1) {
        queueEmbed
          .setTitle(`${tracks.length} tracks - Page ${page} of ${pages}`)
          .setFooter({
            text: `${ENV.PREFIX}queue <page> to view a specific page`,
          });
      }

      return message.reply({ embeds: [queueEmbed] });
    } catch (error) {
      console.log(error);

      message.reply('There was an error executing the command.');
    }
  },
} as Command;
