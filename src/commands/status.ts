import { EmbedBuilder } from 'discord.js';
import { Command } from '../interfaces/Command';
import { ENV } from '../utils/ENV';
import { DEFAULT_COLOR, DEFAULT_THUMBNAIL } from '../utils/helpers';

export default {
  name: 'status',
  description: 'Show bot status',
  aliases: [],
  isAdmin: true,
  async execute(client, message) {
    const isAdmin = ENV.ADMINS.includes(message.author.id);
    if (!isAdmin) return;

    const servers = client.guilds.cache.map((guild) => ({
      id: guild.id,
      name: guild.name,
      isPlaying:
        client.queues.get(guild.id)?.player?.state?.status === 'playing',
      queueLength: client.queues.get(guild.id)?.tracks?.length || 0,
    }));

    const statusEmbed = new EmbedBuilder()
      .setTitle((client.user?.displayName || 'Bot') + ' status')
      .setThumbnail(DEFAULT_THUMBNAIL)
      .setColor(DEFAULT_COLOR);

    servers.forEach((server) => {
      statusEmbed.addFields({
        name: server.name,
        value: `Playing: ${server.isPlaying ? 'Yes' : 'No'}\nQueue: ${
          server.queueLength
        } tracks`,
      });
    });

    return message.channel.send({ embeds: [statusEmbed] });
  },
} as Command;
