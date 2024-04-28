import { EmbedBuilder } from 'discord.js';
import getYouTubeID from 'get-youtube-id';
import { Command } from '../interfaces/Command';
import { ENV } from '../utils/ENV';
import { DEFAULT_COLOR } from '../utils/helpers';

export default {
  name: 'history',
  description: 'Show radio session history',
  async execute(client, message, args) {
    try {
      const guildId = message.guildId;
      if (!guildId) throw new GuildNotFoundError();

      const queue = client.queues.get(guildId);
      if (!queue || !queue.tracks.length) {
        return message.channel.send('There is no queue.');
      }

      const radioSessionTracks = queue.radioSessionTracks;
      if (!radioSessionTracks.length) {
        return message.channel.send('There is no radio session history.');
      }

      const PAGE_SIZE = 15;
      const pages = Math.ceil(radioSessionTracks.length / PAGE_SIZE);
      const page = args?.[0] ? parseInt(args[0]) : 1;

      if (page > pages) {
        return message.reply(`Page ${page} does not exist.`);
      }

      // find duplicate spotify ids and youtube urls
      const duplicateSpotifyIds = radioSessionTracks
        .map((track) => track.spotifyId)
        .filter((spotifyId, index, self) => self.indexOf(spotifyId) !== index);
      const duplicateYoutubeUrls = radioSessionTracks
        .map((track) => track.youtubeUrl)
        .filter(
          (youtubeUrl, index, self) => self.indexOf(youtubeUrl) !== index
        );

      if (duplicateSpotifyIds.length) {
        message.channel.send(
          `WARNING: Duplicate Spotify IDs found: ${[
            ...new Set(duplicateSpotifyIds),
          ].join(', ')}`
        );
      }

      if (duplicateYoutubeUrls.length) {
        message.channel.send(
          `WARNING: Duplicate YouTube URLs found: ${[
            ...new Set(duplicateYoutubeUrls),
          ]
            .map((l) => `<${l}>`)
            .join(', ')}`
        );
      }

      const queueEmbed = new EmbedBuilder();
      queueEmbed
        .setDescription('Radio session history')
        .setColor(DEFAULT_COLOR);

      radioSessionTracks
        .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
        .forEach((track, idx) => {
          const spotifyUrl = `https://open.spotify.com/track/${track.spotifyId}`;
          const youtubeUrl = track.youtubeUrl;
          const youtubeID = getYouTubeID(youtubeUrl);

          queueEmbed.addFields({
            name: `${idx + PAGE_SIZE * (page - 1) + 1}. ${track.title}`,
            value: `[${track.spotifyId}](${spotifyUrl}) / [${
              youtubeID || youtubeUrl
            }](${youtubeUrl})`,
          });
        });

      if (pages > 1) {
        queueEmbed
          .setAuthor({
            name: `Page ${page} of ${pages}`,
          })
          .setFooter({
            text: `${ENV.PREFIX}history <page> to view a specific page`,
          });
      }

      return message.channel.send({ embeds: [queueEmbed] });
    } catch (error) {
      console.log(error);

      message.reply('There was an error executing the command.');
    }
  },
} as Command;