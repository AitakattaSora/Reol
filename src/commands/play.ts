import { Message, TextChannel, VoiceBasedChannel } from 'discord.js';
import { MyClient } from '..';
import { Queue, Track } from '../interfaces/Queue';
import { joinVoiceChannel } from '@discordjs/voice';
import { getVideo } from '../utils/getVideo';
import { ENV } from '../utils/ENV';
import { Command } from '../interfaces/Command';

export default {
  name: 'play',
  description: 'Play a song from YouTube or Spotify',
  aliases: ['p'],
  async execute(client: MyClient, message: Message<boolean>, args: string[]) {
    try {
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
      const video = await getVideo(query);

      const queue = client.queues.get(guildId);
      const track = new Track(video.url, video.title, video.durationFormatted);
      if (queue) {
        queue.enqueue(track);

        return message.channel.send(`Added to queue: ${track.url}`);
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
