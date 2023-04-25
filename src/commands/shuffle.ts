import { Command } from '../interfaces/Command';

export default {
  name: 'shuffle',
  aliases: ['sh'],
  description: 'Shuffle the queue.',
  execute: async (client, message) => {
    try {
      const guildId = message.guildId;
      if (!guildId) throw new GuildNotFoundError();

      const queue = client.queues.get(guildId);
      if (!queue) {
        return message.channel.send('There is no queue.');
      }

      queue.shuffle();

      return message.channel.send('Queue shuffled.');
    } catch (error) {
      console.log(error);

      message.reply('There was an error executing the command.');
    }
  },
} as Command;
