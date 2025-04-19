import {
  DiscordGatewayAdapterCreator,
  joinVoiceChannel,
} from '@discordjs/voice';
import { EmbedBuilder, TextChannel, VoiceBasedChannel } from 'discord.js';
import { getArtistDetails } from '../external/spotify/getArtistDetails';
import { getArtistTopTracks } from '../external/spotify/getArtistTopTracks';
import { getSpotifyArtistByQuery } from '../external/spotify/getSpotifyArtistByQuery';
import { getSpotifyTrackTitle } from '../external/spotify/utils/getSpotifyTrackTitle';
import { Command } from '../interfaces/Command';
import { Queue } from '../interfaces/Queue';
import { Track } from '../interfaces/Track';
import { ENV } from '../utils/ENV';
import {
  DEFAULT_COLOR,
  SPOTIFY_ARTIST_REGEX,
  URL_REGEX,
} from '../utils/helpers';
import { getYoutubeTrackByQuery } from '../utils/youtube/getYoutubeTrack';

export default {
  name: 'artistmusic',
  description: 'Play artists top tracks',
  aliases: ['am'],
  async execute(client, message, args) {
    try {
      if (!args?.length) {
        return message.reply('Please provide a search query or link');
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
      if (URL_REGEX.test(query) && !SPOTIFY_ARTIST_REGEX.test(query)) {
        throw new Error('Please provide a valid artist link or name');
      }

      const artist = SPOTIFY_ARTIST_REGEX.test(query)
        ? await getArtistDetails(
            query.match(SPOTIFY_ARTIST_REGEX)?.[1] as string
          )
        : await getSpotifyArtistByQuery(query);

      if (!artist) {
        return message.channel.send('Artist not found');
      }

      const spotifyTracks = await getArtistTopTracks(artist.id);
      if (!spotifyTracks.length) {
        throw new Error('No tracks found for this artist');
      }

      const youtubeTracks = await Promise.all(
        spotifyTracks.map(async (track) => {
          const title = getSpotifyTrackTitle(track);

          try {
            return await getYoutubeTrackByQuery(title);
          } catch (error) {
            console.error(`Error fetching track from YouTube: ${title}`, error);
            return null;
          }
        })
      );
      if (!youtubeTracks.length) {
        throw new Error("Couldn't find any tracks");
      }

      const tracks = youtubeTracks.filter((track) => track) as Track[];
      const queue = client.queues.get(guildId);
      if (queue) {
        queue.enqueue(...tracks);
      } else {
        const newQueue = new Queue({
          message,
          textChannel: message.channel as TextChannel,
          connection: joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId,
            adapterCreator: voiceChannel.guild
              .voiceAdapterCreator as DiscordGatewayAdapterCreator,
            selfDeaf: false,
          }),
        });

        client.queues.set(guildId, newQueue);
        newQueue.enqueue(...tracks);
      }

      const embed = new EmbedBuilder()
        .setDescription(`Playing top tracks for ${artist.name}`)
        .setURL(`https://open.spotify.com/artist/${artist.id}`)
        .setColor(DEFAULT_COLOR);

      tracks.forEach((track, idx) => {
        embed.addFields({
          name: `${idx + 1}. ${track.title}`,
          value: track.url,
        });
      });

      return message.channel.send({
        embeds: [embed],
      });
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
