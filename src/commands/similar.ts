import { EmbedBuilder, VoiceBasedChannel } from 'discord.js';
import { ENV } from '../utils/ENV';
import { Command } from '../interfaces/Command';
import { DEFAULT_COLOR } from '../utils/helpers';
import { getSpotifyTrackId } from '../utils/spotify/getSpotifyTrackId';
import { getSimilarTracks } from '../external/spotify/getSimilarTracks';

export default {
  name: 'similar',
  description: 'Show similar spotify tracks',
  async execute(client, message, args) {
    try {
      if (!args?.length) {
        return message.reply('Please a spotify song link');
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

      const similarTracks = await getSimilarTracks(spotifyTrackId);
      if (similarTracks.length === 0) {
        return message.reply('No similar tracks found');
      }

      const tracksEmbed = new EmbedBuilder()
        .setTitle(`Similar track to ${similarTracks[0].title}`)
        // .setDescription(embedDescription)
        .setColor(DEFAULT_COLOR);

      similarTracks.slice(1, 21).forEach((track, idx) => {
        tracksEmbed.addFields({
          name: `${idx + 1}. ${track.title}`,
          value: `https://open.spotify.com/track/${track.id}`,
        });
      });

      return message.channel.send({
        embeds: [tracksEmbed],
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
