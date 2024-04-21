import { TextChannel, VoiceBasedChannel } from 'discord.js';
import { Queue } from '../interfaces/Queue';
import { joinVoiceChannel } from '@discordjs/voice';
import { ENV } from '../utils/ENV';
import { Command } from '../interfaces/Command';
import { getTrack } from '../utils/getTrack';
import { SPOTIFY_TRACK_REGEX } from '../utils/helpers';

export default {
  name: 'radio',
  description: 'Start radio based on a spotify song',
  aliases: ['r'],
  async execute(client, message, args) {
    try {
      if (!args?.length) {
        return message.reply('Please a spotify song link');
      }

      const spotifyLink = args[0];
      if (!SPOTIFY_TRACK_REGEX.test(spotifyLink)) {
        return message.reply(
          'Sorry, only spotify songs are supported at this moment'
        );
      }

      const spotifyTrackId = spotifyLink.match(SPOTIFY_TRACK_REGEX)?.[1];
      if (!spotifyTrackId) {
        return message.reply('Invalid Spotify track URL');
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
        queue.isRadio = true;
        queue.enqueue(track);

        if (queue.tracks.length > 1) {
          message.channel.send(`Added to radio mix: **${track.title}**`);
        }

        return;
      }

      message.channel.send(`Starting radio based on **${track.title}**`);

      const newQueue = new Queue({
        message,
        textChannel: message.channel as TextChannel,
        isRadio: true,
        connection: joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId,
          adapterCreator: voiceChannel.guild.voiceAdapterCreator,
          selfDeaf: false,
        }),
      });

      client.queues.set(guildId, newQueue);
      newQueue.enqueue(track);
    } catch (error: any) {
      console.error(error);

      if (error instanceof Error) {
        return message.reply(error.message);
      }

      if (typeof error === 'string') {
        return message.reply(error);
      } else {
        return message.reply('Something went wrong');
      }
    }
  },
} as Command;
