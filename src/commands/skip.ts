import { Command } from '../interfaces/Command';

export default {
  name: 'skip',
  description: 'Skip the current track',
  async execute(client, message) {
    try {
      const guildId = message.guildId;
      if (!guildId) throw new GuildNotFoundError();

      const queue = client.queues.get(guildId);
      if (!queue) {
        return message.channel.send('There is no queue.');
      }

      queue.player.stop(true);

      if (queue.tracks.length > 1) {
        return message.channel.send('Track skipped');
      }
    } catch (error) {
      console.log(error);

      message.reply('There was an error executing the command.');
    }
  },
} as Command;
