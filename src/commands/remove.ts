import { Command } from '../interfaces/Command';

export default {
  name: 'remove',
  aliases: ['rm'],
  description: 'Remove a song from the queue',
  execute: async (client, message, args) => {
    const guildId = message.guildId;
    if (!guildId) throw new GuildNotFoundError();

    const queue = client.queues.get(guildId);
    if (!queue || !queue.tracks.length) {
      return message.channel.send('There is no queue.');
    }

    const removeIdx = args?.[0] ? parseInt(args[0]) : 1;
    if (removeIdx > queue.tracks.length) {
      return message.reply(`Track ${removeIdx} does not exist.`);
    }

    if (removeIdx === 1) {
      queue.player.stop(true);
      return message.channel.send(`Removed **${queue.tracks[0].title}**`);
    }

    const removedTrack = queue.tracks.splice(removeIdx - 1, 1)[0];
    return message.channel.send(`Removed **${removedTrack.title}**`);
  },
} as Command;
