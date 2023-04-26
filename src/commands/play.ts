import { TextChannel, VoiceBasedChannel } from 'discord.js';
import { Queue } from '../interfaces/Queue';
import { joinVoiceChannel } from '@discordjs/voice';
import { ENV } from '../utils/ENV';
import { Command } from '../interfaces/Command';
import { getTrack } from '../utils/getTrack';
import { isPlaylist } from '../utils/helpers';

export default {
  name: 'play',
  description: 'Play a song from YouTube or Spotify',
  aliases: ['p'],
  async execute(client, message, args) {
    try {
      if (!args?.length) {
        return message.reply('Please provide a search query or link');
      }

      if (isPlaylist(args[0])) {
        return client.commands
          .get('playlist')
          .execute(client, message, [args[0]]);
      }

      if (!message.channel) {
        return message.reply('Channel not found');
      }

      const voiceChannel =
        message.member?.voice.channel ||
        (client.channels.cache.get(ENV.VOICE_CHANNEL_ID) as VoiceBasedChannel);

      if (!voiceChannel) {
        return message.reply(
          'Please join a voice channel or set a voice channel in the .env file.'
        );
      }

      const guildId = message.guildId;
      if (!guildId) throw new GuildNotFoundError();

      const query = args.join(' ');
      const track = await getTrack(query);

      const queue = client.queues.get(guildId);
      if (queue) {
        queue.enqueue(track);

        if (queue.tracks.length > 1) {
          message.channel.send(`Added to queue: **${track.title}**`);
        }

        return;
      }

      const newQueue = new Queue({
        message,
        textChannel: message.channel as TextChannel,
        connection: joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId,
          adapterCreator: voiceChannel.guild.voiceAdapterCreator,
          selfDeaf: false,
        }),
      });

      client.queues.set(guildId, newQueue);
      newQueue.enqueue(track);
    } catch (error) {
      console.error(error);
      if (typeof error === 'string') {
        return message.reply(error);
      } else {
        return message.reply('Something went wrong');
      }
    }
  },
} as Command;
