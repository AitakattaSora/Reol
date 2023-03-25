import { EmbedBuilder, Message } from 'discord.js';
import { MyClient } from '..';
import { Command } from '../interfaces/Command';
import { ENV } from '../utils/ENV';

export default {
  name: 'help',
  description: 'List all commands',
  aliases: ['h'],
  async execute(client: MyClient, message: Message<boolean>) {
    const commands = client.commands;
    const helpEmbed = new EmbedBuilder().setTitle('Help').setColor('#FFFFFF');

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

    helpEmbed.setTimestamp();

    return message.reply({
      embeds: [helpEmbed],
    });
  },
} as Command;
