import { TextChannel, VoiceBasedChannel } from 'discord.js';
import { Queue } from '../interfaces/Queue';
import { joinVoiceChannel } from '@discordjs/voice';
import { ENV } from '../utils/ENV';
import { Command } from '../interfaces/Command';
import { getTrack } from '../utils/getTrack';
import { isSpotifyURL } from '../utils/helpers';
import { getSpotifyTrackId } from '../utils/spotify/getSpotifyTrackId';
import { getTrackDetails } from '../external/spotify/getTrackDetails';
import { getSpotifyTrackTitle } from '../external/spotify/utils/getSpotifyTrackTitle';

export default {
  name: 'radio',
  description: 'Start radio based on a spotify song',
  aliases: ['r'],
  async execute(client, message, args) {
    try {
      if (!args?.length) {
        return message.reply('Please a spotify song link');
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

      const spotifyTrackId = await getSpotifyTrackId(query);
      if (!spotifyTrackId) {
        return message.reply(`Unable find spotify track from: ${query}`);
      }

      const spotifyTrack = await getTrackDetails(spotifyTrackId);
      const spotifyTrackTitle = getSpotifyTrackTitle(spotifyTrack);
      const track = await getTrack(
        isSpotifyURL(query) ? `${spotifyTrackTitle} lyrics` : query
      );

      if (!spotifyTrack) {
        throw new Error(`Unable to get spotify track for ${spotifyTrackId}`);
      }

      track.metadata = {
        artist: spotifyTrack.artists[0].name,
        title: spotifyTrack.name,
        spotifyTrackId,
      };

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
