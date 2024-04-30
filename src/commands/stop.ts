import { Command } from '../interfaces/Command';

export default {
  name: 'stop',
  description: 'Stop the music',
  async execute(client, message) {
    try {
      const guildId = message.guildId;
      if (!guildId) throw new GuildNotFoundError();

      const queue = client.queues.get(guildId);
      if (!queue) {
        return message.channel.send('There is no queue.');
      }

      queue.stop();

      queue.stopRadio();

      if (queue.isRadio) {
        message.channel.send('Radio mode disabled');
      } else {
        message.channel.send('Music stopped');
      }
    } catch (error) {
      console.log(error);

      message.reply('There was an error executing the command.');
    }
  },
} as Command;
