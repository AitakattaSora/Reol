import { EmbedBuilder, Message } from 'discord.js';
import { MyClient } from '..';
import { Command } from '../interfaces/Command';

export default {
  name: 'queue',
  aliases: ['q'],
  description: 'Show the queue',
  async execute(client: MyClient, message: Message<boolean>) {
    try {
      const guildId = message.guildId;
      if (!guildId) throw new GuildNotFoundError();

      const queue = client.queues.get(guildId);
      if (!queue || !queue.tracks.length) {
        return message.channel.send('There is no queue.');
      }

      const queueEmbed = new EmbedBuilder()
        .setTitle('Queue')
        .setColor('#FFFFFF');

      queue.tracks.forEach((track, index) => {
        queueEmbed.addFields({
          name: `${index + 1}. ${track.title}`,
          value: `Duration: ${track.durationRaw}`,
        });
      });

      return message.reply({ embeds: [queueEmbed] });
    } catch (error) {
      console.log(error);

      message.reply('There was an error executing the command.');
    }
  },
} as Command;
