import { EmbedBuilder } from 'discord.js';
import { Command } from '../interfaces/Command';
import { ENV } from '../utils/ENV';
import { DEFAULT_COLOR, DEFAULT_THUMBNAIL } from '../utils/helpers';

export default {
  name: 'help',
  description: 'List all commands',
  aliases: ['h'],
  async execute(client, message) {
    const commands = client.commands;
    const helpEmbed = new EmbedBuilder()
      .setTitle('Help')
      .setThumbnail(DEFAULT_THUMBNAIL)
      .setColor(DEFAULT_COLOR);

    commands.forEach((cmd) => {
      helpEmbed.addFields({
        name: `**${ENV.PREFIX}${cmd.name}**`,
        value: `${cmd.description || 'No description'}`,
        inline: true,
      });
    });

    helpEmbed.addFields({
      name: 'Or just send a YouTube or Spotify link',
      value: 'and I will play it :)',
    });

    return message.reply({
      embeds: [helpEmbed],
    });
  },
} as Command;
